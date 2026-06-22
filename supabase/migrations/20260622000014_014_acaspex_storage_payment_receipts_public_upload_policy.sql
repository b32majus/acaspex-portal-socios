-- ACASPEX Portal Socios — Subida pública controlada de justificantes de pago
-- H0.3b: crea la policy de INSERT público/anónimo controlado
-- para subir justificantes al bucket privado acaspex-payment-receipts
-- durante el alta de socio (antes de que la persona tenga login).
--
-- El bucket sigue siendo privado. Esta policy solo permite INSERT,
-- no lectura ni gestión. La lectura/gestión admin se añade en H0.3c.
--
-- Formato obligatorio de ruta:
--   signup-requests/{uuid}/payment-receipt.{pdf|jpg|jpeg|png}
-- El frontend debe generar un UUID de solicitud o UUID temporal
-- para la carpeta. No se permiten nombres libres de archivo.
-- La asociación con signup_requests.receipt_file_path se resolverá
-- en una WO posterior de flujo frontend/backend.
--
-- No contiene datos reales ni secretos.

create policy "payment_receipts_public_upload"
  on storage.objects
  for insert
  with check (
    bucket_id = 'acaspex-payment-receipts'
    and lower(name) ~ '^signup-requests/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/payment-receipt\.(pdf|jpg|jpeg|png)$'
  );

