-- ACASPEX Portal Socios — H0.8T-FIX2 resource_categories write policies
-- Reafirma GRANTs y restringe policies RLS a authenticated.
-- No crea policy DELETE.

grant select, insert, update on public.resource_categories to authenticated;

drop policy if exists "resource_categories_select_authenticated" on public.resource_categories;
drop policy if exists "resource_categories_insert_admin" on public.resource_categories;
drop policy if exists "resource_categories_update_admin" on public.resource_categories;

create policy "resource_categories_select_authenticated"
on public.resource_categories
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and (
        p.role = 'administrador'
        or (
          public.resource_categories.is_active = true
          and p.role in ('socio', 'junta_directiva')
        )
      )
  )
);

create policy "resource_categories_insert_admin"
on public.resource_categories
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'administrador'
      and p.is_active = true
  )
);

create policy "resource_categories_update_admin"
on public.resource_categories
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'administrador'
      and p.is_active = true
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'administrador'
      and p.is_active = true
  )
);
