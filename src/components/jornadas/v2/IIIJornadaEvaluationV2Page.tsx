import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, Send } from 'lucide-react';
import {
  fetchReviewerAssignmentsV2,
  fetchReviewerSubmissionV2,
  fetchOwnConferenceReviewV2,
  submitConferenceReviewV2,
  type OwnConferenceReviewV2,
  type ReviewerAssignmentV2,
  type ReviewerSubmissionDetailV2,
} from '../../../lib/conferenceV2Client';
import '../ScientificPlatform.css';

const criteria = [
  { label: 'Relevancia', weight: 10 },
  { label: 'Introducción y objetivos', weight: 15 },
  { label: 'Metodología o intervención', weight: 25 },
  { label: 'Resultados', weight: 25 },
  { label: 'Conclusiones y aplicabilidad', weight: 15 },
  { label: 'Claridad', weight: 10 },
];

const sectionLabels: Record<string, string> = {
  introduction: 'Introducción / problema y contexto',
  objectives: 'Objetivos',
  methodology_or_intervention: 'Metodología o intervención',
  implementation_participation: 'Implementación y participación',
  results: 'Resultados o cambios observados',
  conclusions: 'Conclusiones, aplicabilidad y sostenibilidad',
  ethical_considerations: 'Aspectos éticos',
};

const previewAssignments: ReviewerAssignmentV2[] = [
  {
    id: 'preview-assignment-1',
    submission_code: 'PRUEBA-001',
    title: 'Impacto de una intervención multidisciplinar en la continuidad asistencial',
    submission_type: 'scientific_work',
    assignment_status: 'assigned',
    evaluation_round: 'first',
    assigned_at: '2026-07-22T08:00:00Z',
  },
  {
    id: 'preview-assignment-2',
    submission_code: 'PRUEBA-002',
    title: 'Experiencia de mejora del circuito de información al alta',
    submission_type: 'improvement_experience',
    assignment_status: 'completed',
    evaluation_round: 'first',
    assigned_at: '2026-07-22T08:00:00Z',
  },
];

const previewDetails: Record<string, ReviewerSubmissionDetailV2> = {
  'preview-assignment-1': {
    submission_code: 'PRUEBA-001',
    title: 'Impacto de una intervención multidisciplinar en la continuidad asistencial',
    submission_type: 'scientific_work',
    evaluation_round: 'first',
    sections: {
      introduction: 'La continuidad asistencial requiere una comunicación estructurada entre niveles y profesionales.',
      objectives: 'Evaluar el efecto de una intervención multidisciplinar sobre la calidad de la información al alta.',
      methodology_or_intervention: 'Estudio antes-después con indicadores definidos previamente y seguimiento durante seis meses.',
      results: 'Mejoró la cumplimentación de la información esencial y disminuyeron las incidencias comunicadas.',
      conclusions: 'La intervención fue factible y muestra potencial para su extensión a otras unidades.',
    },
    reference_list: ['Referencia bibliográfica simulada para la revisión visual.'],
  },
  'preview-assignment-2': {
    submission_code: 'PRUEBA-002',
    title: 'Experiencia de mejora del circuito de información al alta',
    submission_type: 'improvement_experience',
    evaluation_round: 'first',
    sections: {
      introduction: 'Se detectó variabilidad en la información entregada a pacientes y familias en el momento del alta.',
      objectives: 'Estandarizar la información esencial y facilitar la continuidad de los cuidados.',
      methodology_or_intervention: 'Se diseñó una lista de verificación consensuada y se pilotó en dos unidades.',
      results: 'Aumentó la cumplimentación de recomendaciones y disminuyeron las consultas posteriores por dudas.',
      conclusions: 'La experiencia permitió integrar una herramienta sencilla en la práctica habitual.',
    },
    reference_list: [],
  },
};

const previewCompletedReview: OwnConferenceReviewV2 = {
  score_relevance: 4,
  score_intro_objectives: 4,
  score_methodology: 5,
  score_results: 4,
  score_conclusions_applicability: 4,
  score_clarity: 5,
  author_recommendations: 'Se recomienda concretar el periodo de seguimiento de la experiencia.',
  confidential_committee_comment: 'Trabajo pertinente y bien estructurado para la jornada.',
  weighted_total: 87,
  evaluation_round: 'first',
  submitted_at: '2026-07-22T10:30:00Z',
};

type IIIJornadaEvaluationV2PageProps = {
  preview?: boolean;
};

export function IIIJornadaEvaluationV2Page({ preview = false }: IIIJornadaEvaluationV2PageProps) {
  const [assignments, setAssignments] = useState<ReviewerAssignmentV2[]>(preview ? previewAssignments : []);
  const [selectedId, setSelectedId] = useState(preview ? previewAssignments[0].id : '');
  const [detail, setDetail] = useState<ReviewerSubmissionDetailV2 | null>(
    preview ? previewDetails[previewAssignments[0].id] : null,
  );
  const [scores, setScores] = useState(criteria.map(() => 0));
  const [authorFeedback, setAuthorFeedback] = useState('');
  const [confidentialFeedback, setConfidentialFeedback] = useState('');
  const [savedReview, setSavedReview] = useState<OwnConferenceReviewV2 | null>(null);
  const [previewReviews, setPreviewReviews] = useState<Record<string, OwnConferenceReviewV2>>({
    'preview-assignment-2': previewCompletedReview,
  });
  const [loading, setLoading] = useState(!preview);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const completed = assignments.filter((item) => item.assignment_status === 'completed').length;
  const pending = assignments.length - completed;
  const total = Math.round(
    scores.reduce(
      (score, value, index) => score + (value / 5) * criteria[index].weight,
      0,
    ),
  );
  const canSubmit =
    Boolean(detail) &&
    scores.every((score) => score >= 1 && score <= 5) &&
    authorFeedback.trim().length > 0 &&
    confidentialFeedback.trim().length > 0 &&
    !submitting;
  const missingCriteria = scores.filter((score) => score < 1 || score > 5).length;
  const authorFeedbackMissing = authorFeedback.trim().length === 0;
  const confidentialFeedbackMissing = confidentialFeedback.trim().length === 0;

  async function loadAssignments(preferredId?: string) {
    if (preview) return;
    setLoading(true);
    setError('');
    try {
      const rows = await fetchReviewerAssignmentsV2();
      setAssignments(rows);
      const candidate =
        rows.find((item) => item.id === preferredId) ??
        rows.find((item) => item.assignment_status !== 'completed') ??
        rows[0];
      setSelectedId(candidate?.id ?? '');
    } catch {
      setError(
        'No se pudieron cargar las asignaciones. Comprueba que has iniciado sesión con una cuenta del comité científico.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (preview) return;
    void loadAssignments();
  }, [preview]);

  useEffect(() => {
    if (preview) {
      setDetail(previewDetails[selectedId] ?? null);
      const storedReview = previewReviews[selectedId] ?? null;
      setSavedReview(storedReview);
      setScores(storedReview
        ? [
          storedReview.score_relevance,
          storedReview.score_intro_objectives,
          storedReview.score_methodology,
          storedReview.score_results,
          storedReview.score_conclusions_applicability,
          storedReview.score_clarity,
        ]
        : criteria.map(() => 0));
      setAuthorFeedback(storedReview?.author_recommendations ?? '');
      setConfidentialFeedback(storedReview?.confidential_committee_comment ?? '');
      setError('');
      setSuccess(false);
      return;
    }
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setError('');
    const assignment = assignments.find((item) => item.id === selectedId);
    Promise.all([
      fetchReviewerSubmissionV2(selectedId),
      assignment?.assignment_status === 'completed'
        ? fetchOwnConferenceReviewV2(selectedId)
        : Promise.resolve(null),
    ])
      .then(([row, ownReview]) => {
        if (cancelled) return;
        setDetail(row);
        setSavedReview(ownReview);
        setScores(ownReview
          ? [
            ownReview.score_relevance,
            ownReview.score_intro_objectives,
            ownReview.score_methodology,
            ownReview.score_results,
            ownReview.score_conclusions_applicability,
            ownReview.score_clarity,
          ]
          : criteria.map(() => 0));
        setAuthorFeedback(ownReview?.author_recommendations ?? '');
        setConfidentialFeedback(ownReview?.confidential_committee_comment ?? '');
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(null);
          setSavedReview(null);
          setError('No se pudo cargar el trabajo o la evaluación registrada.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [assignments, preview, previewReviews, selectedId]);

  const selectedAssignment = useMemo(
    () => assignments.find((item) => item.id === selectedId) ?? null,
    [assignments, selectedId],
  );
  const selectedAssignmentCompleted = selectedAssignment?.assignment_status === 'completed';

  async function handleSubmit() {
    setError('');
    setSuccess(false);

    if (!detail || !selectedAssignment) {
      setError('Selecciona un trabajo pendiente antes de enviar la evaluación.');
      return;
    }
    if (selectedAssignment.assignment_status === 'completed') {
      setError('Este trabajo ya figura como evaluado y no puede volver a enviarse.');
      return;
    }
    if (!canSubmit) {
      const missing: string[] = [];
      if (missingCriteria > 0) {
        missing.push(
          `${missingCriteria} ${missingCriteria === 1 ? 'criterio sin puntuar' : 'criterios sin puntuar'}`,
        );
      }
      if (authorFeedbackMissing) missing.push('las recomendaciones para los autores');
      if (confidentialFeedbackMissing) missing.push('el comentario confidencial al comité');
      setError(`Antes de enviar, completa: ${missing.join(', ')}.`);
      return;
    }
    if (preview) {
      const simulatedReview: OwnConferenceReviewV2 = {
        score_relevance: scores[0],
        score_intro_objectives: scores[1],
        score_methodology: scores[2],
        score_results: scores[3],
        score_conclusions_applicability: scores[4],
        score_clarity: scores[5],
        author_recommendations: authorFeedback.trim(),
        confidential_committee_comment: confidentialFeedback.trim(),
        weighted_total: total,
        evaluation_round: selectedAssignment.evaluation_round,
        submitted_at: new Date().toISOString(),
      };
      setAssignments((current) =>
        current.map((item) =>
          item.id === selectedAssignment.id
            ? { ...item, assignment_status: 'completed' }
            : item,
        ),
      );
      setPreviewReviews((current) => ({
        ...current,
        [selectedAssignment.id]: simulatedReview,
      }));
      setSavedReview(simulatedReview);
      setSuccess(true);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitConferenceReviewV2({
        submissionId: selectedAssignment.id,
        scores: scores as [number, number, number, number, number, number],
        authorRecommendations: authorFeedback,
        confidentialCommitteeComment: confidentialFeedback,
      });
      setSuccess(true);
      await loadAssignments(selectedAssignment.id);
    } catch {
      setError(
        'No se pudo enviar la evaluación. Puede que ya esté registrada o que la asignación no esté activa.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="science-app">
      <div className={`science-demo ${preview ? '' : 'connected'}`}>
        {preview
          ? 'VISTA DE PRUEBA · DATOS SIMULADOS · NO GUARDA EVALUACIONES'
          : 'VERSIÓN V2 CONECTADA A STAGING · EVALUACIÓN REAL'}
      </div>
      <header className="science-header">
        <div>
          <span className="science-brand">ACASPEX</span>
          <span className="science-subtitle">Gestión científica de jornadas</span>
        </div>
        <span className="science-edition">III JORNADA · 2026</span>
      </header>
      <nav className="science-nav">
        <span>Envío de resumen</span>
        <span className="active">Evaluación ciega</span>
        <span>Comité científico</span>
      </nav>

      <main className="science-shell">
        <section className="science-hero">
          <p>Panel del evaluador</p>
          <h1>Evaluación ciega</h1>
          <p>
            Solo puedes consultar los trabajos asignados. La identidad y el centro de los autores
            permanecen ocultos.
          </p>
        </section>

        {preview && (
          <section className="science-notice">
            Esta vista permite revisar el circuito antes de activar las cuentas del comité. Los
            textos, códigos y puntuaciones son simulados y no se guardan.
          </section>
        )}

        {error && <section className="science-error">{error}</section>}
        {success && (
          <section className="science-success compact">
            <CheckCircle2 size={28} />
            <div>
              <strong>
                {preview
                  ? 'Evaluación de prueba completada correctamente.'
                  : 'Evaluación registrada correctamente.'}
              </strong>
              {preview && <p>No se ha guardado ningún dato real.</p>}
            </div>
          </section>
        )}

        <section className="science-metrics three">
          <article><span>{assignments.length}</span><p>Trabajos asignados</p></article>
          <article><span>{completed}</span><p>Completados</p></article>
          <article><span>{pending}</span><p>Pendientes</p></article>
        </section>

        {loading ? (
          <section className="science-card science-empty">Cargando asignaciones…</section>
        ) : assignments.length === 0 ? (
          <section className="science-card science-empty">
            No hay trabajos asignados a esta cuenta.
          </section>
        ) : (
          <>
            <section className="science-card">
              <label>
                Trabajo asignado
                <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                  {assignments.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.submission_code} · {item.title} · {item.assignment_status === 'completed' ? 'Completado' : 'Pendiente'}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <div className="science-review">
              <section className="science-card science-paper">
                {detail ? (
                  <>
                    <div>
                      <span className="science-pill">{detail.submission_code}</span>{' '}
                      <span className="science-pill">
                        {detail.submission_type === 'scientific_work'
                          ? 'Trabajo científico'
                          : 'Experiencia de mejora'}
                      </span>{' '}
                      <span className="science-pill">
                        {detail.evaluation_round === 'third'
                          ? '3.ª revisión'
                          : detail.evaluation_round === 'second'
                            ? '2.ª revisión'
                            : '1.ª revisión'}
                      </span>
                    </div>
                    <h2>{detail.title}</h2>
                    {Object.entries(detail.sections).map(([key, paragraph]) => (
                      <div key={key}>
                        <h3>{sectionLabels[key] ?? key}</h3>
                        <p>{paragraph}</p>
                      </div>
                    ))}
                    {detail.reference_list.length > 0 && (
                      <div>
                        <h3>Bibliografía</h3>
                        <ol>
                          {detail.reference_list.map((reference, index) => (
                            <li key={`${reference}-${index}`}>{reference}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    <div className="science-notice">
                      <Eye size={16} /> Autoría, centro, contacto y archivos permanecen ocultos.
                    </div>
                  </>
                ) : (
                  <p>Cargando contenido ciego…</p>
                )}
              </section>

              <aside className="science-card science-scoring">
                <div className="science-head">
                  <div><h2>Tu evaluación</h2></div>
                  <span className="science-counter">{total} / 100</span>
                </div>

                {criteria.map((criterion, index) => (
                  <fieldset className="science-score" key={criterion.label}>
                    <legend>{criterion.label} · {criterion.weight} %</legend>
                    <small>Puntúa de 1 a 5 según la calidad y coherencia del apartado.</small>
                    <div>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          type="button"
                          className={scores[index] === value ? 'chosen' : ''}
                          disabled={selectedAssignmentCompleted}
                          onClick={() =>
                            setScores(scores.map((score, scoreIndex) =>
                              scoreIndex === index ? value : score,
                            ))
                          }
                          key={value}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ))}

                <label>
                  Recomendaciones para los autores <small>Obligatorio</small>
                  <textarea
                    required
                    disabled={selectedAssignmentCompleted}
                    value={authorFeedback}
                    onChange={(event) => setAuthorFeedback(event.target.value)}
                  />
                </label>
                <label>
                  Comentario confidencial al comité <small>Obligatorio</small>
                  <textarea
                    required
                    disabled={selectedAssignmentCompleted}
                    value={confidentialFeedback}
                    onChange={(event) => setConfidentialFeedback(event.target.value)}
                  />
                </label>
                {selectedAssignmentCompleted ? (
                  <div className="science-notice" role="status">
                    {savedReview ? (
                      <>
                        Evaluación enviada el{' '}
                        {new Intl.DateTimeFormat('es-ES', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(savedReview.submitted_at))}
                        {' · '}Puntuación ponderada: {Number(savedReview.weighted_total).toFixed(0)} / 100.
                        Tus puntuaciones y comentarios se muestran en modo lectura.
                      </>
                    ) : (
                      'Este trabajo figura como evaluado. Cargando la evaluación registrada…'
                    )}
                  </div>
                ) : (
                  <div className="science-hint" aria-live="polite">
                    <strong>Requisitos para enviar:</strong>{' '}
                    {missingCriteria > 0
                      ? `faltan ${missingCriteria} de los 6 criterios por puntuar`
                      : 'los 6 criterios están puntuados'}
                    ; las recomendaciones para los autores y el comentario confidencial al comité
                    son obligatorios.
                  </div>
                )}
                <button
                  className="science-primary"
                  disabled={
                    submitting ||
                    selectedAssignmentCompleted ||
                    (!preview && !canSubmit)
                  }
                  onClick={handleSubmit}
                >
                  <Send size={17} /> {submitting ? 'Enviando…' : 'Enviar evaluación'}
                </button>
              </aside>
            </div>
          </>
        )}
      </main>
      <footer className="science-footer">
        ACASPEX · Asociación Extremeña de Calidad Asistencial y Seguridad del Paciente
      </footer>
    </div>
  );
}
