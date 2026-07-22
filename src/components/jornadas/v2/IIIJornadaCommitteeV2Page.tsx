import { useEffect, useState } from 'react';
import { Download, FileBarChart, Sparkles } from 'lucide-react';
import {
  fetchCommitteeDashboardV2,
  type CommitteeDashboardV2,
  type CommitteeSubmissionV2,
} from '../../../lib/conferenceV2Client';
import '../ScientificPlatform.css';

const statusLabels: Record<string, string> = {
  received: 'Recibido',
  under_review: 'En revisión',
  accepted: 'Aceptado',
  rejected: 'No aceptado',
  needs_info: 'Información pendiente',
  poster_pending: 'Póster pendiente',
  poster_received: 'Póster recibido',
  archived: 'Archivado',
};

function score(value: number | null): string {
  return value === null ? '—' : Number(value).toFixed(0);
}

function reviewState(item: CommitteeSubmissionV2): string {
  if (item.third_review_required && item.third_total === null) return '3.ª revisión';
  if (item.final_median_total !== null) return 'Evaluado';
  if (item.first_total !== null || item.second_total !== null) return 'En evaluación';
  return statusLabels[item.status] ?? item.status;
}

const previewDashboard: CommitteeDashboardV2 = {
  event_id: 'preview-event',
  event_status: 'open',
  total_submissions: 6,
  scientific_count: 4,
  experience_count: 2,
  member_count: 3,
  completed_assignments: 7,
  total_assignments: 12,
};

const previewSubmissions: CommitteeSubmissionV2[] = [
  {
    submission_id: 'preview-submission-1',
    submission_code: 'PRUEBA-001',
    title: 'Impacto de una intervención multidisciplinar en la continuidad asistencial',
    submission_type: 'scientific_work',
    status: 'under_review',
    first_total: 82,
    second_total: 78,
    third_total: null,
    third_review_required: false,
    final_median_total: 80,
  },
  {
    submission_id: 'preview-submission-2',
    submission_code: 'PRUEBA-002',
    title: 'Experiencia de mejora del circuito de información al alta',
    submission_type: 'improvement_experience',
    status: 'under_review',
    first_total: 88,
    second_total: 54,
    third_total: null,
    third_review_required: true,
    final_median_total: null,
  },
  {
    submission_id: 'preview-submission-3',
    submission_code: 'PRUEBA-003',
    title: 'Resultados de un programa de mejora de la experiencia del paciente',
    submission_type: 'scientific_work',
    status: 'received',
    first_total: null,
    second_total: null,
    third_total: null,
    third_review_required: false,
    final_median_total: null,
  },
];

type IIIJornadaCommitteeV2PageProps = {
  preview?: boolean;
};

export function IIIJornadaCommitteeV2Page({ preview = false }: IIIJornadaCommitteeV2PageProps) {
  const [dashboard, setDashboard] = useState<CommitteeDashboardV2 | null>(preview ? previewDashboard : null);
  const [submissions, setSubmissions] = useState<CommitteeSubmissionV2[]>(preview ? previewSubmissions : []);
  const [loading, setLoading] = useState(!preview);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preview) return;
    let cancelled = false;
    fetchCommitteeDashboardV2()
      .then((result) => {
        if (!cancelled) {
          setDashboard(result.dashboard);
          setSubmissions(result.submissions);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            'No se pudo cargar el panel. Se requiere una cuenta administradora, presidenta o vicepresidenta de esta jornada.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [preview]);

  const completionPercent = dashboard?.total_assignments
    ? Math.round((dashboard.completed_assignments / dashboard.total_assignments) * 100)
    : 0;
  return (
    <div className="science-app">
      <div className={`science-demo ${preview ? '' : 'connected'}`}>
        {preview
          ? 'VISTA DE PRUEBA · DATOS SIMULADOS · SIN ACCESO A INFORMACIÓN REAL'
          : `VERSIÓN V2 CONECTADA A STAGING · EVENTO ${dashboard?.event_status?.toUpperCase() ?? '—'}`}
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
        <span>Evaluación ciega</span>
        <span className="active">Comité científico</span>
      </nav>

      <main className="science-shell">
        {preview && (
          <section className="science-notice">
            Vista visual previa para presidencia y vicepresidencia. Todos los códigos, títulos,
            cifras y resultados que aparecen aquí son simulados.
          </section>
        )}
        <section className="science-hero row">
          <div>
            <p>Acceso restringido</p>
            <h1>Comité científico</h1>
            <p>Panel privado de presidencia y vicepresidencia.</p>
          </div>
          <button className="science-secondary" disabled>
            <Download size={17} /> Exportar datos y autores
          </button>
        </section>

        {error && <section className="science-error">{error}</section>}
        {loading && <section className="science-card science-empty">Cargando panel…</section>}

        <section className="science-metrics">
          <article><span>{dashboard?.total_submissions ?? 0}</span><p>Resúmenes recibidos</p></article>
          <article>
            <span>{dashboard?.scientific_count ?? 0} / {dashboard?.experience_count ?? 0}</span>
            <p>Científicos / experiencias</p>
          </article>
          <article><span>{dashboard?.member_count ?? 0}</span><p>Socios ACASPEX</p></article>
          <article><span>{completionPercent} %</span><p>Evaluaciones completadas</p></article>
        </section>

        <section className="science-card">
          <div className="science-head">
            <div><h2>Seguimiento de resúmenes</h2></div>
            <button className="science-secondary" disabled>
              <Sparkles size={16} /> Asignación automática
            </button>
          </div>
          {submissions.length === 0 ? (
            <div className="science-empty">
              No hay resúmenes registrados. El evento permanece cerrado mientras está en borrador.
            </div>
          ) : (
            <div className="science-table-wrap">
              <table className="science-table">
                <thead>
                  <tr>
                    <th>Código</th><th>Título</th><th>Tipo</th><th>Evaluación</th><th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((item) => (
                    <tr key={item.submission_id}>
                      <td>{item.submission_code}</td>
                      <td>{item.title}</td>
                      <td>
                        {item.submission_type === 'scientific_work' ? 'Científico' : 'Experiencia'}
                      </td>
                      <td>
                        {score(item.first_total)} / {score(item.second_total)}
                        {item.third_total !== null ? ` / ${score(item.third_total)}` : ''}
                        {item.final_median_total !== null
                          ? ` · final ${score(item.final_median_total)}`
                          : ''}
                      </td>
                      <td><span className="science-status">{reviewState(item)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="science-admin-grid">
          <section className="science-card">
            <h2>Selección de finalistas</h2>
            <p className="science-hint">
              2 científicos + 2 experiencias + mejor puntuación global restante.
            </p>
            <div className="science-empty">
              La selección se habilitará cuando las evaluaciones estén completas. Esta vista no
              propone finalistas automáticamente.
            </div>
          </section>
          <section className="science-card">
            <h2>Datos para la clausura</h2>
            <div className="science-bars">
              <p>
                <span>Trabajo científico</span>
                <b style={{
                  width: `${dashboard?.total_submissions
                    ? Math.round((dashboard.scientific_count / dashboard.total_submissions) * 100)
                    : 0}%`,
                }} />
              </p>
              <p>
                <span>Experiencia de mejora</span>
                <b style={{
                  width: `${dashboard?.total_submissions
                    ? Math.round((dashboard.experience_count / dashboard.total_submissions) * 100)
                    : 0}%`,
                }} />
              </p>
              <p><span>Evaluaciones completadas</span><b style={{ width: `${completionPercent}%` }} /></p>
            </div>
            <button className="science-secondary" disabled>
              <FileBarChart size={16} /> Preparar informe de clausura
            </button>
          </section>
        </div>

        <section className="science-card">
          <h2>Proceso científico previsto</h2>
          <p className="science-hint">
            Conflictos declarados antes de asignar · dos evaluaciones ciegas · tercera revisión si
            la diferencia es ≥30 puntos · mediana de tres · selección de cinco finalistas · defensa
            70 % y diseño 30 %.
          </p>
        </section>
      </main>
      <footer className="science-footer">
        ACASPEX · Asociación Extremeña de Calidad Asistencial y Seguridad del Paciente
      </footer>
    </div>
  );
}
