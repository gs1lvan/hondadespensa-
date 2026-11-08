begin;

create table public.categorias_despensa (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique check (btrim(nombre) <> ''),
  icono text not null default '🧺' check (char_length(icono) between 1 and 16),
  nombres_anteriores text[] not null default '{}',
  unique (id, nombre)
);

alter table public.categorias_despensa enable row level security;
revoke all on public.categorias_despensa from public, anon;
grant select, insert, update, delete on public.categorias_despensa to authenticated;
-- La despensa de este proyecto es compartida entre sus cuentas autenticadas.
create policy categorias_despensa_compartidas on public.categorias_despensa
  for all to authenticated using (true) with check (true);

create function public.icono_inicial_despensa(nombre text) returns text
language sql immutable set search_path = '' as $$
  select case
    when normalized ~ 'especia|condimento' then '🌿'
    when normalized ~ 'salsa|aderezo' then '🍅'
    when normalized ~ 'arroz|pasta|cereal|cuscus' then '🍚'
    when normalized ~ 'harina|reposteria|pan' then '🍞'
    when normalized ~ 'pescado|marisco' then '🐟'
    when normalized ~ 'legumbre|proteina vegetal' then '🫘'
    when normalized ~ 'aceite|vinagre' then '🫒'
    when normalized ~ 'leche|lacteo|desayuno' then '🥛'
    when normalized ~ 'fruto seco|aperitivo' then '🥜'
    when normalized ~ 'verdura|hortaliza|encurtido' then '🥕'
    when normalized ~ 'carne|embutido' then '🥩'
    when normalized ~ 'bebida|suplemento' then '🧃'
    when normalized ~ 'fruta' then '🍎'
    when normalized ~ 'azucar|endulzante' then '🍯'
    when normalized ~ 'dulce|mermelada' then '🍬'
    when normalized ~ 'conserva' then '🥫'
    when normalized ~ 'congelado' then '❄️'
    when normalized ~ 'mascota' then '🐾'
    when normalized ~ 'limpieza' then '🧽'
    when normalized ~ 'higiene' then '🧴'
    when normalized ~ 'hogar|papel' then '🏠'
    when normalized ~ 'bebe' then '🍼'
    else coalesce(substring(nombre from '^([^[:alnum:][:space:]]+)[[:space:]]'), '🧺')
  end
  from (select translate(lower(regexp_replace(nombre, '^[^[:alnum:]]+', '')),
    'áéíóúüñ', 'aeiouun') as normalized) as nombre_normalizado;
$$;

alter table public.alimentos add column categoria_id uuid;

-- Conserva también las categorías vacías que se guardaban en cada cuenta.
insert into public.categorias_despensa (nombre, icono)
select nombre, public.icono_inicial_despensa(nombre)
from (
  select categoria as nombre from public.alimentos
  union
  select categoria.nombre from auth.users u
  cross join lateral jsonb_array_elements_text(
    case when jsonb_typeof(u.raw_user_meta_data -> 'pantry_categories') = 'array'
      then u.raw_user_meta_data -> 'pantry_categories' else '[]'::jsonb end
  ) as categoria(nombre)
) as anteriores
where btrim(nombre) <> '';

update public.alimentos a set categoria_id = c.id
from public.categorias_despensa c where c.nombre = a.categoria;

alter table public.alimentos alter column categoria_id set not null;
alter table public.alimentos add constraint alimentos_categoria_despensa_fk
  foreign key (categoria_id, categoria)
  references public.categorias_despensa (id, nombre) on update cascade;
create index alimentos_categoria_despensa_idx on public.alimentos (categoria_id);

create function public.enlazar_categoria_despensa() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' and new.categoria_id is not null then
    select nombre into new.categoria from public.categorias_despensa
    where id = new.categoria_id;
    if not found then
      raise exception 'La categoría indicada no existe';
    end if;
    return new;
  end if;

  if new.categoria_id is not null and exists (
    select 1 from public.categorias_despensa where id = new.categoria_id and nombre = new.categoria
  ) then
    return new;
  end if;

  select id, nombre into new.categoria_id, new.categoria
  from public.categorias_despensa
  where nombre = new.categoria or new.categoria = any(nombres_anteriores)
  order by (nombre = new.categoria) desc, id
  limit 1;

  if new.categoria_id is null then
    raise exception 'La categoría indicada no existe';
  end if;
  return new;
end;
$$;

create trigger alimentos_enlazar_categoria
before insert or update of categoria, categoria_id on public.alimentos
for each row execute function public.enlazar_categoria_despensa();

create function public.recordar_nombre_categoria_despensa() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.nombre <> new.nombre then
    new.nombres_anteriores := array_append(old.nombres_anteriores, old.nombre);
  end if;
  return new;
end;
$$;

create trigger categorias_despensa_recordar_nombre before update of nombre
on public.categorias_despensa for each row
execute function public.recordar_nombre_categoria_despensa();

commit;
