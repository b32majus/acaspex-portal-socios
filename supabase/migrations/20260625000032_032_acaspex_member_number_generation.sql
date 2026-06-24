-- ACASPEX Portal Socios — Generación automática de member_number
-- H0.9B: trigger before insert que asigna ACX-XXXX si member_number está vacío.
-- Si viene informado (importación), se respeta el valor existente.

create or replace function public.generate_member_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next integer;
begin
  if new.member_number is not null and new.member_number != '' then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtext('acaspex_members_member_number'));

  select coalesce(
    max(nullif(regexp_replace(member_number, '^ACX-0*', ''), '')::integer),
    0
  ) + 1 into v_next
  from public.members
  where member_number ~ '^ACX-[0-9]{4}$';

  new.member_number := 'ACX-' || lpad(v_next::text, 4, '0');
  return new;
end;
$$;

comment on function public.generate_member_number() is
  'Genera member_number ACX-XXXX autoincremental si no viene informado. Respeta números existentes (importación).';

create trigger trg_members_generate_number
  before insert on public.members
  for each row
  execute function public.generate_member_number();
