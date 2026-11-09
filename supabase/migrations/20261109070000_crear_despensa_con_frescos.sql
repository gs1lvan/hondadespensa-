begin;

-- La sobrecarga conserva la función actual para las llamadas sin frescos.
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
begin
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
