-- ACASPEX Portal Socios — grants de acceso sobre signup_requests
-- H0.9D-B
-- Concede INSERT a anon y authenticated para el formulario público.
-- Concede SELECT y UPDATE a authenticated para bandeja admin.
-- No concede DELETE sobre signup_requests.

grant insert on public.signup_requests to anon, authenticated;
grant select, update on public.signup_requests to authenticated;

comment on table public.signup_requests is
  'Solicitudes del formulario público. INSERT para anon/authenticated, SELECT/UPDATE para authenticated, gobernado por RLS.';
