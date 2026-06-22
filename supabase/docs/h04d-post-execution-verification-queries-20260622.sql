-- ============================================================================
-- H0.4d — Queries de verificación post-ejecución Supabase staging ACASPEX
-- ============================================================================
-- Solo queries SELECT de solo lectura. No modifica datos, no crea ni destruye
-- objetos. Ejecutar después de haber aplicado las migraciones 001–018 en orden.
-- No contiene datos reales ni secrets.
-- ============================================================================

-- 1. TABLAS CREADAS
-- Verifica que las 9 tablas del schema existen.
-- Resultado esperado: 9 filas.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE'
order by table_name;

-- 2. ENUMS / TIPOS CREADOS
-- Verifica que los tipos enumerados existen.
-- Resultado esperado: al menos app_role, document_type, member_profile,
-- member_status, signup_request_status, payment_method, payment_status,
-- membership_period_status, resource_status, resource_type.
select typname
from pg_type
where typtype = 'e'
  and typnamespace = (select oid from pg_namespace where nspname = 'public')
order by typname;

-- 3. RLS ACTIVADO
-- Verifica que las 9 tablas tienen RLS activado.
-- Resultado esperado: 9 filas con rowsecurity = true.
select relname as table_name, relrowsecurity as rls_enabled
from pg_class
where relnamespace = (select oid from pg_namespace where nspname = 'public')
  and relkind = 'r'
  and relname in (
    'profiles', 'members', 'signup_requests', 'payments',
    'membership_periods', 'resource_categories', 'resources',
    'resource_visibility', 'audit_log'
  )
order by relname;

-- 4. POLICIES RLS POR TABLA
-- Lista todas las policies RLS en tablas públicas.
-- Resultado esperado: policies sobre las 9 tablas con RLS.
select schemaname, tablename, policyname, permissive, cmd
from pg_policies
where schemaname = 'public'
order by tablename, cmd;

-- 4a. Policies esperadas por tabla (conteo mínimo)
-- profiles: >= 3
-- members: >= 3
-- signup_requests: >= 3
-- payments: >= 3
-- membership_periods: >= 3
-- resource_categories: >= 3
-- resources: >= 3
-- resource_visibility: >= 4
-- audit_log: = 1
select tablename, count(*) as policy_count
from pg_policies
where schemaname = 'public'
group by tablename
order by tablename;

-- 5. FUNCIONES AUXILIARES
-- Verifica que las funciones helper existen.
-- Resultado esperado: 6 filas con las funciones listadas.
select proname
from pg_proc
where pronamespace = (select oid from pg_namespace where nspname = 'public')
  and proname in (
    'current_app_role',
    'is_admin',
    'is_junta_or_admin',
    'is_socio_or_higher',
    'can_access_resource_by_visibility',
    'can_access_resource_file_object'
  )
order by proname;

-- 5a. Verificación de security definer en helpers
-- Todas las funciones auxiliares deben ser security definer.
select proname, prosecdef as security_definer
from pg_proc
where pronamespace = (select oid from pg_namespace where nspname = 'public')
  and proname in (
    'current_app_role',
    'is_admin',
    'is_junta_or_admin',
    'is_socio_or_higher',
    'can_access_resource_by_visibility',
    'can_access_resource_file_object'
  )
order by proname;

-- 6. BUCKETS STORAGE
-- Verifica que los 3 buckets existen.
-- Resultado esperado: 3 filas con los buckets listados.
select id, name, public, file_size_limit
from storage.buckets
where id in (
  'acaspex-payment-receipts',
  'acaspex-reduced-fee-accreditations',
  'acaspex-resource-files'
)
order by id;

-- 6a. Buckets privados
-- Verifica que los 3 buckets tienen public = false.
-- Resultado esperado: 3 filas, todas con public = false.
select id, public
from storage.buckets
where id in (
  'acaspex-payment-receipts',
  'acaspex-reduced-fee-accreditations',
  'acaspex-resource-files'
)
  and public = false;

-- 7. POLICIES STORAGE
-- Verifica que existen policies sobre storage.objects.
-- Muestra policyname, cmd, qual y with_check.
-- Las policies de SELECT/UPDATE/DELETE pueden tener la condición en qual.
-- Las policies de INSERT pueden tener la condición en with_check.
-- Resultado esperado: policies con bucket_id = los buckets ACASPEX.
select policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
order by policyname;

-- 7a. Storage policies ACASPEX (busca en qual y with_check)
-- Busca 'acaspex' en ambos campos porque las policies de INSERT
-- pueden tener la condición en with_check, no en qual.
-- Resultado esperado: varias policies.
select policyname, cmd
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and (
    coalesce(qual, '') ilike '%acaspex%'
    or coalesce(with_check, '') ilike '%acaspex%'
  )
order by policyname;

-- ============================================================================
-- FIN de queries de verificación.
-- Si todos los resultados coinciden con los esperados, la instalación está
-- completa y lista para H0.6 (conexión frontend).
-- No continuar con datos reales hasta que Sil lo autorice.
-- ============================================================================
