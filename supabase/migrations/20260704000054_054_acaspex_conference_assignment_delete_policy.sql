-- ACASPEX Portal Socios — B09-FIX1
-- Permitir eliminar asignaciones no iniciadas desde Secretaría/admin.
-- Alcance: DELETE solo admin, solo status='assigned', y sin review asociada.

create policy "conference_assignments_delete_admin_unstarted"
  on public.conference_submission_assignments
  for delete
  using (
    public.is_admin()
    and status = 'assigned'
    and not exists (
      select 1
      from public.conference_submission_reviews as r
      where r.submission_id = conference_submission_assignments.submission_id
        and r.reviewer_id = conference_submission_assignments.reviewer_id
    )
  );

comment on policy "conference_assignments_delete_admin_unstarted" on public.conference_submission_assignments is
  'Solo admin puede eliminar asignaciones no iniciadas: status assigned y sin review asociada para la misma submission/reviewer.';
