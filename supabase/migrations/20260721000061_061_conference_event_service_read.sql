-- ACASPEX Portal Socios — lectura interna del estado de la III Jornada v2
-- Depende de: 060.
--
-- La Edge Function pública consulta únicamente la configuración general del
-- evento con service_role. RLS continúa activa y no se conceden permisos a
-- anon ni a authenticated mediante esta migración.

grant select on public.conference_events to service_role;
