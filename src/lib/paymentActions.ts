import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { MemberRow } from './memberFormModel';
import { fetchAdminMemberById } from './memberQueries';
import { fetchSignupRequestById } from './signupRequestQueries';
import {
  getFeeAmountForMemberProfile,
  type PaymentRow,
  type RegisterValidatedPaymentInput,
  type RegisterValidatedPaymentResult,
  type RegisterValidatedRenewalPaymentInput,
} from './paymentModel';

const PAYMENT_SELECT = `
  id,
  member_id,
  signup_request_id,
  amount,
  payment_method,
  payment_status,
  payment_period_start,
  payment_period_end,
  paid_until,
  receipt_file_path,
  validated_by,
  validated_at,
  notes,
  created_at,
  updated_at
`;

function ensureDates(member: MemberRow): { start: string; end: string } {
  const start = member.membership_start;
  const end = member.paid_until;

  if (!start || !end) {
    throw { code: 'member_missing_dates', message: 'El socio no tiene fechas de vigencia asignadas.' };
  }

  return { start, end };
}

function addDaysIso(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function addMonthsIso(isoDate: string, months: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

async function checkDuplicate(
  memberId: string,
  periodStart: string,
  periodEnd: string,
): Promise<void> {
  const { data, error } = await supabase!
    .from('payments')
    .select('id')
    .eq('member_id', memberId)
    .eq('payment_period_start', periodStart)
    .eq('payment_period_end', periodEnd)
    .eq('payment_status', 'validated');

  if (error) {
    throw { code: 'unexpected_error', message: 'Error al verificar pagos existentes.' };
  }

  if (data && data.length > 0) {
    throw { code: 'duplicate_payment_period', message: 'Ya existe un pago validado para este periodo.' };
  }
}

export async function registerValidatedPayment(
  input: RegisterValidatedPaymentInput,
): Promise<RegisterValidatedPaymentResult> {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return { ok: false, code: 'not_configured', message: 'Supabase no configurado.' };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) {
      return { ok: false, code: 'no_session', message: 'No hay sesión de administrador activa.' };
    }

    const member = await fetchAdminMemberById(input.memberId);
    if (!member) {
      return { ok: false, code: 'member_not_found', message: 'Socio no encontrado.' };
    }

    const { start, end } = ensureDates(member);

    let signupRequestId: string | null = null;
    let receiptFilePath: string | null = input.receiptFilePath ?? null;

    if (input.signupRequestId) {
      const signup = await fetchSignupRequestById(input.signupRequestId);
      if (!signup) {
        return { ok: false, code: 'signup_not_found', message: 'Solicitud no encontrada.' };
      }

      if (signup.approved_member_id !== input.memberId) {
        return {
          ok: false,
          code: 'signup_member_mismatch',
          message: 'La solicitud no corresponde a este socio.',
        };
      }

      signupRequestId = input.signupRequestId;

      if (!receiptFilePath) {
        receiptFilePath = signup.receipt_file_path ?? null;
      }
    }

    if (!receiptFilePath) {
      receiptFilePath = member.payment_receipt_file_path ?? null;
    }

    let amount = input.amount ?? member.fee_amount ?? null;
    if (amount === null) {
      amount = getFeeAmountForMemberProfile(member.member_profile);
    }

    if (amount <= 0) {
      return { ok: false, code: 'invalid_amount', message: 'El importe debe ser mayor que cero.' };
    }

    await checkDuplicate(input.memberId, start, end);

    const now = new Date().toISOString();

    const payload = {
      member_id: input.memberId,
      signup_request_id: signupRequestId,
      amount,
      payment_method: 'bank_transfer' as const,
      payment_status: 'validated' as const,
      payment_period_start: start,
      payment_period_end: end,
      paid_until: end,
      receipt_file_path: receiptFilePath,
      validated_by: userId,
      validated_at: now,
      notes: input.notes ?? null,
    };

    const { data: newPayment, error: insertError } = await supabase
      .from('payments')
      .insert(payload)
      .select(PAYMENT_SELECT)
      .single();

    if (insertError || !newPayment) {
      return {
        ok: false,
        code: 'insert_failed',
        message: insertError?.message || 'No se ha podido registrar el pago.',
      };
    }

    return {
      ok: true,
      payment: newPayment as unknown as PaymentRow,
      message: 'Pago registrado correctamente.',
    };
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && 'message' in e) {
      return { ok: false, code: (e as { code: string }).code, message: (e as { message: string }).message };
    }
    return { ok: false, code: 'unexpected_error', message: 'Error inesperado al registrar el pago.' };
  }
}

export async function registerValidatedPaymentForRenewal(
  input: RegisterValidatedRenewalPaymentInput,
): Promise<RegisterValidatedPaymentResult> {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return { ok: false, code: 'not_configured', message: 'Supabase no configurado.' };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) {
      return { ok: false, code: 'no_session', message: 'No hay sesión de administrador activa.' };
    }

    const member = await fetchAdminMemberById(input.memberId);
    if (!member) {
      return { ok: false, code: 'member_not_found', message: 'Socio no encontrado.' };
    }

    if (member.status !== 'active' && member.status !== 'expired') {
      return {
        ok: false,
        code: 'member_status_invalid',
        message: 'Solo se puede renovar la cuota de un socio en estado activo o vencido.',
      };
    }

    if (!member.paid_until) {
      return {
        ok: false,
        code: 'member_missing_dates',
        message: 'El socio no tiene paid_until definido. No se puede calcular el siguiente periodo.',
      };
    }

    const newPeriodStart = addDaysIso(member.paid_until, 1);
    const newPeriodEnd = addMonthsIso(member.paid_until, 12);

    let amount = input.amount ?? member.fee_amount ?? null;
    if (amount === null) {
      amount = getFeeAmountForMemberProfile(member.member_profile);
    }

    if (amount <= 0) {
      return { ok: false, code: 'invalid_amount', message: 'El importe debe ser mayor que cero.' };
    }

    const now = new Date().toISOString();

    const paymentPayload = {
      member_id: input.memberId,
      signup_request_id: null,
      amount,
      payment_method: 'bank_transfer' as const,
      payment_status: 'validated' as const,
      payment_period_start: newPeriodStart,
      payment_period_end: newPeriodEnd,
      paid_until: newPeriodEnd,
      receipt_file_path: input.receiptFilePath ?? null,
      validated_by: userId,
      validated_at: now,
      notes: input.notes ?? null,
    };

    const { data: newPayment, error: insertError } = await supabase
      .from('payments')
      .insert(paymentPayload)
      .select(PAYMENT_SELECT)
      .single();

    if (insertError || !newPayment) {
      const code = insertError?.message?.includes('payments_validated_member_period_uidx')
        ? 'duplicate_payment_period'
        : 'insert_failed';
      const message = code === 'duplicate_payment_period'
        ? 'Ya existe un pago validado para este periodo.'
        : insertError?.message || 'No se ha podido registrar el pago de renovación.';
      return { ok: false, code, message };
    }

    const memberUpdate: { paid_until: string; status?: 'active' } = {
      paid_until: newPeriodEnd,
    };
    if (member.status === 'expired') {
      memberUpdate.status = 'active';
    }

    const { error: updateError } = await supabase
      .from('members')
      .update(memberUpdate)
      .eq('id', input.memberId);

    if (updateError) {
      return {
        ok: false,
        code: 'member_update_failed',
        payment: newPayment as unknown as PaymentRow,
        message:
          'Pago de renovación registrado, pero no se pudo actualizar la vigencia del socio. Revisa manualmente paid_until.',
      };
    }

    return {
      ok: true,
      payment: newPayment as unknown as PaymentRow,
      message: 'Renovación registrada correctamente.',
    };
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && 'message' in e) {
      return { ok: false, code: (e as { code: string }).code, message: (e as { message: string }).message };
    }
    return { ok: false, code: 'unexpected_error', message: 'Error inesperado al registrar la renovación.' };
  }
}
