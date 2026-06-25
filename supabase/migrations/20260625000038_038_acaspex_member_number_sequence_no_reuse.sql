-- ACASPEX Portal Socios — Member number no reutilizable
-- Cambia la generación ACX-XXXX a secuencia monotónica para no reutilizar
-- números aunque se eliminen socios.

create sequence if not exists public.members_member_number_seq;

do $$
declare
  v_max integer;
begin
  select coalesce(max((substring(member_number from '^ACX-([0-9]+)$'))::integer), 0)
  into v_max
  from public.members
  where member_number ~ '^ACX-[0-9]+$';

  if v_max <= 0 then
    perform setval('public.members_member_number_seq', 1, false);
  else
    perform setval('public.members_member_number_seq', v_max, true);
  end if;
end $$;

create or replace function public.generate_member_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_candidate text;
begin
  if new.member_number is not null and btrim(new.member_number) <> '' then
    return new;
  end if;

  loop
    v_candidate := 'ACX-' || lpad(nextval('public.members_member_number_seq')::text, 4, '0');

    exit when not exists (
      select 1
      from public.members
      where member_number = v_candidate
    );
  end loop;

  new.member_number := v_candidate;
  return new;
end;
$$;

comment on function public.generate_member_number() is
  'Genera member_number ACX-XXXX mediante secuencia monotónica. No reutiliza números eliminados y respeta números informados/importados.';
