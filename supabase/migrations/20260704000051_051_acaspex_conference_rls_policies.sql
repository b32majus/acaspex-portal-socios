-- ACASPEX Portal Socios — RLS policies para tablas de jornadas
-- B05: activa RLS y crea policies para conference_events, conference_submissions,
-- conference_reviewers, conference_submission_assignments, conference_submission_reviews,
-- conference_event_counters.
-- Depende de: B02 (tablas creadas), B02a (funciones auxiliares de rol en migración 002).
-- No crea Storage policies (van en B06).
-- No crea bucket (ya creado en B04-BACKEND).
-- No crea el rol comite_cientifico (va en B10).
-- Ejecutar solo tras revisión explícita.
-- No contiene datos reales ni secretos.
-- FIX1: Corregido WITH CHECK de insert público (eliminado submission_code is null).
-- FIX1: Reforzado WITH CHECK para proteger campos admin/file/poster/resolution.
-- FIX1: Doble condición para evaluadores (is_comite_cientifico AND is_reviewer_for_submission).
-- FIX1: Documentado flujo de P001 y file_path via RPC/Edge Function (B08).

-- ═══════════════════════════════════════════════════════════════════
-- MATRIZ DE PERMISOS (resumen ejecutivo)
-- ═══════════════════════════════════════════════════════════════════
--
-- TABLA: conference_events
-- ┌─────────────────────┬────────┬────────┬─────────────────────┬─────────────┐
-- │ Operación           │ anon   │ admin  │ comite_cientifico   │ autor       │
-- │                     │ /pub   │ /secr  │ /evaluador          │ sin login   │
-- ├─────────────────────┼────────┼────────┼─────────────────────┼─────────────┤
-- │ SELECT              │ NO     │ SI     │ NO (1)              │ NO          │
-- │ INSERT              │ NO     │ SI     │ NO                  │ NO          │
-- │ UPDATE              │ NO     │ SI     │ NO                  │ NO          │
-- │ DELETE              │ NO     │ NO (2) │ NO                  │ NO          │
-- └─────────────────────┴────────┴────────┴─────────────────────┴─────────────┘
-- (1) Evaluadores no necesitan ver eventos; solo submissions asignadas.
-- (2) Admin no borra eventos; los archiva cambiando status.
--
-- TABLA: conference_submissions
-- ┌─────────────────────┬────────┬────────┬─────────────────────┬─────────────┐
-- │ Operación           │ anon   │ admin  │ comite_cientifico   │ autor       │
-- │                     │ /pub   │ /secr  │ /evaluador          │ sin login   │
-- ├─────────────────────┼────────┼────────┼─────────────────────┼─────────────┤
-- │ SELECT              │ NO     │ SI     │ SI (3)              │ NO (4)      │
-- │ INSERT              │ SI (5) │ SI     │ NO                  │ SI (5)      │
-- │ UPDATE              │ NO     │ SI     │ NO (6)              │ NO          │
-- │ DELETE              │ NO     │ NO (2) │ NO                  │ NO          │
-- └─────────────────────┴────────┴────────┴─────────────────────┴─────────────┘
-- (3) Evaluadores ven SOLO: submission_code, title, abstract_text, topic_area,
--     modality. NO ven: authors_text, main_author_*, center, service_unit,
--     province, file_path, admin_notes, review_notes.
--     Esto se implementa con una vista SQL o función security definer en B05-BIS.
--     Por ahora, evaluadores NO tienen SELECT en conference_submissions.
-- (4) El autor no puede consultar sus propias submissions desde el cliente.
--     El código P001 se muestra en la confirmación post-insert.
-- (5) INSERT público con WITH CHECK estricto:
--     - status DEBE ser 'received' (default, no manipulable)
--     - admin_notes DEBE ser NULL (campo admin)
--     - review_notes DEBE ser NULL (campo admin)
--     - file_path DEBE ser NULL (se completa via RPC en B08)
--     - poster_file_path DEBE ser NULL (fase posterior)
--     - poster_original_name DEBE ser NULL (fase posterior)
--     - poster_uploaded_at DEBE ser NULL (fase posterior)
--     - poster_status DEBE ser NULL (fase posterior)
--     - resolution_sent_at DEBE ser NULL (campo admin)
--     - privacy_accepted_at DEBE ser not null
--     NOTA: submission_code NO se valida aquí; el trigger BEFORE INSERT
--     siempre genera P001 ignorando cualquier valor entrante.
-- (6) Evaluadores no actualizan submissions; solo INSERT reviews.
-- (14) Devolución de P001 al autor: el INSERT público no puede hacer SELECT.
--      Se resolverá via RPC/Edge Function en B08 que devuelva submission_code.
--
-- TABLA: conference_reviewers
-- ┌─────────────────────┬────────┬────────┬─────────────────────┬─────────────┐
-- │ Operación           │ anon   │ admin  │ comite_cientifico   │ autor       │
-- │                     │ /pub   │ /secr  │ /evaluador          │ sin login   │
-- ├─────────────────────┼────────┼────────┼─────────────────────┼─────────────┤
-- │ SELECT              │ NO     │ SI     │ NO (7)              │ NO          │
-- │ INSERT              │ NO     │ SI     │ NO                  │ NO          │
-- │ UPDATE              │ NO     │ SI     │ NO                  │ NO          │
-- │ DELETE              │ NO     │ NO (2) │ NO                  │ NO          │
-- └─────────────────────┴────────┴────────┴─────────────────────┴─────────────┘
-- (7) Evaluadores no ven la lista de evaluadores; solo reciben asignaciones.
--
-- TABLA: conference_submission_assignments
-- ┌─────────────────────┬────────┬────────┬─────────────────────┬─────────────┐
-- │ Operación           │ anon   │ admin  │ comite_cientifico   │ autor       │
-- │                     │ /pub   │ /secr  │ /evaluador          │ sin login   │
-- ├─────────────────────┼────────┼────────┼─────────────────────┼─────────────┤
-- │ SELECT              │ NO     │ SI     │ SI (8)              │ NO          │
-- │ INSERT              │ NO     │ SI     │ NO                  │ NO          │
-- │ UPDATE              │ NO     │ SI     │ SI (9)              │ NO          │
-- │ DELETE              │ NO     │ NO (2) │ NO                  │ NO          │
-- └─────────────────────┴────────┴────────┴─────────────────────┴─────────────┘
-- (8) Evaluadores ven SOLO sus propias asignaciones (reviewer_id = su profile_id).
-- (9) Evaluadores pueden actualizar status de sus asignaciones (assigned → in_progress → completed).
--
-- TABLA: conference_submission_reviews
-- ┌─────────────────────┬────────┬────────┬─────────────────────┬─────────────┐
-- │ Operación           │ anon   │ admin  │ comite_cientifico   │ autor       │
-- │                     │ /pub   │ /secr  │ /evaluador          │ sin login   │
-- ├─────────────────────┼────────┼────────┼─────────────────────┼─────────────┤
-- │ SELECT              │ NO     │ SI     │ SI (10)             │ NO          │
-- │ INSERT              │ NO     │ NO     │ SI (11)             │ NO          │
-- │ UPDATE              │ NO     │ SI     │ SI (12)             │ NO          │
-- │ DELETE              │ NO     │ NO (2) │ NO                  │ NO          │
-- └─────────────────────┴────────┴────────┴─────────────────────┴─────────────┘
-- (10) Evaluadores ven SOLO sus propias reviews (reviewer_id = su profile_id).
-- (11) Evaluadores insertan reviews SOLO para submissions asignadas.
-- (12) Evaluadores actualizan SOLO sus propias reviews.
--
-- TABLA: conference_event_counters
-- ┌─────────────────────┬────────┬────────┬─────────────────────┬─────────────┐
-- │ Operación           │ anon   │ admin  │ comite_cientifico   │ autor       │
-- │                     │ /pub   │ /secr  │ /evaluador          │ sin login   │
-- ├─────────────────────┼────────┼────────┼─────────────────────┼─────────────┤
-- │ SELECT              │ NO     │ SI     │ NO                  │ NO          │
-- │ INSERT              │ NO     │ NO (13)│ NO                  │ NO          │
-- │ UPDATE              │ NO     │ NO (13)│ NO                  │ NO          │
-- │ DELETE              │ NO     │ NO     │ NO                  │ NO          │
-- └─────────────────────┴────────┴────────┴─────────────────────┴─────────────┘
-- (13) Contadores solo se modifican via trigger (set_conference_submission_code).
--      Ningún rol los modifica directamente desde cliente.

-- ═══════════════════════════════════════════════════════════════════
-- RESTRICCIONES DE EVALUACIÓN CIEGA (confirmadas por Sil)
-- ═══════════════════════════════════════════════════════════════════
-- ✅ Evaluadores NO ven autoría
-- ✅ Evaluadores NO ven email
-- ✅ Evaluadores NO ven centro/servicio/provincia
-- ✅ Evaluadores NO acceden a archivos
-- ✅ Anon NO puede manipular submission_code/status/admin_notes

-- ═══════════════════════════════════════════════════════════════════
-- 1. Activar Row Level Security
-- ═══════════════════════════════════════════════════════════════════

alter table public.conference_events enable row level security;
alter table public.conference_submissions enable row level security;
alter table public.conference_reviewers enable row level security;
alter table public.conference_submission_assignments enable row level security;
alter table public.conference_submission_reviews enable row level security;
alter table public.conference_event_counters enable row level security;

-- ═══════════════════════════════════════════════════════════════════
-- 2. Función auxiliar: is_comite_cientifico()
-- ═══════════════════════════════════════════════════════════════════
-- Retorna true si el usuario autenticado tiene rol comite_cientifico.
-- Esta función se usará en policies de evaluadores.
-- NOTA: El enum app_role debe incluir 'comite_cientifico' (B10).
-- Si B10 no se ha ejecutado, estas policies fallarán al evaluarse.
-- Esto es intencional: B05 y B10 pueden ejecutarse en paralelo.

create or replace function public.is_comite_cientifico()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.current_app_role() = 'comite_cientifico';
end;
$$;

comment on function public.is_comite_cientifico() is
  'True si current_app_role() = comite_cientifico. Requiere que B10 haya añadido el valor al enum app_role.';

-- ═══════════════════════════════════════════════════════════════════
-- 3. Helper: is_reviewer_for_submission(submission_uuid)
-- ═══════════════════════════════════════════════════════════════════
-- Retorna true si el usuario autenticado es evaluador asignado a una submission.
-- Usa conference_submission_assignments + conference_reviewers para verificar.
-- Un evaluador está vinculado si:
--   1. Tiene profile_id = auth.uid() en conference_reviewers, Y
--   2. Existe una assignment para esa submission y ese reviewer.

create or replace function public.is_reviewer_for_submission(p_submission_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.conference_submission_assignments as a
    join public.conference_reviewers as r on r.id = a.reviewer_id
    where a.submission_id = p_submission_id
      and r.profile_id = auth.uid()
      and r.is_active = true
  );
end;
$$;

comment on function public.is_reviewer_for_submission(uuid) is
  'True si el usuario autenticado es evaluador activo asignado a la submission indicada.';

-- ═══════════════════════════════════════════════════════════════════
-- 4. Policies: conference_events
-- ═══════════════════════════════════════════════════════════════════

-- SELECT: solo admin
create policy "conference_events_select_admin"
  on public.conference_events
  for select
  using (public.is_admin());

comment on policy "conference_events_select_admin" on public.conference_events is
  'Solo administradores pueden consultar eventos de jornadas.';

-- INSERT: solo admin
create policy "conference_events_insert_admin"
  on public.conference_events
  for insert
  with check (public.is_admin());

comment on policy "conference_events_insert_admin" on public.conference_events is
  'Solo administradores crean eventos de jornadas.';

-- UPDATE: solo admin
create policy "conference_events_update_admin"
  on public.conference_events
  for update
  using (public.is_admin())
  with check (public.is_admin());

comment on policy "conference_events_update_admin" on public.conference_events is
  'Solo administradores actualizan eventos (cambiar status, fechas, etc.).';

-- DELETE: sin policy (admin archiva, no borra)

-- ═══════════════════════════════════════════════════════════════════
-- 5. Policies: conference_submissions
-- ═══════════════════════════════════════════════════════════════════

-- SELECT: solo admin
-- NOTA: evaluadores NO tienen SELECT aquí. En B05-BIS se creará una
-- vista SQL o función security definer que exponga solo el contenido
-- científico anonimizado a evaluadores. Por ahora, solo admin ve todo.

create policy "conference_submissions_select_admin"
  on public.conference_submissions
  for select
  using (public.is_admin());

comment on policy "conference_submissions_select_admin" on public.conference_submissions is
  'Solo administradores ven todas las comunicaciones. Evaluadores acceden via vista anonimizada (B05-BIS).';

-- INSERT: público (anon + authenticated) con WITH CHECK estricto
-- El autor envía su comunicación sin estar logueado.
-- WITH CHECK garantiza que no puede setear campos protegidos.
--
-- FIX1: Eliminado submission_code is null. El trigger BEFORE INSERT
-- siempre genera P001 ignorando cualquier valor entrante. Validar
-- submission_code en WITH CHECK bloquearía el INSERT porque el trigger
-- ya escribió el código antes de evaluar WITH CHECK.
--
-- FIX1: Añadidos campos file/poster/resolution para proteger contra
-- manipulación por anon. Estos campos se completarán via RPC/Edge
-- Function en B08 (file_path) o fase posterior (poster_*).

create policy "conference_submissions_insert_public"
  on public.conference_submissions
  for insert
  with check (
    status = 'received'
    and admin_notes is null
    and review_notes is null
    and file_path is null
    and poster_file_path is null
    and poster_original_name is null
    and poster_uploaded_at is null
    and poster_status is null
    and resolution_sent_at is null
    and privacy_accepted_at is not null
  );

comment on policy "conference_submissions_insert_public" on public.conference_submissions is
  'Cualquier persona puede enviar una comunicación. submission_code se genera via trigger (B03). status, admin_notes, review_notes, file_path, poster_* y resolution_sent_at quedan protegidos. P001 se devuelve via RPC en B08.';

-- UPDATE: solo admin
-- Admin puede cambiar status, añadir notas, etc.

create policy "conference_submissions_update_admin"
  on public.conference_submissions
  for update
  using (public.is_admin())
  with check (public.is_admin());

comment on policy "conference_submissions_update_admin" on public.conference_submissions is
  'Solo administradores actualizan comunicaciones (status, notas, resolución).';

-- DELETE: sin policy (admin archiva, no borra)

-- ═══════════════════════════════════════════════════════════════════
-- 6. Policies: conference_reviewers
-- ═══════════════════════════════════════════════════════════════════

-- SELECT: solo admin
-- Evaluadores NO ven la lista de evaluadores.

create policy "conference_reviewers_select_admin"
  on public.conference_reviewers
  for select
  using (public.is_admin());

comment on policy "conference_reviewers_select_admin" on public.conference_reviewers is
  'Solo administradores gestionan la lista de evaluadores.';

-- INSERT: solo admin
create policy "conference_reviewers_insert_admin"
  on public.conference_reviewers
  for insert
  with check (public.is_admin());

comment on policy "conference_reviewers_insert_admin" on public.conference_reviewers is
  'Solo administradores añaden evaluadores al comité.';

-- UPDATE: solo admin
create policy "conference_reviewers_update_admin"
  on public.conference_reviewers
  for update
  using (public.is_admin())
  with check (public.is_admin());

comment on policy "conference_reviewers_update_admin" on public.conference_reviewers is
  'Solo administradores actualizan datos de evaluadores (activo/inactivo, email, etc.).';

-- DELETE: sin policy (admin desactiva, no borra)

-- ═══════════════════════════════════════════════════════════════════
-- 7. Policies: conference_submission_assignments
-- ═══════════════════════════════════════════════════════════════════

-- SELECT: admin ve todo; evaluador ve solo sus asignaciones
-- FIX1: Doble condición para evaluadores (preferencia Cora):
-- is_comite_cientifico() AND is_reviewer_for_submission()
create policy "conference_assignments_select_admin_or_own"
  on public.conference_submission_assignments
  for select
  using (
    public.is_admin()
    or
    (public.is_comite_cientifico() and public.is_reviewer_for_submission(submission_id))
  );

comment on policy "conference_assignments_select_admin_or_own" on public.conference_submission_assignments is
  'Admin ve todas las asignaciones. Evaluador ve solo las suyas (doble condición: is_comite_cientifico AND is_reviewer_for_submission).';

-- INSERT: solo admin (admin asigna evaluadores)
create policy "conference_assignments_insert_admin"
  on public.conference_submission_assignments
  for insert
  with check (public.is_admin());

comment on policy "conference_assignments_insert_admin" on public.conference_submission_assignments is
  'Solo administradores asignan comunicaciones a evaluadores.';

-- UPDATE: admin o evaluador (evaluador cambia status de sus asignaciones)
-- FIX1: Doble condición para evaluadores
create policy "conference_assignments_update_admin_or_own"
  on public.conference_submission_assignments
  for update
  using (
    public.is_admin()
    or
    (public.is_comite_cientifico() and public.is_reviewer_for_submission(submission_id))
  )
  with check (
    public.is_admin()
    or
    (public.is_comite_cientifico() and public.is_reviewer_for_submission(submission_id))
  );

comment on policy "conference_assignments_update_admin_or_own" on public.conference_submission_assignments is
  'Admin actualiza cualquier asignación. Evaluador actualiza el status de las suyas (doble condición).';

-- DELETE: sin policy

-- ═══════════════════════════════════════════════════════════════════
-- 8. Policies: conference_submission_reviews
-- ═══════════════════════════════════════════════════════════════════

-- SELECT: admin ve todo; evaluador ve solo sus reviews
-- FIX1: Doble condición para evaluadores
create policy "conference_reviews_select_admin_or_own"
  on public.conference_submission_reviews
  for select
  using (
    public.is_admin()
    or
    (public.is_comite_cientifico()
     and reviewer_id in (
       select r.id from public.conference_reviewers r
       where r.profile_id = auth.uid()
     ))
  );

comment on policy "conference_reviews_select_admin_or_own" on public.conference_submission_reviews is
  'Admin ve todas las reviews. Evaluador ve solo las suyas (doble condición).';

-- INSERT: solo evaluador (para submissions asignadas)
-- WITH CHECK: reviewer_id debe corresponder al usuario autenticado
-- FIX1: Doble condición para evaluadores
create policy "conference_reviews_insert_reviewer_own"
  on public.conference_submission_reviews
  for insert
  with check (
    public.is_comite_cientifico()
    and reviewer_id in (
      select r.id from public.conference_reviewers r
      where r.profile_id = auth.uid()
    )
    and
    public.is_reviewer_for_submission(submission_id)
  );

comment on policy "conference_reviews_insert_reviewer_own" on public.conference_submission_reviews is
  'Evaluador inserta reviews SOLO para submissions asignadas (doble condición). reviewer_id debe ser el suyo.';

-- UPDATE: admin o evaluador (evaluador actualiza sus propias reviews)
-- FIX1: Doble condición para evaluadores
create policy "conference_reviews_update_admin_or_own"
  on public.conference_submission_reviews
  for update
  using (
    public.is_admin()
    or
    (public.is_comite_cientifico()
     and reviewer_id in (
       select r.id from public.conference_reviewers r
       where r.profile_id = auth.uid()
     ))
  )
  with check (
    public.is_admin()
    or
    (public.is_comite_cientifico()
     and reviewer_id in (
       select r.id from public.conference_reviewers r
       where r.profile_id = auth.uid()
     ))
  );

comment on policy "conference_reviews_update_admin_or_own" on public.conference_submission_reviews is
  'Admin actualiza cualquier review. Evaluador actualiza solo las suyas (doble condición).';

-- DELETE: sin policy

-- ═══════════════════════════════════════════════════════════════════
-- 9. Policies: conference_event_counters
-- ═══════════════════════════════════════════════════════════════════

-- SELECT: solo admin
create policy "conference_counters_select_admin"
  on public.conference_event_counters
  for select
  using (public.is_admin());

comment on policy "conference_counters_select_admin" on public.conference_event_counters is
  'Solo administradores ven los contadores de código.';

-- INSERT/UPDATE: sin policy (solo via trigger set_conference_submission_code)
-- DELETE: sin policy

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en B05
-- ═══════════════════════════════════════════════════════════════════
-- - Vista SQL anonimizada para evaluadores (va en B05-BIS)
-- - Storage policies (van en B06)
-- - Bucket (ya creado en B04-BACKEND)
-- - Rol comite_cientifico en app_role (va en B10)
-- - RPC/Edge Function para devolver P001 al autor (va en B08)
-- - RPC/Edge Function para completar file_path (va en B08)
-- - Datos reales
-- - Secrets, credenciales, .env
