-- ACASPEX Portal Socios — Admin delete members
-- H0.9B-STAGING-FIX2B: permite eliminación administrativa de socios.
-- No afecta a auth.users ni profiles.

grant delete on public.members to authenticated;

create policy members_delete_admin
on public.members
for delete
using (public.is_admin());
