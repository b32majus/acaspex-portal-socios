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
  onChange: (next: MemberFormState) => void;
  onSubmit: () => void;
  onCancel?: () => void;
};

export function MemberForm({ value: v, mode, submitting, error, onChange, onSubmit, onCancel }: MemberFormProps) {
  const set = (partial: Partial<MemberFormState>) => onChange({ ...v, ...partial });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50/60 p-3 text-sm text-red-800">{error}</div>
      )}

      {/* Identificación */}
      <fieldset className="rounded-2xl border border-slate-200 bg-white p-5">
        <legend className="font-serif text-lg text-slate-900 px-1">Identificación</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-500">Nº socio</label>
            <input
              type="text"
              name="memberNumber"
              value={v.memberNumber}
              onChange={(e) => set({ memberNumber: e.target.value })}
              readOnly={mode === 'create'}
              placeholder={mode === 'create' ? 'Se asigna automáticamente' : ''}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 ${mode === 'create' ? 'border-slate-200 bg-slate-50 text-slate-400' : 'border-slate-200 bg-white text-slate-900'}`}
            />
            {mode === 'create' && <p className="mt-1 text-xs text-slate-400">ACX-XXXX autogenerado al crear.</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Nombre *</label>
            <input type="text" name="firstName" value={v.firstName} onChange={(e) => set({ firstName: e.target.value })} required className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Primer apellido *</label>
            <input type="text" name="lastName1" value={v.lastName1} onChange={(e) => set({ lastName1: e.target.value })} required className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Segundo apellido</label>
            <input type="text" name="lastName2" value={v.lastName2} onChange={(e) => set({ lastName2: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600" />
          </div>
        </div>
      </fieldset>

      {/* Documento */}
      <fieldset className="rounded-2xl border border-slate-200 bg-white p-5">
        <legend className="font-serif text-lg text-slate-900 px-1">Documento</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-500">Tipo</label>
            <select name="documentType" value={v.documentType} onChange={(e) => set({ documentType: e.target.value as typeof v.documentType })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600">
              {documentTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Número</label>
            <input type="text" name="documentNumber" value={v.documentNumber} onChange={(e) => set({ documentNumber: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600" />
          </div>
        </div>
      </fieldset>

      {/* Contacto */}
      <fieldset className="rounded-2xl border border-slate-200 bg-white p-5">
        <legend className="font-serif text-lg text-slate-900 px-1">Contacto</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-500">Email *</label>
            <input type="email" name="email" value={v.email} onChange={(e) => set({ email: e.target.value })} required className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Teléfono</label>
            <input type="text" name="phone" value={v.phone} onChange={(e) => set({ phone: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500">Dirección</label>
            <input type="text" name="addressLine" value={v.addressLine} onChange={(e) => set({ addressLine: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Código postal</label>
            <input type="text" name="postalCode" value={v.postalCode} onChange={(e) => set({ postalCode: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600" />
          </div>
        </div>
      </fieldset>

      {/* Perfil profesional */}
      <fieldset className="rounded-2xl border border-slate-200 bg-white p-5">
        <legend className="font-serif text-lg text-slate-900 px-1">Perfil profesional</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-500">Categoría profesional</label>
            <select name="professionalCategory" value={v.professionalCategory} onChange={(e) => set({ professionalCategory: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600">
              {professionalCategoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Puesto</label>
            <input type="text" name="jobTitle" value={v.jobTitle} onChange={(e) => set({ jobTitle: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500">Organización</label>
            <select name="organization" value={v.organization} onChange={(e) => set({ organization: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600">
              {organizationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500">Vínculo con calidad y seguridad</label>
            <input type="text" name="qualitySafetyLink" value={v.qualitySafetyLink} onChange={(e) => set({ qualitySafetyLink: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600" />
          </div>
        </div>
      </fieldset>

      {/* Membresía */}
      <fieldset className="rounded-2xl border border-slate-200 bg-white p-5">
        <legend className="font-serif text-lg text-slate-900 px-1">Membresía</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-500">Perfil / Cuota</label>
            <select name="memberProfile" value={v.memberProfile} onChange={(e) => {
              const memberProfile = e.target.value as typeof v.memberProfile;
              set({ memberProfile, feeAmount: getFeeAmountForMemberProfile(memberProfile) });
            }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600">
              {memberProfileOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Estado</label>
            <select name="status" value={v.status} onChange={(e) => set({ status: e.target.value as typeof v.status })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600">
              {memberStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <p className="mt-1 text-xs text-slate-400">Al activar un socio, la vigencia se calcula automáticamente a 12 meses.</p>
          </div>
          {v.membershipStart && (
            <div>
              <label className="block text-xs font-medium text-slate-500">Fecha de activación</label>
              <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">{v.membershipStart || '—'}</div>
            </div>
          )}
          {v.paidUntil && (
            <div>
              <label className="block text-xs font-medium text-slate-500">Vigencia hasta</label>
              <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">{v.paidUntil || '—'}</div>
            </div>
          )}
        </div>
      </fieldset>

      {/* Justificante cuota reducida */}
      {(v.memberProfile === 'residente' || v.memberProfile === 'estudiante' || v.memberProfile === 'jubilado') && (
        <fieldset className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <legend className="font-serif text-lg text-amber-900 px-1">Justificante de cuota reducida</legend>
          <p className="mt-2 text-sm text-amber-800">
            La gestión documental del justificante se añadirá en una fase posterior.
            Mientras tanto, registre la situación en notas internas.
          </p>
        </fieldset>
      )}

      {/* Consentimientos */}
      <fieldset className="rounded-2xl border border-slate-200 bg-white p-5">
        <legend className="font-serif text-lg text-slate-900 px-1">Consentimientos</legend>
        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" name="communicationConsent" checked={v.communicationConsent} onChange={(e) => set({ communicationConsent: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600" />
            <span className="text-sm text-slate-700">Consentimiento para comunicaciones</span>
          </label>
        </div>
      </fieldset>

      {/* Notas */}
      <fieldset className="rounded-2xl border border-slate-200 bg-white p-5">
        <legend className="font-serif text-lg text-slate-900 px-1">Notas internas</legend>
        <textarea name="notes" value={v.notes} onChange={(e) => set({ notes: e.target.value })} rows={3} className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600" />
      </fieldset>

      {/* Acciones */}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={submitting} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed">
          {submitting ? 'Guardando...' : mode === 'create' ? 'Crear socio' : 'Guardar cambios'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
