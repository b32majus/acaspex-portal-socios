import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Edit, ShieldCheck, Trash2, User } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { fetchAdminMemberById, updateAdminMember, deleteAdminMember } from '../../lib/memberQueries';
import { mapMemberRowToForm, type MemberFormState, type MemberRow } from '../../lib/memberFormModel';
import { memberStatusOptions, memberProfileOptions, documentTypeOptions } from '../../lib/memberFormOptions';
import { MemberForm } from './MemberForm';

const statusLabelMap = Object.fromEntries(memberStatusOptions.map(o => [o.value, o.label]));
const profileLabelMap = Object.fromEntries(memberProfileOptions.map(o => [o.value, o.label]));
const docTypeLabelMap = Object.fromEntries(documentTypeOptions.map(o => [o.value, o.label]));

const statusBadgeClass: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  pending_review: 'bg-amber-100 text-amber-700',
  expired: 'bg-red-100 text-red-700',
  inactive: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-slate-100 text-slate-600',
};

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value + (value.includes('T') ? '' : 'T00:00:00'));
  return isNaN(d.getTime()) ? value : d.toLocaleDateString('es-ES');
}

export function AdminMemberDetailPage() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [row, setRow] = useState<MemberRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<MemberFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [accreditationFile, setAccreditationFile] = useState<File | null>(null);

  useEffect(() => {
    if (!memberId) return;
    fetchAdminMemberById(memberId)
      .then((data) => {
        if (data) setRow(data);
        else setError('Socio no encontrado.');
      })
      .catch(() => setError('No se pudo cargar el socio.'))
      .finally(() => setLoading(false));
  }, [memberId]);

  function startEdit() {
    if (!row) return;
    setEditForm(mapMemberRowToForm(row));
    setAccreditationFile(null);
    setEditing(true);
    setSaveError(null);
    setFeedback(null);
  }

  function cancelEdit() {
    setEditing(false);
    setEditForm(null);
    setAccreditationFile(null);
    setSaveError(null);
  }

  async function handleSave() {
    if (!row || !editForm) return;
    setSaving(true);
    setSaveError(null);
    try {
      const configured = isSupabaseConfigured();
      let newPath = editForm.accreditationFilePath;

      if (accreditationFile && configured && supabase) {
        const oldPath = row.reduced_fee_accreditation_file_path;
        const ext = accreditationFile.name.split('.').pop()?.toLowerCase() || 'pdf';
        const storagePath = `${row.id}/accreditation.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('acaspex-reduced-fee-accreditations')
          .upload(storagePath, accreditationFile, {
            contentType: accreditationFile.type,
            upsert: true,
          });

        if (uploadError) throw new Error('Error al subir justificante: ' + uploadError.message);

        if (oldPath && oldPath !== storagePath) {
          await supabase.storage.from('acaspex-reduced-fee-accreditations').remove([oldPath]);
        }

        newPath = storagePath;
      }

      const saveForm = { ...editForm, accreditationFilePath: newPath };
      const updated = await updateAdminMember(row.id, saveForm);
      setRow(updated);
      setEditing(false);
      setEditForm(null);
      setAccreditationFile(null);
      setFeedback('Ficha actualizada correctamente.');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteMember() {
    if (!row) return;
    setDeleting(true);
    try {
      await deleteAdminMember(row.id);
      navigate('/admin/socios');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Error al eliminar.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-slate-200" />
          <div className="h-32 rounded-2xl bg-slate-100" />
          <div className="h-64 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error || !row) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-4">
          <h1 className="font-serif text-2xl font-light text-slate-900">Socio no encontrado</h1>
          <p className="text-sm text-slate-600">{error || 'No existe ningún socio con el identificador indicado.'}</p>
          <Link to="/admin/socios" className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800">
            <ChevronLeft size={14} /> Volver a socios
          </Link>
        </div>
      </section>
    );
  }

  const form = mapMemberRowToForm(row);
  const fullName = [row.first_name, row.last_name_1, row.last_name_2].filter(Boolean).join(' ');
  const badgeClass = statusBadgeClass[row.status] ?? 'bg-slate-100 text-slate-600';
  const profileLabel = profileLabelMap[row.member_profile || ''] || row.member_profile || '—';
  const docTypeLabel = docTypeLabelMap[row.document_type || ''] || row.document_type || '—';

  return (
    <div className="space-y-8">
      <Link to="/admin/socios" className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800">
        <ChevronLeft size={14} /> Volver a socios
      </Link>

      {feedback && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-sm text-emerald-800">{feedback}</div>
      )}

      {editing && editForm ? (
        <MemberForm
          value={editForm}
          mode="edit"
          submitting={saving}
          error={saveError}
          accreditationFile={accreditationFile}
          onAccreditationFileChange={setAccreditationFile}
          existingAccreditationPath={row?.reduced_fee_accreditation_file_path || null}
          onChange={setEditForm}
          onSubmit={handleSave}
          onCancel={cancelEdit}
        />
      ) : (
        <>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-teal-700">Ficha administrativa</p>
            <h1 className="mt-2 font-serif text-3xl font-light text-slate-900">{fullName}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {row.member_number || 'Sin número'} · {row.organization || 'Sin organización'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
              {statusLabelMap[row.status] || row.status}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {profileLabel}
            </span>
            <button
              type="button"
              onClick={startEdit}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800"
            >
              <Edit size={15} /> Editar ficha
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700"><User size={18} /></div>
            <h2 className="font-serif text-xl text-slate-900">Datos personales y profesionales</h2>
          </div>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Documento</dt>
              <dd className="mt-0.5 text-slate-700">{docTypeLabel} · {row.document_number || '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Dirección</dt>
              <dd className="mt-0.5 text-slate-700">
                {[row.address_line, row.postal_code].filter(Boolean).join(', ') || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Email</dt>
              <dd className="mt-0.5 text-slate-700">{row.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Teléfono</dt>
              <dd className="mt-0.5 text-slate-700">{row.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Categoría profesional</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{row.professional_category || '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Puesto</dt>
              <dd className="mt-0.5 text-slate-700">{row.job_title || '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Organización</dt>
              <dd className="mt-0.5 text-slate-700">{row.organization || '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Vínculo con calidad y seguridad</dt>
              <dd className="mt-0.5 leading-relaxed text-slate-700">{row.quality_safety_link || '—'}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700"><ShieldCheck size={18} /></div>
            <h2 className="font-serif text-xl text-slate-900">Membresía</h2>
          </div>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Nº socio</dt>
              <dd className="mt-0.5 font-mono font-medium text-slate-900">{row.member_number || '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Estado</dt>
              <dd className="mt-0.5">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>
                  {statusLabelMap[row.status] || row.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Perfil / Cuota</dt>
              <dd className="mt-0.5 text-slate-700">{profileLabel}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Cuota anual</dt>
              <dd className="mt-0.5 text-slate-700">{row.fee_amount ? `${row.fee_amount} €` : '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Fecha de activación</dt>
              <dd className="mt-0.5 text-slate-700">{formatDate(row.membership_start)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Vigencia hasta</dt>
              <dd className="mt-0.5 text-slate-700">{formatDate(row.paid_until)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Consentimiento comunicación</dt>
              <dd className="mt-0.5 text-slate-700">{row.communication_consent ? 'Sí' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Privacidad aceptada</dt>
              <dd className="mt-0.5 text-slate-700">{row.privacy_accepted_at ? formatDate(row.privacy_accepted_at) : '—'}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg text-slate-900">Notas internas</h2>
        <p className="mt-3 text-sm text-slate-600">{(row as Record<string, unknown>).notes as string || 'Sin notas.'}</p>
      </section>

      {(row.legacy_member_number || row.legacy_source) && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg text-slate-900">Importación legacy</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {row.legacy_member_number && (
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Nº socio anterior</dt>
                <dd className="mt-0.5 text-slate-700">{row.legacy_member_number}</dd>
              </div>
            )}
            {row.legacy_source && (
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Origen</dt>
                <dd className="mt-0.5 text-slate-700">{row.legacy_source}</dd>
              </div>
            )}
            {row.legacy_import_batch && (
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Lote</dt>
                <dd className="mt-0.5 text-slate-700">{row.legacy_import_batch}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
        <p className="text-sm text-amber-800">
          <strong>Acceso al portal:</strong> pendiente de H0.9C. Esta ficha es solo administrativa; no se ha creado cuenta de acceso/login.
        </p>
      </section>

      <section className="rounded-2xl border border-red-200 bg-white p-5 mt-4">
        {confirmDelete ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Trash2 size={18} className="mt-0.5 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800">¿Eliminar este socio?</p>
                <p className="mt-1 text-xs text-red-600">Esta acción eliminará la ficha administrativa de forma permanente. No se podrá deshacer.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe ELIMINAR para confirmar"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm w-60 focus:border-red-500 focus:outline-none"
                onChange={(e) => {
                  if (e.target.value === 'ELIMINAR') {
                    handleDeleteMember();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
            {deleting && <p className="text-xs text-slate-500">Eliminando...</p>}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 size={15} /> Eliminar socio
          </button>
        )}
      </section>
        </>
      )}
    </div>
  );
}
