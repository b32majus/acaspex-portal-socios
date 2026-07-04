import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Eye,
  FileText,
  Loader2,
  Save,
  Star,
} from 'lucide-react';
import {
  fetchReviewerAssignments,
  fetchReviewerSubmission,
  fetchReviewerStats,
  submitConferenceReview,
  modalityLabels,
  assignmentStatusLabels,
  type ConferenceReviewRecommendation,
  type ReviewerAssignedSubmissionRow,
  type ReviewerSubmissionDetailRow,
  type ReviewerStatsRow,
} from '../../lib/conferenceReviewerClient';

type ReviewFormState = {
  scoreRelevance: string;
  scoreMethodology: string;
  scoreImpact: string;
  scoreClarity: string;
  comments: string;
  recommendation: ConferenceReviewRecommendation | '';
};

type ScoreFieldKey = 'scoreRelevance' | 'scoreMethodology' | 'scoreImpact' | 'scoreClarity';

const emptyReviewForm: ReviewFormState = {
  scoreRelevance: '',
  scoreMethodology: '',
  scoreImpact: '',
  scoreClarity: '',
  comments: '',
  recommendation: '',
};

const scoreFields: Array<{ key: ScoreFieldKey; label: string; description: string }> = [
  {
    key: 'scoreRelevance',
    label: 'Relevancia',
    description: 'Interés y pertinencia para calidad asistencial y seguridad del paciente.',
  },
  {
    key: 'scoreMethodology',
    label: 'Metodología',
    description: 'Claridad del diseño, enfoque, intervención o análisis realizado.',
  },
  {
    key: 'scoreImpact',
    label: 'Impacto',
    description: 'Potencial de mejora, transferencia o utilidad para otros equipos.',
  },
  {
    key: 'scoreClarity',
    label: 'Claridad',
    description: 'Estructura, redacción y comprensión del resumen científico.',
  },
];

const scoreOptions = [1, 2, 3, 4, 5];

function toNullableScore(value: string): number | null {
  return value === '' ? null : Number(value);
}

function isReviewFormComplete(form: ReviewFormState): boolean {
  return Boolean(
    form.scoreRelevance
      && form.scoreMethodology
      && form.scoreImpact
      && form.scoreClarity
      && form.recommendation,
  );
}

export function EvaluadorComunicacionesPage() {
  const [assignments, setAssignments] = useState<ReviewerAssignedSubmissionRow[]>([]);
  const [stats, setStats] = useState<ReviewerStatsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<ReviewerAssignedSubmissionRow | null>(null);
  const [detail, setDetail] = useState<ReviewerSubmissionDetailRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [reviewForm, setReviewForm] = useState<ReviewFormState>(emptyReviewForm);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  const assetBase = import.meta.env.BASE_URL;

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [a, s] = await Promise.all([fetchReviewerAssignments(), fetchReviewerStats()]);
      setAssignments(a);
      setStats(s);
    } catch {
      setError('No se pudieron cargar las comunicaciones asignadas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const resetReviewState = useCallback(() => {
    setReviewForm(emptyReviewForm);
    setReviewError(null);
    setReviewSuccess(null);
    setReviewSubmitting(false);
  }, []);

  const openDetail = useCallback(async (row: ReviewerAssignedSubmissionRow) => {
    setSelected(row);
    setDetail(null);
    setDetailLoading(true);
    setDetailError(null);
    resetReviewState();

    try {
      const d = await fetchReviewerSubmission(row.id);
      setDetail(d);
    } catch {
      setDetailError('No se pudo cargar el detalle de la comunicación.');
    } finally {
      setDetailLoading(false);
    }
  }, [resetReviewState]);

  async function refreshReviewerData(currentSubmissionId: string) {
    const [updatedAssignments, updatedStats] = await Promise.all([
      fetchReviewerAssignments(),
      fetchReviewerStats(),
    ]);

    setAssignments(updatedAssignments);
    setStats(updatedStats);

    const updatedSelected = updatedAssignments.find((row) => row.id === currentSubmissionId);
    if (updatedSelected) {
      setSelected(updatedSelected);
    }
  }

  async function handleSubmitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selected) {
      return;
    }

    setReviewError(null);
    setReviewSuccess(null);

    if (!isReviewFormComplete(reviewForm)) {
      setReviewError('Completa las cuatro puntuaciones y la recomendación antes de enviar la evaluación.');
      return;
    }

    setReviewSubmitting(true);

    try {
      await submitConferenceReview({
        submissionId: selected.id,
        scoreRelevance: toNullableScore(reviewForm.scoreRelevance),
        scoreMethodology: toNullableScore(reviewForm.scoreMethodology),
        scoreImpact: toNullableScore(reviewForm.scoreImpact),
        scoreClarity: toNullableScore(reviewForm.scoreClarity),
        comments: reviewForm.comments.trim() || null,
        recommendation: reviewForm.recommendation || null,
      });

      await refreshReviewerData(selected.id);
      setReviewSuccess('Evaluación enviada correctamente.');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'submit_failed';
      const friendlyMessage: Record<string, string> = {
        not_authorized: 'No tienes permisos para enviar evaluaciones.',
        not_assigned_reviewer: 'Esta comunicación no está asignada a tu perfil evaluador.',
        review_already_submitted: 'Esta evaluación ya ha sido enviada.',
        invalid_score: 'Alguna puntuación está fuera del rango permitido de 1 a 5.',
        assignment_not_found: 'No se pudo actualizar el estado de la asignación.',
        supabase_not_configured: 'La conexión con Supabase no está configurada.',
      };

      setReviewError(friendlyMessage[message] ?? 'No se pudo enviar la evaluación. Inténtalo de nuevo.');
    } finally {
      setReviewSubmitting(false);
    }
  }

  function statusColor(status: string) {
    switch (status) {
      case 'assigned': return 'bg-slate-100 text-slate-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  function closeDetail() {
    setSelected(null);
    setDetail(null);
    setDetailError(null);
    resetReviewState();
  }

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
            onClick={() => { void loadInitialData(); }}
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
    const alreadyCompleted = selected.assignment_status === 'completed';

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-teal-900 text-white px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <img src={`${assetBase}assets/acaspex/logo-burbuja.jpg`} alt="ACASPEX" className="h-10 w-auto" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">ACASPEX</p>
              <p className="text-sm text-teal-100">Evaluación de comunicaciones</p>
            </div>
          </div>
        </header>
        <div className="bg-blue-600 text-white text-center py-1.5 text-xs font-semibold tracking-wide">
          Vista anonimizada para evaluación científica — Sin datos identificativos ni archivos.
        </div>

        <main className="max-w-4xl mx-auto p-6">
          <button
            onClick={closeDetail}
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
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColor(selected.assignment_status)}`}>
                {assignmentStatusLabels[selected.assignment_status] ?? selected.assignment_status}
              </span>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-6">
              <div><span className="font-medium text-slate-700">Modalidad:</span> {modalityLabels[selected.modality] ?? selected.modality}</div>
              <div><span className="font-medium text-slate-700">Área:</span> {selected.topic_area ?? '—'}</div>
              <div><span className="font-medium text-slate-700">Asignada:</span> {new Date(selected.assigned_at).toLocaleDateString('es-ES')}</div>
            </div>

            {/* Loading detail */}
            {detailLoading && (
              <div className="flex items-center gap-3 text-slate-500 py-8">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Cargando contenido científico...</span>
              </div>
            )}

            {/* Detail error */}
            {detailError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
                {detailError}
              </div>
            )}

            {/* Abstract */}
            {detail && (
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Resumen</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{detail.abstract_text}</p>
              </div>
            )}

            {/* Review form */}
            {detail && (
              <div className="border-t border-slate-200 pt-5 mt-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="rounded-full bg-teal-50 p-2 text-teal-700">
                    <Star size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Evaluación científica</h2>
                    <p className="text-sm text-slate-500">
                      Puntúa la comunicación de 1 a 5 y emite una recomendación final.
                    </p>
                  </div>
                </div>

                {alreadyCompleted ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    <div className="flex items-center gap-2 font-semibold">
                      <CheckCircle size={16} /> Evaluación enviada
                    </div>
                    <p className="mt-1 text-green-700">
                      Esta comunicación figura como completada. No se permite reenviar la evaluación desde esta pantalla.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {scoreFields.map((field) => (
                        <label key={field.key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <span className="block text-sm font-semibold text-slate-800">{field.label}</span>
                          <span className="block text-xs text-slate-500 mt-1 min-h-8">{field.description}</span>
                          <select
                            value={reviewForm[field.key]}
                            onChange={(event) => {
                              const { value } = event.target;
                              setReviewForm((prev) => ({ ...prev, [field.key]: value }));
                            }}
                            className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                            required
                          >
                            <option value="">Seleccionar puntuación</option>
                            {scoreOptions.map((score) => (
                              <option key={score} value={score}>{score}</option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <label className="block text-sm font-semibold text-slate-800" htmlFor="recommendation">
                        Recomendación final
                      </label>
                      <select
                        id="recommendation"
                        value={reviewForm.recommendation}
                        onChange={(event) => {
                          setReviewForm((prev) => ({
                            ...prev,
                            recommendation: event.target.value as ConferenceReviewRecommendation | '',
                          }));
                        }}
                        className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                        required
                      >
                        <option value="">Seleccionar recomendación</option>
                        <option value="accept">Aceptar</option>
                        <option value="needs_discussion">Requiere discusión</option>
                        <option value="reject">Rechazar</option>
                      </select>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <label className="block text-sm font-semibold text-slate-800" htmlFor="comments">
                        Comentarios para el comité <span className="font-normal text-slate-400">(opcional)</span>
                      </label>
                      <textarea
                        id="comments"
                        value={reviewForm.comments}
                        onChange={(event) => {
                          setReviewForm((prev) => ({ ...prev, comments: event.target.value }));
                        }}
                        rows={5}
                        className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                        placeholder="Añade observaciones científicas o aspectos a discutir por el comité."
                      />
                    </div>

                    {reviewError && (
                      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {reviewError}
                      </div>
                    )}

                    {reviewSuccess && (
                      <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                        {reviewSuccess}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                      <p className="text-xs text-slate-400">
                        Al enviar, la evaluación quedará registrada y la asignación pasará a completada.
                      </p>
                      <button
                        type="submit"
                        disabled={reviewSubmitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {reviewSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Enviar evaluación
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Anonymization notice */}
            <div className="border-t border-slate-200 pt-4 mt-4">
              <div className="flex items-start gap-2 text-xs text-slate-400">
                <FileText size={14} className="mt-0.5 shrink-0" />
                <p>
                  Esta vista es exclusivamente de contenido científico. Los datos identificativos,
                  archivos y notas administrativas no están disponibles para evaluadores.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
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
            <p className="text-sm text-teal-100">Evaluación de comunicaciones</p>
          </div>
        </div>
      </header>
      <div className="bg-blue-600 text-white text-center py-1.5 text-xs font-semibold tracking-wide">
        Vista anonimizada para evaluación científica — Sin datos identificativos ni archivos.
      </div>

      <main className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Comunicaciones asignadas</h1>
          <p className="text-sm text-slate-500">Contenido científico para evaluación</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl bg-teal-50 p-3">
              <p className="text-2xl font-bold text-teal-700">{stats.total_assigned}</p>
              <p className="text-xs font-medium text-teal-600 opacity-80">Total asignadas</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
              <p className="text-xs font-medium text-amber-600 opacity-80">Pendientes</p>
            </div>
            <div className="rounded-xl bg-green-50 p-3">
              <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
              <p className="text-xs font-medium text-green-600 opacity-80">Completadas</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {assignments.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <CheckCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No tienes comunicaciones asignadas para evaluación.</p>
          </div>
        ) : (
          /* Table */
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Código</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Título</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Área</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Modalidad</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Asignada</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-teal-700">{s.submission_code}</td>
                    <td className="px-4 py-3 text-slate-800 max-w-xs truncate">{s.title}</td>
                    <td className="px-4 py-3 text-slate-600">{s.topic_area ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{modalityLabels[s.modality] ?? s.modality}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(s.assignment_status)}`}>
                        {assignmentStatusLabels[s.assignment_status] ?? s.assignment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(s.assigned_at).toLocaleDateString('es-ES')}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { void openDetail(s); }}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-50 transition-colors"
                      >
                        <Eye size={14} /> Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-sm text-slate-500">
          {assignments.length} comunicación{assignments.length !== 1 ? 'es' : ''} asignada{assignments.length !== 1 ? 's' : ''}
        </div>
      </main>
    </div>
  );
}
