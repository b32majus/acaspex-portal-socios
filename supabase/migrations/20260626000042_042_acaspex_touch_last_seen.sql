-- ACASPEX Portal Socios — RPC segura para last_seen_at
-- H0.9C-B5
-- Permite a un usuario autenticado actualizar su propio last_seen_at
-- sin exponer UPDATE general sobre profiles.
-- No modifica role, is_active, member_id, email ni email_normalized.
-- Throttle: solo actualiza si last_seen_at es null o >15 min del último update.

create or replace function public.touch_own_profile_last_seen()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last_seen_at timestamptz;
begin
  if auth.uid() is null then
    return null;
  end if;

  update public.profiles
  set
    last_seen_at = now(),
    updated_at = now()
  where id = auth.uid()
    and is_active = true
    and (
      last_seen_at is null
      or last_seen_at < now() - interval '15 minutes'
    )
  returning last_seen_at into v_last_seen_at;

  if v_last_seen_at is not null then
    return v_last_seen_at;
  end if;

  select last_seen_at
  into v_last_seen_at
  from public.profiles
  where id = auth.uid()
    and is_active = true;

  return v_last_seen_at;
end;
$$;

comment on function public.touch_own_profile_last_seen() is
  'Actualiza last_seen_at del perfil activo del usuario autenticado. Throttle 15 min. No modifica campos sensibles.';

grant execute on function public.touch_own_profile_last_seen() to authenticated;
