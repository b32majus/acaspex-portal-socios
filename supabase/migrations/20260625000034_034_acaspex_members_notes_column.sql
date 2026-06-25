-- ACASPEX Portal Socios — Notes internas de socio
-- H0.9B-STAGING-FIX1: alinea schema remoto con frontend H0.9B.
-- Campo administrativo opcional para notas internas del socio.

alter table public.members
add column if not exists notes text;

comment on column public.members.notes is
  'Notas internas administrativas del socio. No visible para el socio en H0.9B.';
