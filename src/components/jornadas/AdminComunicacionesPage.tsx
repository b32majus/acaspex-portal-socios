import { useEffect, useMemo, useState, useCallback } from 'react';
import { Search, Filter, Eye, ArrowLeft, FileText, AlertCircle, Loader2, Save, CheckCircle, UserPlus, Users, X, Download } from 'lucide-react';
import {
  fetchConferenceSubmissions,
  calculateMetrics,
  statusLabels,
  modalityLabels,
  topicAreas,
  ALL_STATUS_OPTIONS,
  saveSubmissionEdit,
  fetchActiveReviewers,
  fetchAssignmentsForSubmission,
  assignReviewer,
  removeAssignment,
  getSubmissionFileSignedUrl,
  assignmentStatusLabels,
  MAX_ASSIGNMENTS_PER_SUBMISSION,
  type ConferenceSubmissionRow,
  type SubmissionStatus,
  type ReviewerRow,
  type AssignmentRow,
} from '../../lib/conferenceAdminClient';

type StatusFilter = 'all' | string;
type ModalityFilter = 'all' | string;
type TopicFilter = 'all' | string;

export function AdminComunicacionesPage() {
  const [rows, setRows] = useState<ConferenceSubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ConferenceSubmissionRow | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modalityFilter, setModalityFilter] = useState<ModalityFilter>('all');
  const [topicFilter, setTopicFilter] = useState<TopicFilter>('all');

  // B13 — editing state
  const [editStatus, setEditStatus] = useState<SubmissionStatus>('received');
  const [editNotes, setEditNotes] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // B09/B13bis — evaluator assignment state
  const [reviewers, setReviewers] = useState<ReviewerRow[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [assignReviewerId, setAssignReviewerId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [removeLoadingId, setRemoveLoadingId] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

  // B12 — file download state
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const assetBase = import.meta.env.BASE_URL;

  useEffect(() => {
    fetchConferenceSubmissions()
      .then(setRows)
      .catch(() => setError('No se pudieron cargar las comunicaciones.'))
      .finally(() => setLoading(false));
  }, []);

  // Load active reviewers for assignment dropdown
  useEffect(() => {
    fetchActiveReviewers()
      .then(setReviewers)
      .catch(() => {}); // Silently fail — dropdown will be empty
  }, []);

  // Load assignments when detail view opens
  useEffect(() => {
    if (!selected) {
      setAssignments([]);
      return;
    }
    fetchAssignmentsForSubmission(selected.id)
      .then(setAssignments)
      .catch(() => setAssignments([]));
  }, [selected?.id]);

  const metrics = useMemo(() => calculateMetrics(rows), [rows]);

  const filtered = useMemo(() => {
    return rows.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (modalityFilter !== 'all' && s.modality !== modalityFilter) return false;
      if (topicFilter !== 'all' && s.topic_area !== topicFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const match =
          s.submission_code.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.main_author_name.toLowerCase().includes(q) ||
          (s.center || '').toLowerCase().includes(q) ||
          s.authors_text.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [rows, search, statusFilter, modalityFilter, topicFilter]);

  function statusColor(status: string) {
    switch (status) {
      case 'received': return 'bg-slate-100 text-slate-700';
      case 'under_review': return 'bg-blue-100 text-blue-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'needs_info': return 'bg-amber-100 text-amber-700';
      case 'poster_pending': return 'bg-purple-100 text-purple-700';
      case 'poster_received': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  function formatFileSize(bytes: number | null): string {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  // B13 — sync editing fields when selected submission changes
  const openDetail = useCallback((row: ConferenceSubmissionRow) => {
    setSelected(row);
    setEditStatus(row.status as SubmissionStatus);
    setEditNotes(row.admin_notes ?? '');
    setEditError(null);
    setEditSuccess(false);
    // B09/B13bis: reset assignment state
    setAssignments([]);
    setAssignReviewerId('');
    setRemoveLoadingId(null);
    setAssignError(null);
  }, []);

  const handleAssignReviewer = useCallback(async () => {
    if (!selected || !assignReviewerId) return;
    setAssignLoading(true);
    setAssignError(null);
    try {
      const newAssignment = await assignReviewer(selected.id, assignReviewerId);
      setAssignments((prev) => [...prev, newAssignment]);
      setAssignReviewerId('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'error_desconocido';
      if (msg === 'max_assignments_reached') {
        setAssignError(`Máximo ${MAX_ASSIGNMENTS_PER_SUBMISSION} evaluadores por comunicación.`);
      } else if (msg === 'reviewer_already_assigned') {
        setAssignError('Este evaluador ya está asignado a esta comunicación.');
      } else if (msg.includes('new row violates row-level security')) {
        setAssignError('Permiso denegado. Solo los administradores pueden asignar evaluadores.');
      } else {
        setAssignError(`Error al asignar: ${msg}`);
      }
    } finally {
      setAssignLoading(false);
    }
  }, [selected, assignReviewerId]);

  const handleRemoveAssignment = useCallback(async (assignment: AssignmentRow) => {
    if (!selected || assignment.status !== 'assigned') return;

    setRemoveLoadingId(assignment.id);
    setAssignError(null);

    try {
      await removeAssignment(assignment.id, assignment.status);
      const refreshed = await fetchAssignmentsForSubmission(selected.id);
      setAssignments(refreshed);
      setAssignReviewerId('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'error_desconocido';

      if (msg === 'cannot_remove_active_assignment') {
        setAssignError('No se puede quitar una asignación en evaluación o completada.');
      } else if (msg === 'assignment_not_removed') {
        setAssignError('No se pudo quitar. Puede que el estado haya cambiado o que ya exista una evaluación asociada.');
      } else if (msg.includes('row-level security') || msg.includes('permission denied')) {
        setAssignError('Permiso denegado. Solo los administradores pueden quitar asignaciones no iniciadas.');
      } else {
        setAssignError(`Error al quitar asignación: ${msg}`);
      }
    } finally {
      setRemoveLoadingId(null);
    }
  }, [selected]);

  // B12 — download file handler (admin-only, signed URL 60s)
  const handleDownloadFile = useCallback(async () => {
    if (!selected?.file_path) return;
    setDownloadLoading(true);
    setDownloadError(null);
    try {
      const signedUrl = await getSubmissionFileSignedUrl(selected.file_path);
      const a = document.createElement('a');
      a.href = signedUrl;
      a.download = selected.file_original_name ?? 'abstract';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'download_failed';
      if (msg === 'supabase_not_configured') {
        setDownloadError('Supabase no está configurado.');
      } else if (msg === 'file_path_required') {
        setDownloadError('Esta comunicación no tiene archivo adjunto.');
      } else {
        setDownloadError('No se pudo generar el enlace de descarga. Inténtalo de nuevo.');
      }
    } finally {
      setDownloadLoading(false);
    }
  }, [selected]);

  // ── Loading ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Cargando comunicaciones...</span>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); fetchConferenceSubmissions().then(setRows).catch(() => setError('No se pudieron cargar las comunicaciones.')).finally(() => setLoading(false)); }}
            className="text-sm text-teal-700 hover:text-teal-900 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ── Detail view ─────────────────────────────────────────────
  if (selected) {
    return (
      <DetailEditView
        selected={selected}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
        editNotes={editNotes}
        setEditNotes={setEditNotes}
        editSaving={editSaving}
        editError={editError}
        editSuccess={editSuccess}
        statusColor={statusColor}
        formatFileSize={formatFileSize}
        reviewers={reviewers}
        assignments={assignments}
        assignReviewerId={assignReviewerId}
        setAssignReviewerId={setAssignReviewerId}
        setAssignError={setAssignError}
        assignLoading={assignLoading}
        removeLoadingId={removeLoadingId}
        assignError={assignError}
        onAssign={handleAssignReviewer}
        onRemove={handleRemoveAssignment}
        onBack={() => setSelected(null)}
        onSave={async () => {
          setEditSaving(true);
          setEditError(null);
          setEditSuccess(false);
          try {
            const updated = await saveSubmissionEdit(selected.id, editStatus, editNotes);
            // Update the row in the list too
            setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            setSelected(updated);
            setEditSuccess(true);
            setTimeout(() => setEditSuccess(false), 3000);
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'error_desconocido';
            if (msg.includes('new row violates row-level security')) {
              setEditError('Permiso denegado. Solo los administradores pueden modificar comunicaciones.');
            } else {
              setEditError(`Error al guardar: ${msg}`);
            }
          } finally {
            setEditSaving(false);
          }
        }}
        onDownloadFile={handleDownloadFile}
        downloadLoading={downloadLoading}
        downloadError={downloadError}
      />
    );
  }

  // ── List view ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-teal-900 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <img src={`${assetBase}assets/acaspex/logo-burbuja.jpg`} alt="ACASPEX" className="h-10 w-auto" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">ACASPEX</p>
            <p className="text-sm text-teal-100">Admin — Comunicaciones</p>
          </div>
        </div>
      </header>
      <div className="bg-amber-500 text-white text-center py-1.5 text-xs font-semibold tracking-wide">
        Entorno de revisión — panel conectado a backend en desarrollo. No usar con datos reales.
      </div>

      <main className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Comunicaciones recibidas</h1>
          <p className="text-sm text-slate-500">III Jornada ACASPEX</p>
        </div>

        {/* Metrics cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
          <MetricCard label="Total" value={metrics.total} color="bg-teal-50 text-teal-700" />
          <MetricCard label="Recibidas" value={metrics.received} color="bg-slate-100 text-slate-700" />
          <MetricCard label="En revisión" value={metrics.under_review} color="bg-blue-50 text-blue-700" />
          <MetricCard label="Aceptadas" value={metrics.accepted} color="bg-green-50 text-green-700" />
          <MetricCard label="Rechazadas" value={metrics.rejected} color="bg-red-50 text-red-700" />
          <MetricCard label="Info requerida" value={metrics.needs_info} color="bg-amber-50 text-amber-700" />
          <MetricCard label="Póster pendiente" value={metrics.poster_pending} color="bg-purple-50 text-purple-700" />
          <MetricCard label="Póster recibido" value={metrics.poster_received} color="bg-indigo-50 text-indigo-700" />
          <MetricCard label="Sin archivo" value={metrics.without_file} color="bg-orange-50 text-orange-700" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código, título, autor o centro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">Todos los estados</option>
              {Object.entries(statusLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">Todas las modalidades</option>
              {Object.entries(modalityLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">Todas las áreas</option>
              {topicAreas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Código</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Título</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Modalidad</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Área</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Autor</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Archivo</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Fecha</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-teal-700">{s.submission_code}</td>
                  <td className="px-4 py-3 text-slate-800 max-w-xs truncate">{s.title}</td>
                  <td className="px-4 py-3 text-slate-600">{modalityLabels[s.modality] ?? s.modality}</td>
                  <td className="px-4 py-3 text-slate-600">{s.topic_area ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(s.status)}`}>
                      {statusLabels[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.main_author_name}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {s.file_original_name ? (
                      <span className="text-xs text-green-700 bg-green-50 rounded px-1.5 py-0.5">Sí</span>
                    ) : (
                      <span className="text-xs text-slate-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(s.created_at).toLocaleDateString('es-ES')}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openDetail(s)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-50 transition-colors"
                    >
                      <Eye size={14} /> Ver
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    No se encontraron comunicaciones con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-slate-500">
          {filtered.length} de {rows.length} comunicaciones
        </div>
      </main>
    </div>
  );
}

// ── Metric card sub-component ────────────────────────────────
function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl p-3 ${color}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  );
}

// ── Detail + Edit view (B13) ─────────────────────────────────
function DetailEditView({
  selected,
  editStatus,
  setEditStatus,
  editNotes,
  setEditNotes,
  editSaving,
  editError,
  editSuccess,
  statusColor,
  formatFileSize,
  reviewers,
  assignments,
  assignReviewerId,
  setAssignReviewerId,
  setAssignError,
  assignLoading,
  removeLoadingId,
  assignError,
  onAssign,
  onRemove,
  onBack,
  onSave,
  onDownloadFile,
  downloadLoading,
  downloadError,
}: {
  selected: ConferenceSubmissionRow;
  editStatus: SubmissionStatus;
  setEditStatus: (s: SubmissionStatus) => void;
  editNotes: string;
  setEditNotes: (n: string) => void;
  editSaving: boolean;
  editError: string | null;
  editSuccess: boolean;
  statusColor: (s: string) => string;
  formatFileSize: (b: number | null) => string;
  reviewers: ReviewerRow[];
  assignments: AssignmentRow[];
  assignReviewerId: string;
  setAssignReviewerId: (id: string) => void;
  setAssignError: (error: string | null) => void;
  assignLoading: boolean;
  removeLoadingId: string | null;
  assignError: string | null;
  onAssign: () => void;
  onRemove: (assignment: AssignmentRow) => void;
  onBack: () => void;
  onSave: () => void;
  onDownloadFile: () => void;
  downloadLoading: boolean;
  downloadError: string | null;
}) {
  const assetBase = import.meta.env.BASE_URL;
  const hasChanges =
    editStatus !== selected.status || editNotes !== (selected.admin_notes ?? '');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-teal-900 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <img src={`${assetBase}assets/acaspex/logo-burbuja.jpg`} alt="ACASPEX" className="h-10 w-auto" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">ACASPEX</p>
            <p className="text-sm text-teal-100">Admin — Comunicaciones</p>
          </div>
        </div>
      </header>
      <div className="bg-amber-500 text-white text-center py-1.5 text-xs font-semibold tracking-wide">
        Entorno de revisión — panel conectado a backend en desarrollo. No usar con datos reales.
      </div>
      <main className="max-w-4xl mx-auto p-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-teal-700 hover:text-teal-900 mb-6"
        >
          <ArrowLeft size={16} /> Volver al listado
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 mb-2">
                {selected.submission_code}
              </span>
              <h1 className="text-2xl font-bold text-slate-900">{selected.title}</h1>
            </div>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColor(editStatus)}`}>
              {statusLabels[editStatus] ?? editStatus}
            </span>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
            <div><span className="font-medium text-slate-700">Modalidad:</span> {modalityLabels[selected.modality] ?? selected.modality}</div>
            <div><span className="font-medium text-slate-700">Área:</span> {selected.topic_area ?? '—'}</div>
            <div><span className="font-medium text-slate-700">Autor principal:</span> {selected.main_author_name}</div>
            <div><span className="font-medium text-slate-700">Email:</span> {selected.main_author_email}</div>
            <div><span className="font-medium text-slate-700">Teléfono:</span> {selected.main_author_phone ?? '—'}</div>
            <div><span className="font-medium text-slate-700">Centro:</span> {selected.center ?? '—'}</div>
            <div><span className="font-medium text-slate-700">Servicio:</span> {selected.service_unit ?? '—'}</div>
            <div><span className="font-medium text-slate-700">Provincia:</span> {selected.province ?? '—'}</div>
            <div><span className="font-medium text-slate-700">Fecha:</span> {new Date(selected.created_at).toLocaleDateString('es-ES')}</div>
            <div><span className="font-medium text-slate-700">Consentimiento:</span> {selected.communication_consent ? 'Sí' : 'No'}</div>
          </div>

          {/* Authors */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Autores</h3>
            <p className="text-sm text-slate-600">{selected.authors_text}</p>
          </div>

          {/* Abstract */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Resumen</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{selected.abstract_text}</p>
          </div>

          {/* File info — B12: admin download */}
          <div className="border-t border-slate-200 pt-4 mb-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Archivo adjunto</h3>
            {selected.file_original_name ? (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <FileText size={16} className="text-teal-600" />
                <span>{selected.file_original_name}</span>
                <span className="text-slate-400">({formatFileSize(selected.file_size)})</span>
                <span className="text-slate-400">{selected.file_mime_type}</span>
                <button
                  onClick={() => { void onDownloadFile(); }}
                  disabled={downloadLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 ml-auto"
                >
                  {downloadLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  Descargar
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Sin archivo adjunto</p>
            )}
            {downloadError && (
              <p className="text-xs text-red-600 mt-2">{downloadError}</p>
            )}
            {selected.poster_status && (
              <p className="text-sm text-slate-500 mt-2">
                <span className="font-medium">Póster:</span> {selected.poster_status}
              </p>
            )}
          </div>

          {/* Review notes (read-only) */}
          {selected.review_notes && (
            <div className="border-t border-slate-200 pt-4 mb-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Notas de evaluación</h3>
              <p className="text-sm text-slate-600 whitespace-pre-line">{selected.review_notes}</p>
            </div>
          )}

          {/* ═══ B13: Admin actions ═══ */}
          <div className="border-t border-slate-200 pt-5 mt-2">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Gestión</h3>

            {/* Status selector */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1">Estado</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as SubmissionStatus)}
                disabled={editSaving}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
              >
                {ALL_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{statusLabels[s]}</option>
                ))}
              </select>
            </div>

            {/* Admin notes */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1">Notas admin</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                disabled={editSaving}
                rows={4}
                placeholder="Añadir notas internas sobre esta comunicación..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-50 resize-y"
              />
            </div>

            {/* Save button + feedback */}
            <div className="flex items-center gap-3">
              <button
                onClick={onSave}
                disabled={editSaving || !hasChanges}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Guardar cambios
                  </>
                )}
              </button>

              {editSuccess && (
                <span className="inline-flex items-center gap-1.5 text-sm text-green-700 font-medium">
                  <CheckCircle size={14} />
                  Guardado correctamente
                </span>
              )}
            </div>

            {editError && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {editError}
              </div>
            )}

            {!hasChanges && !editSaving && !editError && !editSuccess && (
              <p className="text-xs text-slate-400 mt-2">No hay cambios pendientes.</p>
            )}
          </div>

          {/* ═══ B09/B13bis: Evaluators ═══ */}
          <div className="border-t border-slate-200 pt-5 mt-5">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-700">
                Evaluadores asignados
                {assignments.length > 0 && (
                  <span className="ml-1.5 text-xs font-normal text-slate-400">
                    ({assignments.length}/{MAX_ASSIGNMENTS_PER_SUBMISSION})
                  </span>
                )}
              </h3>
            </div>

            {/* Assigned reviewers list */}
            {assignments.length > 0 ? (
              <div className="space-y-2 mb-4">
                {assignments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {a.reviewer_name ?? 'Sin nombre'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {a.reviewer_email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.status === 'completed' ? 'bg-green-100 text-green-700' :
                        a.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {assignmentStatusLabels[a.status]}
                      </span>
                      {a.status === 'assigned' && (
                        <button
                          onClick={() => onRemove(a)}
                          disabled={removeLoadingId === a.id}
                          className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Quitar asignación"
                        >
                          {removeLoadingId === a.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <X size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic mb-4">
                Sin evaluadores asignados.
              </p>
            )}

            {/* Assignment form */}
            {assignments.length < MAX_ASSIGNMENTS_PER_SUBMISSION ? (
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Asignar evaluador
                  </label>
                  <select
                    value={assignReviewerId}
                    onChange={(e) => {
                      setAssignReviewerId(e.target.value);
                      setAssignError(null);
                    }}
                    disabled={assignLoading}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
                  >
                    <option value="">Seleccionar evaluador...</option>
                    {reviewers
                      .filter((r) => !assignments.some((a) => a.reviewer_id === r.id))
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} — {r.institution ?? r.email}
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  onClick={onAssign}
                  disabled={assignLoading || !assignReviewerId}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {assignLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <UserPlus size={14} />
                  )}
                  Asignar
                </button>
              </div>
            ) : (
              <p className="text-xs text-amber-600 font-medium">
                Máximo {MAX_ASSIGNMENTS_PER_SUBMISSION} evaluadores alcanzado.
              </p>
            )}

            {assignError && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                {assignError}
              </div>
            )}

            <p className="text-xs text-slate-400 mt-2">
              Evaluadores con estado "Asignado" pueden ser retirados. Evaluadores "En evaluación" o "Completado" no se pueden quitar.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
