-- ACASPEX Portal Socios — Conference function EXECUTE hardening
-- Depende de: 048, 051, 052, 056 y 057.
--
-- Objetivo:
-- - impedir llamadas anónimas/directas a helpers SECURITY DEFINER;
-- - conservar únicamente el acceso autenticado necesario para las policies RLS;
-- - mantener la función de trigger fuera de la API.

-- Helpers usados por las policies y RPC del módulo de jornadas.
revoke all on function public.is_comite_cientifico() from public;
revoke all on function public.is_comite_cientifico() from anon;
revoke all on function public.is_comite_cientifico() from authenticated;

revoke all on function public.is_reviewer_for_submission(uuid) from public;
revoke all on function public.is_reviewer_for_submission(uuid) from anon;
revoke all on function public.is_reviewer_for_submission(uuid) from authenticated;

grant execute on function public.is_comite_cientifico() to authenticated;
grant execute on function public.is_reviewer_for_submission(uuid) to authenticated;

-- Función interna invocada exclusivamente por el trigger BEFORE INSERT.
-- El cliente no debe poder llamarla como RPC.
revoke all on function public.set_conference_submission_code() from public;
revoke all on function public.set_conference_submission_code() from anon;
revoke all on function public.set_conference_submission_code() from authenticated;
