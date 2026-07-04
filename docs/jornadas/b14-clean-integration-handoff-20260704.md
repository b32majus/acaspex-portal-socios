# B14 — Clean Integration Handoff

Fecha: 2026-07-04  
Status: `pending_review`  
Rama: `work/jornadas-integration-clean-20260704`  
Base: `main` (`ccb0a9c`)  
HEAD: `ac60b12`  
Commit: `ac60b12 feat: integrate conference submissions workflow`

## 1. Resumen ejecutivo

La funcionalidad de comunicaciones de jornadas ACASPEX B02–B14 se ha integrado en una rama limpia creada desde `main` actual.

La integración evita el merge directo de la rama antigua `work/acaspex-jornadas-pending-review-20260626`, porque esa rama presentaba divergencias fuera de scope frente a `main` en miembros, pagos, recursos, signup flows y documentación.

La rama limpia integra únicamente el scope de jornadas:

- formulario público de comunicaciones;
- edge function de envío controlado;
- panel admin de comunicaciones;
- acciones admin;
- asignación de evaluadores;
- eliminación de asignaciones no iniciadas;
- vista evaluador anonimizada;
- RPCs read-only de evaluador;
- RPC atómica de envío de evaluación;
- formulario visual de evaluación.

B12, signed URLs y descarga de archivos por evaluadores quedan expresamente fuera de esta integración.

## 2. Branch state

```text
Branch: work/jornadas-integration-clean-20260704
Base: main (ccb0a9c)
HEAD: ac60b12
Commit: ac60b12 — feat: integrate conference submissions workflow
```

Estado esperado tras integración:

```text
Tracked changes in HEAD: 21 files
Untracked: 4 legacy docs/*.bak files only
No push
No remote Supabase
No remote migrations
No B12
No signed URLs
```

## 3. Archivos integrados

### 3.1 src

```text
A src/components/jornadas/AdminComunicacionesPage.tsx
A src/components/jornadas/EvaluadorComunicacionesPage.tsx
A src/components/jornadas/mock/MockAdminComunicacionesPage.tsx
A src/components/jornadas/mock/MockEvaluadorPage.tsx
A src/components/jornadas/mock/MockPublicSubmissionPage.tsx
A src/components/jornadas/mock/mockConferenceData.ts
A src/lib/conferenceAdminClient.ts
A src/lib/conferenceReviewerClient.ts
A src/lib/conferenceSubmissionClient.ts
M src/routes/AppRouter.tsx
```

`AppRouter.tsx` se modificó manualmente para añadir únicamente imports/rutas de jornadas, conservando las rutas existentes de `main`.

### 3.2 Supabase

```text
A supabase/functions/submit-conference-submission/index.ts
A supabase/migrations/20260704000047_047_acaspex_conference_base_tables.sql
A supabase/migrations/20260704000048_048_acaspex_conference_submission_code_generation.sql
A supabase/migrations/20260704000049_049_acaspex_conference_storage_bucket.sql
A supabase/migrations/20260704000050_050_acaspex_add_comite_cientifico_role.sql
A supabase/migrations/20260704000051_051_acaspex_conference_rls_policies.sql
A supabase/migrations/20260704000052_052_acaspex_conference_reviewer_anon_view.sql
A supabase/migrations/20260704000053_053_acaspex_conference_storage_policies.sql
A supabase/migrations/20260704000054_054_acaspex_conference_assignment_delete_policy.sql
A supabase/migrations/20260704000055_055_acaspex_conference_assignment_reviewer_rls_hardening.sql
A supabase/migrations/20260704000056_056_acaspex_submit_conference_review_rpc.sql
```

## 4. Migrations renumeradas

Las migrations de jornadas se renumeraron porque `main` ya llegaba hasta:

```text
20260704000046_046_acaspex_register_validated_renewal_payment_rpc.sql
```

Además, la rama antigua tenía colisiones de numeración lógica y una colisión exacta con migrations existentes en `main`.

| Nuevo archivo | Origen en rama antigua | Contenido |
|---|---|---|
| `20260704000047_047_acaspex_conference_base_tables.sql` | `20260625000039_039...` | Tablas base |
| `20260704000048_048_acaspex_conference_submission_code_generation.sql` | `20260625000040_040...` | Trigger/counters |
| `20260704000049_049_acaspex_conference_storage_bucket.sql` | `20260626000043_043...` | Storage bucket |
| `20260704000050_050_acaspex_add_comite_cientifico_role.sql` | `20260626000045_045...` | Rol comité científico |
| `20260704000051_051_acaspex_conference_rls_policies.sql` | `20260626000044_044...` | RLS |
| `20260704000052_052_acaspex_conference_reviewer_anon_view.sql` | `20260626000046_046...` | RPCs read-only |
| `20260704000053_053_acaspex_conference_storage_policies.sql` | `20260626000047_047...` | Storage policies |
| `20260704000054_054_acaspex_conference_assignment_delete_policy.sql` | `20260626000048_048...` | DELETE assignment |
| `20260704000055_055_acaspex_conference_assignment_reviewer_rls_hardening.sql` | `20260626000049_049...` | Hardening RLS assignments |
| `20260704000056_056_acaspex_submit_conference_review_rpc.sql` | `20260626000050_050...` | RPC submit review |

Orden aplicado:

```text
047 base tables
048 code generation
049 storage bucket
050 comite_cientifico role
051 RLS policies
052 reviewer read RPCs
053 storage policies
054 assignment delete policy
055 assignment RLS hardening
056 submit review RPC
```

El rol `comite_cientifico` va antes de las policies/RPCs que lo usan.

## 5. Rutas integradas

Rutas reales:

```text
/admin/jornadas/comunicaciones  -> RequireAdmin -> AdminComunicacionesPage
/jornadas/evaluacion            -> RequireAuth + MemberLayout -> EvaluadorComunicacionesPage
```

Rutas mock conservadas:

```text
/jornadas/iii-jornada/comunicaciones
/admin/jornadas/mock-comunicaciones
/jornadas/evaluacion/mock
```

## 6. Flujos funcionales

### 6.1 Envío público

```text
MockPublicSubmissionPage
  -> conferenceSubmissionClient
    -> submit-conference-submission edge function
      -> insert submission + upload file + rollback controlado si falla
```

### 6.2 Panel admin

```text
AdminComunicacionesPage
  -> conferenceAdminClient
    -> lectura, filtros, detalle, métricas, cambio de estado, notas admin
```

### 6.3 Asignación de evaluadores

```text
AdminComunicacionesPage
  -> assignReviewer
    -> valida duplicados y máximo de asignaciones
    -> insert en conference_submission_assignments
```

### 6.4 Vista evaluador anonimizada

```text
EvaluadorComunicacionesPage
  -> conferenceReviewerClient
    -> get_assigned_submissions_for_reviewer()
    -> get_submission_for_reviewer(p_submission_id)
    -> get_reviewer_stats()
```

No muestra autoría, email, teléfono, centro, servicio, provincia, rutas de archivo ni notas internas.

### 6.5 Envío evaluación

```text
EvaluadorComunicacionesPage
  -> submitConferenceReview()
    -> RPC submit_conference_review(...)
```

La RPC:

```text
- no acepta reviewer_id desde frontend;
- resuelve reviewer_id desde auth.uid() y assignment real;
- valida role comite_cientifico;
- valida scores 1–5;
- evita doble envío;
- inserta review;
- marca assignment propia como completed;
- usa updated_at = now();
- no usa completed_at;
- no usa p_assignment_id.
```

## 7. Seguridad y exclusiones

Confirmaciones de scope:

```text
No service_role en frontend
No signed URLs
No createSignedUrl
No descarga de archivos por evaluador
No storage en cliente evaluador
No reviewer_id en input frontend
No author/authors_text en evaluador
No email/phone/center/service_unit/province en evaluador
No file_path/file_original_name en evaluador
No admin_notes/review_notes en evaluador
No B12
```

Paths que NO deben aparecer en esta integración:

```text
src/lib/payment*
src/lib/signup*
src/lib/memberAccessActions.ts
src/components/members/**
src/components/resources/**
src/lib/identityContext.tsx
src/lib/memberQueries.ts
src/lib/resourceHelpers.ts
src/routes/placeholderPages.tsx
docs/h09*
docs/migration/**
docs/debt-register.md
docs/worktree-branch-safety-20260626.md
docs/PROJECT_STATE_CURRENT.md
docs/backlog.md
supabase/migrations/*signup*
supabase/migrations/*payment*
supabase/migrations/*profiles*
supabase/migrations/*touch_last_seen*
```

## 8. Checks reportados

```text
git status --short: only 4 legacy docs/*.bak untracked
git diff --name-status main..HEAD: 21 files, zero D
No deletions vs main
No src/lib/payment*
No src/lib/signup*
No src/components/members/**
No src/components/resources/**
No docs/h09*
No old migration names 039/040/043-050 for jornadas
10 new migrations 047-056
pnpm build -- --emptyOutDir: pass
git diff --check: pass
completed_at in jornadas migrations: 0
p_assignment_id in jornadas migrations: 0
signedUrl/createSignedUrl in evaluator: 0
storage in evaluator/client: 0
```

## 9. Pendientes

```text
B12 — Signed URLs para descarga de archivos por evaluadores: pendiente, no autorizado.
B15 — Event detail en admin panel: pendiente, baja prioridad.
```

Antes de B12:

```text
1. Sil/Cora review de ac60b12.
2. Confirmar que la rama limpia no introduce deletes ni paths fuera de scope.
3. Confirmar que migrations 047–056 son correctas.
4. Confirmar estrategia de archivos: PDF original vs versión anonimizada.
5. Diseñar B12-PRECHECK antes de implementar signed URLs.
```

## 10. Veredicto documental

```text
B14-CLEAN-INTEGRATION = pending_review
El commit ac60b12 integra jornadas en rama limpia.
No está autorizado B12.
No está autorizado push/merge sin revisión final.
```
