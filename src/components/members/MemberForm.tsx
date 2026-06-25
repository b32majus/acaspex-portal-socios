import type { MemberFormState } from '../../lib/memberFormModel';
import { getFeeAmountForMemberProfile } from '../../lib/memberFormModel';
import {
  documentTypeOptions,
  professionalCategoryOptions,
  organizationOptions,
  memberProfileOptions,
  memberStatusOptions,
} from '../../lib/memberFormOptions';

export type MemberFormProps = {
  value: MemberFormState;
  mode: 'create' | 'edit';
  submitting?: boolean;
  error?: string | null;
  accreditationFile: File | null;
  onAccreditationFileChange: (file: File | null) => void;
  existingAccreditationPath?: string | null;
  paymentReceiptFile: File | null;
  onPaymentReceiptFileChange: (file: File | null) => void;
  existingPaymentReceiptPath?: string | null;
  onChange: (next: MemberFormState) => void;
  onSubmit: () => void;
  onCancel?: () => void;
};

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5 border-b border-slate-100 pb-3">
      <h2 className="font-serif text-lg text-slate-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

const inputClass = 'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600';
const selectClass = 'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600';
const readonlyClass = 'mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500';
const labelClass = 'block text-xs font-medium text-slate-500';

export function MemberForm({ value: v, mode, submitting, error, accreditationFile, onAccreditationFileChange, existingAccreditationPath, paymentReceiptFile, onPaymentReceiptFileChange, existingPaymentReceiptPath, onChange, onSubmit, onCancel }: MemberFormProps) {
  const set = (partial: Partial<MemberFormState>) => onChange({ ...v, ...partial });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="mx-auto max-w-3xl space-y-6"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50/60 p-3 text-sm text-red-800">{error}</div>
      )}

      {/* Identificación */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Identificación" subtitle="Datos básicos de la ficha administrativa" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nº socio</label>
            <input
              type="text" name="memberNumber" value={v.memberNumber}
              onChange={(e) => set({ memberNumber: e.target.value })}
              readOnly={mode === 'create'}
              placeholder={mode === 'create' ? 'Se asigna automáticamente' : ''}
              className={mode === 'create' ? readonlyClass : inputClass}
            />
            {mode === 'create' && <p className="mt-1 text-xs text-slate-400">Formato ACX-XXXX autogenerado al crear.</p>}
          </div>
          <div>
            <label className={labelClass}>Nombre *</label>
            <input type="text" name="firstName" value={v.firstName} onChange={(e) => set({ firstName: e.target.value })} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Primer apellido *</label>
            <input type="text" name="lastName1" value={v.lastName1} onChange={(e) => set({ lastName1: e.target.value })} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Segundo apellido</label>
            <input type="text" name="lastName2" value={v.lastName2} onChange={(e) => set({ lastName2: e.target.value })} className={inputClass} />
          </div>
        </div>
      </section>

      {/* Documento */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Documento" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Tipo</label>
            <select name="documentType" value={v.documentType} onChange={(e) => set({ documentType: e.target.value as typeof v.documentType })} className={selectClass}>
              {documentTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Número</label>
            <input type="text" name="documentNumber" value={v.documentNumber} onChange={(e) => set({ documentNumber: e.target.value })} className={inputClass} />
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Contacto" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Email *</label>
            <input type="email" name="email" value={v.email} onChange={(e) => set({ email: e.target.value })} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Teléfono</label>
            <input type="text" name="phone" value={v.phone} onChange={(e) => set({ phone: e.target.value })} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Dirección</label>
            <input type="text" name="addressLine" value={v.addressLine} onChange={(e) => set({ addressLine: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Código postal</label>
            <input type="text" name="postalCode" value={v.postalCode} onChange={(e) => set({ postalCode: e.target.value })} className={inputClass} />
          </div>
        </div>
      </section>

      {/* Perfil profesional */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Perfil profesional" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Categoría profesional</label>
            <select name="professionalCategory" value={v.professionalCategory} onChange={(e) => set({ professionalCategory: e.target.value })} className={selectClass}>
              {professionalCategoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Puesto</label>
            <input type="text" name="jobTitle" value={v.jobTitle} onChange={(e) => set({ jobTitle: e.target.value })} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Organización</label>
            <select name="organization" value={v.organization} onChange={(e) => set({ organization: e.target.value })} className={selectClass}>
              {organizationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Vínculo con calidad y seguridad</label>
            <input type="text" name="qualitySafetyLink" value={v.qualitySafetyLink} onChange={(e) => set({ qualitySafetyLink: e.target.value })} className={inputClass} />
          </div>
        </div>
      </section>

      {/* Membresía */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Membresía" subtitle="Perfil de cuota, estado y vigencia" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Perfil / Cuota</label>
            <select name="memberProfile" value={v.memberProfile} onChange={(e) => {
              const memberProfile = e.target.value as typeof v.memberProfile;
              set({ memberProfile, feeAmount: getFeeAmountForMemberProfile(memberProfile) });
            }} className={selectClass}>
              {memberProfileOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <select name="status" value={v.status} onChange={(e) => set({ status: e.target.value as typeof v.status })} className={selectClass}>
              {memberStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <p className="mt-1.5 text-xs text-slate-400">Al activar, la vigencia se calcula automáticamente a 12 meses.</p>
          </div>
          {v.membershipStart && (
            <div>
              <label className={labelClass}>Fecha de activación</label>
              <div className={readonlyClass}>{v.membershipStart || '—'}</div>
            </div>
          )}
          {v.paidUntil && (
            <div>
              <label className={labelClass}>Vigencia hasta</label>
              <div className={readonlyClass}>{v.paidUntil || '—'}</div>
            </div>
          )}
        </div>
      </section>

      {/* Justificante de pago */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Justificante de pago" subtitle="Comprobante de transferencia bancaria (PDF, JPG o PNG)" />
        {existingPaymentReceiptPath && !paymentReceiptFile && (
          <p className="mb-2 text-xs text-teal-700">Justificante cargado: <code className="text-xs">{existingPaymentReceiptPath.split('/').pop() || existingPaymentReceiptPath}</code></p>
        )}
        {paymentReceiptFile && (
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm text-teal-700">Nuevo: {paymentReceiptFile.name} ({(paymentReceiptFile.size / 1024).toFixed(0)} KB)</span>
            <button type="button" onClick={() => onPaymentReceiptFileChange(null)} className="text-xs text-slate-400 hover:text-slate-600">Quitar</button>
          </div>
        )}
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => onPaymentReceiptFileChange(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-xs file:font-medium file:text-teal-700 hover:file:bg-teal-100"
        />
        {existingPaymentReceiptPath && !paymentReceiptFile && (
          <p className="mt-1.5 text-xs text-slate-400">Selecciona un archivo para sustituir el justificante actual.</p>
        )}
      </section>

      {/* Justificante cuota reducida */}
      {(v.memberProfile === 'residente' || v.memberProfile === 'estudiante' || v.memberProfile === 'jubilado') && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader title="Justificante de cuota reducida" subtitle="Adjunte el documento acreditativo (PDF, JPG o PNG)" />
          {existingAccreditationPath && !accreditationFile && (
            <p className="mb-2 text-xs text-teal-700">Justificante cargado: <code className="text-xs">{existingAccreditationPath.split('/').pop() || existingAccreditationPath}</code></p>
          )}
          {accreditationFile && (
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm text-teal-700">Nuevo: {accreditationFile.name} ({(accreditationFile.size / 1024).toFixed(0)} KB)</span>
              <button type="button" onClick={() => onAccreditationFileChange(null)} className="text-xs text-slate-400 hover:text-slate-600">Quitar</button>
            </div>
          )}
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => onAccreditationFileChange(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-xs file:font-medium file:text-teal-700 hover:file:bg-teal-100"
          />
          {existingAccreditationPath && !accreditationFile && (
            <p className="mt-1.5 text-xs text-slate-400">Selecciona un archivo para sustituir el justificante actual.</p>
          )}
        </section>
      )}

      {/* Consentimientos */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Consentimientos" />
        <label className="flex items-start gap-3">
          <input type="checkbox" name="communicationConsent" checked={v.communicationConsent} onChange={(e) => set({ communicationConsent: e.target.checked })} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600" />
          <span className="text-sm text-slate-700">El socio consiente recibir comunicaciones de ACASPEX.</span>
        </label>
      </section>

      {/* Notas */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Notas internas" subtitle="Información administrativa no visible para el socio" />
        <textarea name="notes" value={v.notes} onChange={(e) => set({ notes: e.target.value })} rows={3} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600" />
      </section>

      {/* Acciones */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={submitting} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed">
          {submitting ? 'Guardando...' : mode === 'create' ? 'Crear socio' : 'Guardar cambios'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
