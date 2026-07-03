export type PaymentMethod = 'bank_transfer';
export type PaymentStatus = 'pending' | 'validated' | 'rejected';

export interface PaymentRow {
  id: string;
  member_id: string;
  signup_request_id: string | null;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_period_start: string;
  payment_period_end: string;
  paid_until: string;
  receipt_file_path: string | null;
  validated_by: string | null;
  validated_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegisterValidatedPaymentInput {
  memberId: string;
  signupRequestId?: string | null;
  amount?: number | null;
  receiptFilePath?: string | null;
  notes?: string | null;
}

export interface RegisterValidatedRenewalPaymentInput {
  memberId: string;
  amount?: number | null;
  receiptFilePath?: string | null;
  notes?: string | null;
}

export interface RegisterValidatedPaymentResult {
  ok: boolean;
  payment?: PaymentRow;
  code?: string;
  message: string;
}

export function getFeeAmountForMemberProfile(profile: string | null): number {
  if (profile === 'general') return 50;
  if (profile === 'residente' || profile === 'estudiante' || profile === 'jubilado') return 30;
  return 50;
}
