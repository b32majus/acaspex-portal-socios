-- ACASPEX Portal Socios — B14C-HARD1
-- Endurecer RLS de conference_submission_assignments para evaluadores.
-- Problema: las policies actuales usan is_reviewer_for_submission(submission_id)
-- que solo verifica que el usuario esté asignado a la submission, no que la
-- fila assignment le pertenezca. Si una submission tiene 2 evaluadores, el
-- evaluador A podría cumplir la condición sobre la fila assignment del B.
-- Solución: reemplazar la condición por reviewer_id directo de la fila.

-- ═══════════════════════════════════════════════════════════════════
-- 1. Dropear policies antiguas de SELECT y UPDATE
-- ═══════════════════════════════════════════════════════════════════

drop policy if exists "conference_assignments_select_admin_or_own"
  on public.conference_submission_assignments;

drop policy if exists "conference_assignments_update_admin_or_own"
  on public.conference_submission_assignments;

-- ═══════════════════════════════════════════════════════════════════
-- 2. Recrear SELECT policy con reviewer_id de la fila
-- ═══════════════════════════════════════════════════════════════════
-- Admin: ve todas las assignments.
-- Evaluador: ve solo filas donde assignment.reviewer_id le corresponde
--   (reviewer con profile_id = auth.uid() AND is_active = true).

create policy "conference_assignments_select_admin_or_own"
  on public.conference_submission_assignments
  for select
  using (
    public.is_admin()
    or
    (
      public.is_comite_cientifico()
      and exists (
        select 1
        from public.conference_reviewers as r
        where r.id = conference_submission_assignments.reviewer_id
          and r.profile_id = auth.uid()
          and r.is_active = true
      )
    )
  );

comment on policy "conference_assignments_select_admin_or_own" on public.conference_submission_assignments is
  'Admin ve todas las asignaciones. Evaluador ve solo filas donde reviewer_id le corresponde (B14C-HARD1: reviewer_id directo, no submission_id).';

-- ═══════════════════════════════════════════════════════════════════
-- 3. Recrear UPDATE policy con reviewer_id de la fila
-- ═══════════════════════════════════════════════════════════════════
-- Admin: actualiza cualquier assignment.
-- Evaluador: actualiza solo filas donde assignment.reviewer_id le corresponde.
-- USING: verifica quién puede ver la fila para UPDATE.
-- WITH CHECK: verifica que la fila resultante sigue satisfaciendo la condición.

create policy "conference_assignments_update_admin_or_own"
  on public.conference_submission_assignments
  for update
  using (
    public.is_admin()
    or
    (
      public.is_comite_cientifico()
      and exists (
        select 1
        from public.conference_reviewers as r
        where r.id = conference_submission_assignments.reviewer_id
          and r.profile_id = auth.uid()
          and r.is_active = true
      )
    )
  )
  with check (
    public.is_admin()
    or
    (
      public.is_comite_cientifico()
      and exists (
        select 1
        from public.conference_reviewers as r
        where r.id = conference_submission_assignments.reviewer_id
          and r.profile_id = auth.uid()
          and r.is_active = true
      )
    )
  );

comment on policy "conference_assignments_update_admin_or_own" on public.conference_submission_assignments is
  'Admin actualiza cualquier asignación. Evaluador actualiza solo filas donde reviewer_id le corresponde (B14C-HARD1: reviewer_id directo).';

-- ═══════════════════════════════════════════════════════════════════
-- NO modificado en esta migración:
-- ═══════════════════════════════════════════════════════════════════
-- - conference_assignments_insert_admin (solo admin, sin cambios)
-- - conference_assignments_delete_admin_unstarted (B09-FIX1, sin cambios)
-- - conference_reviews_* (reviews policies, sin cambios)
-- - conference_reviewers_* (reviewers policies, sin cambios)
-- - is_reviewer_for_submission() helper (sin cambios)
-- - is_comite_cientifico() helper (sin cambios)
-- - Frontier: src/*, componentes, AppRouter, RPCs, storage
