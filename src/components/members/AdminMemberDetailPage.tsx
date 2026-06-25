import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ExternalLink, ChevronLeft, Edit, ShieldCheck, Trash2, User, Mail } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { fetchAdminMemberById, updateAdminMember, deleteAdminMember } from '../../lib/memberQueries';
import { fetchMemberAccessProfile, type MemberAccessProfile } from '../../lib/memberAccessQueries';
import { createMemberAccess } from '../../lib/memberAccessActions';
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
  const [accessProfile, setAccessProfile] = useState<MemberAccessProfile | null>(null);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [creatingAccess, setCreatingAccess] = useState(false);
  const [accessActionError, setAccessActionError] = useState<string | null>(null);
  const [accessActionFeedback, setAccessActionFeedback] = useState<string | null>(null);
  const [accreditationFile, setAccreditationFile] = useState<File | null>(null);
  const [paymentReceiptFile, setPaymentReceiptFile] = useState<File | null>(null);
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState<string | null>(null);
  const [accreditationUrl, setAccreditationUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!row || !isSupabaseConfigured()) return;
    const configured = isSupabaseConfigured();

    if (row.payment_receipt_file_path && configured && supabase) {
      supabase.storage.from('acaspex-payment-receipts')
        .createSignedUrl(row.payment_receipt_file_path, 300)
        .then(({ data }) => { if (data?.signedUrl) setPaymentReceiptUrl(data.signedUrl); })
        .catch(() => {});
    }
    if (row.reduced_fee_accreditation_file_path && configured && supabase) {
      supabase.storage.from('acaspex-reduced-fee-accreditations')
        .createSignedUrl(row.reduced_fee_accreditation_file_path, 300)
        .then(({ data }) => { if (data?.signedUrl) setAccreditationUrl(data.signedUrl); })
        .catch(() => {});
    }
  }, [row]);

  useEffect(() => {
    if (!memberId) return;
    setAccessLoading(true);
    setAccessError(null);
    fetchMemberAccessProfile(memberId)
      .then((data) => setAccessProfile(data))
      .catch(() => setAccessError('No se pudo consultar el estado de acceso.'))
      .finally(() => setAccessLoading(false));
  }, [memberId]);

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

  function mapAccessError(response: { code?: string; message?: string }): string {
    const code = response.code ?? '';
    const msg = response.message ?? '';

    if (code === 'member_not_eligible') return 'El socio debe estar activo y con cuota vigente para crear acceso.';
    if (code === 'member_without_email') return 'El socio no tiene email registrado. Añade un email antes de crear acceso.';
    if (code === 'forbidden_not_admin') return 'No tienes permisos de administración para crear accesos.';
    if (code === 'profile_already_exists') return 'El acceso ya existe para este socio.';
    if (code === 'member_not_found') return 'Socio no encontrado.';
    if (code === 'profile_creation_failed') return 'Se creó la invitación, pero no se pudo vincular el perfil. Revisa el handoff/logs antes de reintentar.';
    if (code === 'auth_user_creation_failed') {
      if (msg.toLowerCase().includes('rate limit')) {
        return 'No se ha podido enviar la invitación porque el proveedor de correo ha aplicado un límite temporal de envío. Inténtalo de nuevo más tarde.';
      }
      return 'No se ha podido crear/enviar la invitación de acceso. Revisa la configuración de correo o inténtalo más tarde.';
    }
    return msg || 'Error inesperado al crear el acceso.';
  }

  async function handleCreateAccess() {
    if (!row) return;
    setAccessActionError(null);
    setAccessActionFeedback(null);
    setCreatingAccess(true);
    try {
      const result = await createMemberAccess(row.id);

      if (result.ok && result.profile) {
        setAccessProfile(result.profile);
        if (result.already_exists) {
          setAccessActionFeedback('El acceso ya existía. Se ha actualizado la información mostrada.');
        } else {
          setAccessActionFeedback('Acceso creado e invitación enviada correctamente.');
        }
      } else if (!result.ok) {
        setAccessActionError(mapAccessError(result));
      }
    } catch (err) {
      setAccessActionError(err instanceof Error ? err.message : 'Error al crear el acceso.');
    } finally {
      setCreatingAccess(false);
    }
  }

  function startEdit() {
    if (!row) return;
    setEditForm(mapMemberRowToForm(row));
    setAccreditationFile(null);
    setPaymentReceiptFile(null);
    setEditing(true);
    setSaveError(null);
    setFeedback(null);
  }

  function cancelEdit() {
    setEditing(false);
    setEditForm(null);
    setAccreditationFile(null);
    setPaymentReceiptFile(null);
    setSaveError(null);
  }

  async function handleSave() {
    if (!row || !editForm) return;
    setSaving(true);
    setSaveError(null);
    try {
      const configured = isSupabaseConfigured();
      let newAccredPath = editForm.accreditationFilePath;
      let newPaymentPath = editForm.paymentReceiptFilePath;

      if (accreditationFile && configured && supabase) {
        const oldPath = row.reduced_fee_accreditation_file_path;
        const ext = accreditationFile.name.split('.').pop()?.toLowerCase() || 'pdf';
        const storagePath = `${row.id}/accreditation.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('acaspex-reduced-fee-accreditations')
          .upload(storagePath, accreditationFile, { contentType: accreditationFile.type, upsert: true });

        if (uploadError) throw new Error('Error al subir justificante de cuota: ' + uploadError.message);

        if (oldPath && oldPath !== storagePath) {
          await supabase.storage.from('acaspex-reduced-fee-accreditations').remove([oldPath]);
        }

        newAccredPath = storagePath;
      }

      if (paymentReceiptFile && configured && supabase) {
        const oldPath = row.payment_receipt_file_path;
        const ext = paymentReceiptFile.name.split('.').pop()?.toLowerCase() || 'pdf';
        const storagePath = `${row.id}/comprobante-pago.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('acaspex-payment-receipts')
          .upload(storagePath, paymentReceiptFile, { contentType: paymentReceiptFile.type, upsert: true });

        if (uploadError) throw new Error('Error al subir justificante de pago: ' + uploadError.message);

        if (oldPath && oldPath !== storagePath) {
          await supabase.storage.from('acaspex-payment-receipts').remove([oldPath]);
        }

        newPaymentPath = storagePath;
      }

      const saveForm = { ...editForm, accreditationFilePath: newAccredPath, paymentReceiptFilePath: newPaymentPath };
      const updated = await updateAdminMember(row.id, saveForm);
      setRow(updated);
      setEditing(false);
      setEditForm(null);
      setAccreditationFile(null);
      setPaymentReceiptFile(null);
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
  const isEligible = row.status === 'active' && row.paid_until && row.paid_until >= new Date().toISOString().slice(0, 10) && !!row.email;

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
          paymentReceiptFile={paymentReceiptFile}
          onPaymentReceiptFileChange={setPaymentReceiptFile}
          existingPaymentReceiptPath={row?.payment_receipt_file_path || null}
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
        <h2 className="font-serif text-lg text-slate-900">Justificantes</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Comprobante de pago</dt>
            <dd className="mt-0.5">
              {row.payment_receipt_file_path ? (
                paymentReceiptUrl ? (
                  <a href={paymentReceiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-medium">
                    <ExternalLink size={12} /> Ver comprobante
                  </a>
                ) : (
                  <span className="text-teal-700 font-medium">Archivo cargado</span>
                )
              ) : (
                <span className="text-slate-400">No cargado</span>
              )}
            </dd>
          </div>
          {(row.member_profile === 'residente' || row.member_profile === 'estudiante' || row.member_profile === 'jubilado') && (
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Justificante de cuota reducida</dt>
              <dd className="mt-0.5">
                {row.reduced_fee_accreditation_file_path ? (
                  accreditationUrl ? (
                    <a href={accreditationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-medium">
                      <ExternalLink size={12} /> Ver justificante
                    </a>
                  ) : (
                    <span className="text-teal-700 font-medium">Archivo cargado</span>
                  )
                ) : (
                  <span className="text-slate-400">No cargado</span>
                )}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg text-slate-900">Notas internas</h2>
        <p className="mt-3 text-sm text-slate-600">{row.notes || 'Sin notas.'}</p>
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

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg text-slate-900">Acceso al portal</h2>
        <div className="mt-4 space-y-3 text-sm">
          {accessLoading && (
            <p className="text-slate-400">Consultando estado de acceso...</p>
          )}
          {accessError && (
            <p className="text-red-600">{accessError}</p>
          )}
          {!accessLoading && !accessError && !accessProfile && (
            <div className="space-y-3">
              <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4">
                <p className="text-sm font-medium text-blue-800">Sin acceso creado</p>
                <p className="mt-1 text-xs text-blue-600">Esta ficha administrativa todavía no tiene usuario de acceso vinculado.</p>
              </div>

              {accessActionError && (
                <div className="rounded-lg border border-red-200 bg-red-50/60 p-3 text-xs text-red-700">{accessActionError}</div>
              )}
              {accessActionFeedback && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-700">{accessActionFeedback}</div>
              )}

              {!accessProfile && (
                <div className="flex flex-col items-start gap-2">
                  {isEligible ? (
                    <button
                      type="button"
                      onClick={handleCreateAccess}
                      disabled={creatingAccess}
                      className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 disabled:opacity-60"
                    >
                      <Mail size={15} />
                      {creatingAccess ? 'Creando acceso...' : 'Crear acceso / Enviar invitación'}
                    </button>
                  ) : (
                    <p className="text-xs text-slate-500">El socio debe estar activo y con cuota vigente para crear acceso.</p>
                  )}

                  <p className="text-xs text-slate-400">
                    El envío real de invitaciones utiliza temporalmente el correo configurado en Supabase. El correo corporativo de ACASPEX se conectará en la fase final de ajustes con Ana T.
                  </p>
                </div>
              )}
            </div>
          )}
          {!accessLoading && !accessError && accessProfile && (
            <div className={`rounded-lg border p-4 ${accessProfile.is_active ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-200 bg-amber-50/60'}`}>
              <p className="text-sm font-medium text-slate-800">
                {accessProfile.is_active ? 'Acceso creado' : 'Acceso desactivado'}
              </p>
              <dl className="mt-3 space-y-2 text-xs">
                <div>
                  <dt className="text-slate-400">Email</dt>
                  <dd className="mt-0.5 text-slate-700">{accessProfile.email}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Rol</dt>
                  <dd className="mt-0.5 text-slate-700">{accessProfile.role === 'socio' ? 'Socio' : accessProfile.role === 'junta_directiva' ? 'Junta Directiva' : 'Administrador'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Invitado</dt>
                  <dd className="mt-0.5 text-slate-700">{accessProfile.invited_at ? formatDate(accessProfile.invited_at) : '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Último acceso</dt>
                  <dd className="mt-0.5 text-slate-700">{accessProfile.last_seen_at ? formatDate(accessProfile.last_seen_at) : '—'}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 bg-white p-5 mt-4">
        {confirmDelete ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Trash2 size={18} className="mt-0.5 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800">¿Eliminar este socio?</p>
                <p className="mt-1 text-xs text-red-600">Esta acción eliminará la ficha administrativa de forma permanente. No se podrá deshacer.</p>
                {accessProfile && (
                  <p className="mt-1 text-xs font-medium text-amber-700">Este socio tiene acceso al portal. Al eliminar la ficha, el acceso se desactivará y el perfil quedará sin ficha vinculada.</p>
                )}
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
