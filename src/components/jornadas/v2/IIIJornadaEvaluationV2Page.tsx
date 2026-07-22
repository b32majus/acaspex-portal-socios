import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, Send } from 'lucide-react';
import {
  fetchReviewerAssignmentsV2,
  fetchReviewerSubmissionV2,
  submitConferenceReviewV2,
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

  async function loadAssignments(preferredId?: string) {
    if (preview) return;
    setLoading(true);
    setError('');
    try {
      const rows = await fetchReviewerAssignmentsV2();
      setAssignments(rows);
      const candidate =
        rows.find((item) => item.id === preferredId && item.assignment_status !== 'completed') ??
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
      return;
    }
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setError('');
    fetchReviewerSubmissionV2(selectedId)
      .then((row) => {
        if (!cancelled) setDetail(row);
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(null);
          setError('No se pudo cargar el contenido ciego del trabajo seleccionado.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [preview, selectedId]);

  const selectedAssignment = useMemo(
    () => assignments.find((item) => item.id === selectedId) ?? null,
    [assignments, selectedId],
  );

  async function handleSubmit() {
    if (!detail || !selectedAssignment || !canSubmit) return;
    if (preview) {
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
      setScores(criteria.map(() => 0));
      setAuthorFeedback('');
      setConfidentialFeedback('');
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
            <div><strong>Evaluación registrada correctamente.</strong></div>
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
                          disabled={selectedAssignment?.assignment_status === 'completed'}
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
                    disabled={selectedAssignment?.assignment_status === 'completed'}
                    value={authorFeedback}
                    onChange={(event) => setAuthorFeedback(event.target.value)}
                  />
                </label>
                <label>
                  Comentario confidencial al comité <small>Obligatorio</small>
                  <textarea
                    required
                    disabled={selectedAssignment?.assignment_status === 'completed'}
                    value={confidentialFeedback}
                    onChange={(event) => setConfidentialFeedback(event.target.value)}
                  />
                </label>
                <button
                  className="science-primary"
                  disabled={!canSubmit || selectedAssignment?.assignment_status === 'completed'}
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
