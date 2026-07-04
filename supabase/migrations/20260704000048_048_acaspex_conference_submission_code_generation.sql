-- ACASPEX Portal Socios — Generación automática de código de comunicación
-- B03: trigger before insert que asigna P001, P002, etc. usando conference_event_counters.
-- Operación atómica via UPDATE ... RETURNING. No usa MAX+1, secuencias ni advisory locks.

create or replace function public.set_conference_submission_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next integer;
begin
  insert into public.conference_event_counters (event_id, next_code)
  values (new.event_id, 1)
  on conflict (event_id) do nothing;

  update public.conference_event_counters
  set next_code = next_code + 1
  where event_id = new.event_id
  returning next_code - 1 into v_next;

  new.submission_code := 'P' || lpad(v_next::text, 3, '0');
  return new;
end;
$$;

comment on function public.set_conference_submission_code() is
  'Genera siempre submission_code (P001, P002, ...) por evento al insertar una comunicación. '
  'Operación atómica via UPDATE RETURNING sobre conference_event_counters. '
  'No reutiliza códigos. No respeta ningún valor entrante: el código siempre lo asigna el sistema. '
  'Si en el futuro se necesita importación administrativa con códigos manuales, será otra función/flujo separado.';

drop trigger if exists set_conference_submission_code_before_insert on public.conference_submissions;
create trigger set_conference_submission_code_before_insert
before insert on public.conference_submissions
for each row
execute function public.set_conference_submission_code();
