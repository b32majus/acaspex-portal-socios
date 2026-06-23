# Decisiones — ACASPEX Portal de Socios

> Las decisiones vigentes resumidas para ejecución están en `docs/PROJECT_STATE_CURRENT.md`. Este documento conserva el registro ampliado de decisiones.

Estado: active

## Decisiones provisionales

### D001 — Mantener Google Sites como web pública

Google Sites se mantiene como escaparate institucional porque ya funciona, es mantenible por comunicación y no conviene migrar toda la web en esta fase.

### D002 — Crear portal privado independiente

La parte de socios vivirá fuera de Google Sites, como microsite/portal privado enlazado desde la web pública.

### D003 — Supabase-first

Se prioriza Supabase como base operativa porque el problema real no es solo acceso, sino gestión de socios, estado de cuota, recursos y permisos.

### D004 — Vídeos en YouTube oculto en MVP

No alojar vídeos en Supabase ni en el repositorio. Guardar en Supabase solo la ficha/enlace del recurso.

### D005 — Documentos privados ligeros en Supabase Storage

PDFs, plantillas y documentos sencillos pueden almacenarse en Supabase Storage, pendiente de diseñar políticas de acceso.

### D006 — GitHub como versionado, no hosting principal por defecto

GitHub se usará para control de versiones. El hosting preferente queda pendiente entre Cloudflare Pages y Netlify.

### D007 — Dirección visual basada en Propuesta 3

La referencia visual principal pasa a ser Propuesta 3 (documentada en docs/visual-pivot-propuesta-3-20260621.md), según feedback de AnaT. Propuesta 2 queda como referencia estructural secundaria para mantener lógica de portal privado, centro de conocimiento, biblioteca/recursos con navegación, comunidad y material corporativo. La dirección busca un portal institucional, editorial, limpio y premium, con tono más serio, hero amplio, navegación horizontal, menos cards, biblioteca reconceptualizada como Centro de conocimiento y nueva sección Banco de proyectos.

## Decisiones de producción cerradas — 2026-06-22

Registro canónico completo en `docs/production-decisions-acaspex-20260622.md`.

### D008 — Autenticación por contraseña propia

Se usará contraseña propia como método de autenticación. El flujo será: solicitud validada por administrador → creación/invitación de usuario → el socio define su contraseña → acceso al portal. No se usará Magic Link como vía principal del MVP.

### D009 — Tres roles: socio, junta_directiva, administrador

El sistema tendrá tres roles: `socio` (acceso al portal), `junta_directiva` (aceso a materiales exclusivos), `administrador` (gestión completa). No crear roles adicionales por cargo.

### D010 — Administradores previstos

AnaT será administradora principal. Probablemente también tesorero/a, presidente/a y/o secretario/a. Sil puede tener rol administrador inicial de soporte. Nombres exactos pendientes de confirmar.

### D011 — Correo oficial acaspex@outlook.es

Correo oficial ACASPEX: `acaspex@outlook.es`. Usos: contacto institucional, privacidad, confirmaciones, invitaciones, subsanaciones, recordatorios de renovación, comunicaciones.

### D012 — Backend Supabase confirmado

Supabase queda como backend elegido para el MVP real. No usar datos reales en entornos personales o staging de Sil. Los datos reales solo se importarán en el proyecto final de ACASPEX.

### D013 — Hosting Cloudflare Pages

GitHub Pages se mantiene como demo actual. Producción preferente: Cloudflare Pages. Dominio propio diferido 1–2 semanas. Dominios a valorar: `acaspex.es`, `socios.acaspex.es`, `portal.acaspex.es`.

### D014 — Pagos por transferencia manual

MVP con transferencia manual. No Stripe en MVP inicial. Redsys queda como posibilidad futura. El IBAN ya está visible en el formulario. El administrador valida pagos.

### D015 — Tabla de pagos con campos completos

Tabla `payments` con: id, member_id, signup_request_id, amount, payment_method, payment_status, payment_period_start, payment_period_end, paid_until, receipt_file_path, validated_by, validated_at, notes, created_at, updated_at.

### D016 — Justificantes en Storage privado

Justificantes de pago en Supabase Storage privado. Visible solo para administradores. No visible para socios ni Junta Directiva (salvo que sean admins). Conservación: solo justificante del ciclo vigente.

### D017 — Acreditación cuota reducida en Storage privado

Acreditación de cuota reducida en Supabase Storage privado. Visible solo para administradores. Política de conservación pendiente, pero nunca pública.

### D018 — Flujo de alta sin pending_payment

Flujo: formulario público → pending_review → admin revisa → admin acepta → socio active → invitación → contraseña → acceso → paid_until +12 meses. No usar pending_payment en MVP.

### D019 — Datos del formulario completos

Los datos del formulario se guardan completos porque ACASPEX ya los recoge. No eliminar campos sin decisión explícita. Respetar categorías profesionales y organizaciones del formulario original.

### D020 — Migración desde Excel con datos sintéticos primero

Se importará histórico desde Excel de Microsoft Forms (~48 socios). Sil pedirá cabeceras exactas. Hasta tener datos reales, trabajar con datos sintéticos. Importación real solo en proyecto final ACASPEX.

### D021 — Duplicidades por documento + email

Identificador fuerte: documento identificativo. Identificador secundario: email. Mismo documento + mismo email = mismo socio. Conflictos a revisión admin. No resolver automáticamente duplicidades sensibles.

### D022 — Fundesalud sin rol operativo

Fundesalud no tendrá rol operativo en el portal. Personas vinculadas a Fundesalud tendrán rol individual (socio, junta o admin).

### D023 — No datos reales en staging

Desarrollo de Sil siempre con datos ficticios/sintéticos. No usar datos reales hasta proyecto final ACASPEX. No importar Excel real en cuentas personales de Sil.

### D024 — Sesión no equivale a autorización

La sesión Supabase Auth identifica al usuario, pero no autoriza por sí sola. La autorización depende de: perfil activo, rol operativo, socio activo y cuota vigente. Cada capa es independiente.

### D025 — Administrador operativo sin ficha de socio

En el MVP se permite la existencia de administradores operativos sin ficha de socio (personas designadas para configurar, mantener o gestionar el portal). Este rol no equivale a socio ni a junta directiva, y no crea una figura de superadmin. El acceso al área admin requiere perfil activo con rol `administrador`, con independencia de que exista o no ficha de socio vinculada.

### D026 — Protección de rutas por sesión (H0.7d)

Todas las rutas privadas (`/socios`, `/admin`) están protegidas por sesión mediante `RequireAuth`. `/admin` requiere además rol `administrador` (protección por rol pendiente en H0.7g).

### D027 — Mutaciones remotas solo con autorización explícita

Las mutaciones remotas en Supabase staging mediante API key o service_role solo pueden ejecutarse con autorización explícita de Sil, alcance cerrado, reporte posterior y sin persistir secretos en repo, logs o documentación. Esta decisión se formaliza tras la creación de U1 en H0.7h.

### D028 — Acceso operativo global del administrador

El rol administrador permite acceso operativo global al portal. Un administrador puede acceder a las áreas privadas del portal, incluida el área de socios, aunque no tenga ficha de socio activa. Este acceso es por supervisión administrativa y no equivale a ser socio activo ni a tener cuota vigente. La distinción se refleja en `accessReason = 'admin_oversight'`.

### D029 — Material Corporativo como sección de Junta Directiva

La sección "Material Corporativo" agrupa recursos internos de uso institucional de ACASPEX (plantillas, logos, documentos institucionales, materiales de jornadas, presentaciones, actas, recursos de comunicación). Acceso: `administrador` y `junta_directiva`. `socio` no accede. Esta sección permite demostrar de forma visible la diferencia entre roles sin crear una zona compleja de gobierno interno. Implementación en H0.7q.

## Decisiones pendientes

1. Texto legal/RGPD.
2. Nombres exactos de administradores.
3. Política final de conservación de acreditaciones.
4. Cabeceras exactas del Excel histórico.
5. Dominio final (acaspex.es vs socios.acaspex.es vs portal.acaspex.es).
6. Redsys (pendiente de información bancaria).

## Decisiones que requieren validación explícita

- Crear servicios productivos.
- Conectar dominio real.
- Usar datos reales.
- Importar histórico de socios.
- Publicar portal accesible desde internet.
