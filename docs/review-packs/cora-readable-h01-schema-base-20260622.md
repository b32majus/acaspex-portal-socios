# Review Pack H0.1 — Schema base Supabase ACASPEX

**Status:** pending_review
**Fecha:** 2026-06-22

## TL;DR

Creado el primer SQL de estructura base para Supabase staging del Portal Socios ACASPEX:

- supabase/migrations/2026062200001_001_acaspex_schema.sql

## Incluye

- Ajuste H0.1b: member_profile unifica perfil general y perfiles de cuota reducida.
- Ajuste H0.1b: payment_method queda limitado a bank_transfer.
- Extensión pgcrypto.
- Enums de roles, documentos, socios, solicitudes, pagos, periodos y recursos.
- Tablas: profiles, members, signup_requests, payments, membership_periods, resource_categories, resources, resource_visibility, audit_log.
- Constraints, índices básicos, comentarios SQL y triggers de updated_at.
- Modelo compatible con Supabase Auth mediante profiles.id -> auth.users.id.
- Campos de migración futura: legacy_member_number, legacy_source, legacy_import_batch.

## Decisiones aplicadas

- Roles lógicos: socio, junta_directiva, administrador.
- Auth por invitación con email y contraseña propia.
- Alta en signup_requests con pending_review, needs_info, approved, rejected; no se crea pending_payment.
- Pagos MVP por transferencia bancaria (payment_method: bank_transfer), justificante en ruta privada de Storage.
- Justificantes y acreditaciones quedan modelados como paths privados, sin buckets ni policies.
- Datos reales fuera de staging; migración real solo en proyecto final ACASPEX.

## No incluido todavía

- RLS.
- Policies.
- Buckets de Storage.
- Seed/datos sintéticos.
- Edge Functions.
- Integración frontend.
- Ejecución real en Supabase.

## Revisión sugerida

- Confirmar nombres de enums antes de ejecutar.
- H0.1b ajusta member_profile y limita payment_method a bank_transfer; Stripe y Redsys quedan como evolución futura.
- Confirmar importes de cuota antes de añadir seeds o constraints más estrictas.
- Revisar si approved_member_id cubre el flujo de alta o si conviene añadir members.source_signup_request_id en una migración posterior.

## Veredicto

schema_base_sql_ready_for_h02

---

*Status: pending_review*
