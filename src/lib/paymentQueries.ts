import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { PaymentRow } from './paymentModel';

export type ValidatedPaymentStatus = 'validated' | 'missing' | 'duplicate' | 'not_applicable' | 'error';

export interface ValidatedPaymentForPeriodResult {
  ok: boolean;
  status: ValidatedPaymentStatus;
  payment?: PaymentRow;
  payments?: PaymentRow[];
  message: string;
}

export async function fetchValidatedPaymentForMemberPeriod(input: {
  memberId: string;
  membershipStart: string | null;
  paidUntil: string | null;
}): Promise<ValidatedPaymentForPeriodResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, status: 'error', message: 'Supabase no configurado.' };
  }

  if (!input.memberId || !input.membershipStart || !input.paidUntil) {
    return {
      ok: false,
      status: 'not_applicable',
      message: 'El pago no puede evaluarse porque el socio no tiene periodo de vigencia definido.',
    };
  }

  const { data, error } = await supabase
    .from('payments')
    .select(
      'id, member_id, signup_request_id, amount, payment_method, payment_status, payment_period_start, payment_period_end, paid_until, receipt_file_path, validated_by, validated_at, notes, created_at, updated_at',
    )
    .eq('member_id', input.memberId)
    .eq('payment_period_start', input.membershipStart)
    .eq('payment_period_end', input.paidUntil)
    .eq('payment_status', 'validated');

  if (error) {
    return { ok: false, status: 'error', message: 'Error al consultar pagos del socio.' };
  }

  const payments = (data ?? []) as PaymentRow[];

  if (payments.length === 0) {
    return { ok: true, status: 'missing', message: 'Sin pago validado registrado para el periodo vigente.' };
  }

  if (payments.length === 1) {
    return { ok: true, status: 'validated', payment: payments[0], message: 'Pago validado registrado.' };
  }

  return {
    ok: true,
    status: 'duplicate',
    payments,
    message: 'Hay más de un pago validado para este periodo. Revisar duplicados.',
  };
}
