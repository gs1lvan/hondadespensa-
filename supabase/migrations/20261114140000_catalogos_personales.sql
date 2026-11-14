begin;

create table public.catalogos_personales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (nombre = btrim(nombre) and char_length(nombre) between 1 and 100),
  contenido jsonb not null,
  predeterminado boolean not null default false
);
create unique index catalogos_personales_nombre on public.catalogos_personales (lower(nombre));
create unique index catalogos_personales_un_predeterminado
  on public.catalogos_personales (predeterminado) where predeterminado;

alter table public.catalogos_personales enable row level security;
revoke all on public.catalogos_personales from public, anon, authenticated;
grant select, delete on public.catalogos_personales to authenticated;
grant insert (nombre, contenido), update (nombre, contenido) on public.catalogos_personales to authenticated;

create function public.es_administrador_catalogos() returns boolean
language sql stable set search_path = ''
as $$ select coalesce(auth.uid() = 'd0f8ab40-f2ea-43e5-9bd0-d7cebdd1fa59'::uuid, false) $$;
revoke all on function public.es_administrador_catalogos() from public, anon;
grant execute on function public.es_administrador_catalogos() to authenticated;

create policy catalogos_personales_administrador on public.catalogos_personales
  for all to authenticated using (public.es_administrador_catalogos())
  with check (public.es_administrador_catalogos());

create function public.validar_catalogo_personal() returns trigger
language plpgsql set search_path = ''
as $$
declare
  grupo text;
  categoria jsonb;
  alimento jsonb;
  nombre text;
  nombres text[] := '{}';
  alimentos text[];
begin
  if jsonb_typeof(new.contenido) is distinct from 'object'
     or new.contenido->'version' is distinct from '1'::jsonb then
    raise exception 'Formato de catálogo no válido.';
  end if;
  foreach grupo in array array['secos', 'frescos'] loop
    if jsonb_typeof(new.contenido->grupo) is distinct from 'array' then
      raise exception 'El catálogo debe incluir listas de secos y frescos.';
    end if;
    for categoria in select value from jsonb_array_elements(new.contenido->grupo) loop
      if jsonb_typeof(categoria->'nombre') is distinct from 'string'
         or char_length(btrim(categoria->>'nombre')) not between 1 and 120
         or jsonb_typeof(categoria->'icono') is distinct from 'string'
         or char_length(btrim(categoria->>'icono')) not between 1 and 16
         or jsonb_typeof(categoria->'alimentos') is distinct from 'array' then
        raise exception 'Hay una categoría con nombre, icono o alimentos no válidos.';
      end if;
      nombre := lower(btrim(categoria->>'nombre'));
      if nombre = any(nombres) then
        raise exception 'La categoría «%» está repetida.', categoria->>'nombre';
      end if;
      nombres := array_append(nombres, nombre);
      alimentos := '{}';
      for alimento in select value from jsonb_array_elements(categoria->'alimentos') loop
        if jsonb_typeof(alimento) is distinct from 'string'
           or char_length(btrim(alimento #>> '{}')) not between 1 and 100 then
          raise exception 'Hay un nombre de alimento no válido.';
        end if;
        nombre := lower(btrim(alimento #>> '{}'));
        if nombre = any(alimentos) then
          raise exception 'Hay alimentos repetidos en «%».', categoria->>'nombre';
        end if;
        alimentos := array_append(alimentos, nombre);
      end loop;
    end loop;
  end loop;
  if cardinality(nombres) = 0 then
    raise exception 'Añade al menos una categoría.';
  end if;
  return new;
end;
$$;
create trigger catalogos_personales_validar before insert or update of contenido
on public.catalogos_personales for each row execute function public.validar_catalogo_personal();

create function public.fijar_catalogo_predeterminado(p_catalogo_id uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.es_administrador_catalogos() then
    raise exception 'Solo el administrador puede elegir el catálogo predeterminado.' using errcode = '42501';
  end if;
  lock table public.catalogos_personales in share row exclusive mode;
  update public.catalogos_personales set predeterminado = false where predeterminado;
  if p_catalogo_id is not null then
    update public.catalogos_personales set predeterminado = true where id = p_catalogo_id;
    if not found then raise exception 'El catálogo ya no existe.'; end if;
  end if;
end;
$$;
revoke all on function public.fijar_catalogo_predeterminado(uuid) from public, anon;
grant execute on function public.fijar_catalogo_predeterminado(uuid) to authenticated;

alter table public.categorias_despensa add column grupo_catalogo text
  check (grupo_catalogo in ('secos', 'frescos'));

-- Sirve el catálogo activo a la función de alta sin abrir la tabla al resto de usuarios.
create function public.contenido_catalogo_predeterminado() returns jsonb
language sql stable security definer set search_path = ''
as $$ select contenido from public.catalogos_personales where predeterminado $$;
revoke all on function public.contenido_catalogo_predeterminado() from public, anon;
grant execute on function public.contenido_catalogo_predeterminado() to authenticated;

create or replace function public.crear_despensa_personal(
  p_nombre text,
  p_icono text,
  p_cargar_catalogo boolean,
  p_frescos jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_despensa public.despensas.id%type;
  v_categoria public.categorias_despensa.id%type;
  grupo record;
  v_catalogo jsonb;
  v_grupo text;
  v_entrada jsonb;
begin
  if p_cargar_catalogo then
    v_catalogo := public.contenido_catalogo_predeterminado();
    if v_catalogo is not null then
      v_despensa := public.crear_despensa_personal(p_nombre, p_icono, false);
      foreach v_grupo in array array['secos', 'frescos'] loop
        for v_entrada in select value from jsonb_array_elements(v_catalogo->v_grupo) loop
          insert into public.categorias_despensa (despensa_id, nombre, icono, grupo_catalogo)
          values (v_despensa, btrim(v_entrada->>'nombre'), btrim(v_entrada->>'icono'), v_grupo)
          returning id into v_categoria;

          insert into public.alimentos (despensa_id, categoria_id, categoria, nombre, disponible)
          select v_despensa, v_categoria, btrim(v_entrada->>'nombre'), btrim(nombre), false
          from jsonb_array_elements_text(v_entrada->'alimentos') as alimento(nombre);
        end loop;
      end loop;
      return v_despensa;
    end if;
  end if;

  if jsonb_typeof(p_frescos) is distinct from 'array' then
    raise exception 'El catálogo de frescos debe ser una lista';
  end if;

  v_despensa := public.crear_despensa_personal(p_nombre, p_icono, p_cargar_catalogo);

  for grupo in
    select f.categoria, min(f.icono) as icono
    from jsonb_to_recordset(p_frescos) as f(categoria text, nombre text, icono text)
    where btrim(f.categoria) <> '' and btrim(f.nombre) <> ''
    group by f.categoria
  loop
    select c.id into v_categoria
    from public.categorias_despensa c
    where c.despensa_id = v_despensa
      and (c.nombre = grupo.categoria or grupo.categoria = any(c.nombres_anteriores))
    order by (c.nombre = grupo.categoria) desc, c.id
    limit 1;

    if v_categoria is null then
      insert into public.categorias_despensa (despensa_id, nombre, icono)
      values (v_despensa, grupo.categoria, coalesce(grupo.icono, '🧺'))
      returning id into v_categoria;
    end if;

    insert into public.alimentos (despensa_id, categoria_id, categoria, nombre, disponible)
    select distinct v_despensa, c.id, c.nombre, btrim(f.nombre), false
    from jsonb_to_recordset(p_frescos) as f(categoria text, nombre text)
    join public.categorias_despensa c on c.id = v_categoria
    where f.categoria = grupo.categoria and btrim(f.nombre) <> ''
      and not exists (
        select 1 from public.alimentos a
        where a.despensa_id = v_despensa
          and a.categoria_id = c.id
          and lower(a.nombre) = lower(btrim(f.nombre))
      );
  end loop;

  return v_despensa;
end;
$$;

revoke all on function public.crear_despensa_personal(text, text, boolean, jsonb) from public, anon;
grant execute on function public.crear_despensa_personal(text, text, boolean, jsonb) to authenticated;
notify pgrst, 'reload schema';

commit;
