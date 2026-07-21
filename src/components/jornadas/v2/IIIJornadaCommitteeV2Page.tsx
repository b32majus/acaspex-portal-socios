import { Download, FileBarChart, Sparkles } from 'lucide-react';
import '../ScientificPlatform.css';

const submissions = [
  ['ACX26-001', 'Seguridad en la administración de medicación', 'Científico', '82 / 86', 'Evaluado'],
  ['ACX26-002', 'Acompañamiento al alta de pacientes frágiles', 'Experiencia', '74 / 78', 'Evaluado'],
  ['ACX26-003', 'Mejora del registro de eventos adversos', 'Experiencia', '91 / —', 'Pendiente'],
  ['ACX26-004', 'Adherencia a higiene de manos', 'Científico', '52 / 87', '3.ª revisión'],
];

const finalists = [
  ['ACX26-018', '92 puntos · Científico'],
  ['ACX26-003', '89 puntos · Experiencia'],
  ['ACX26-027', '87 puntos · Científico'],
  ['ACX26-011', '85 puntos · Experiencia'],
  ['ACX26-021', '84 puntos · Mejor global'],
];

export function IIIJornadaCommitteeV2Page() {
  return (
    <div className="science-app">
      <div className="science-demo">VERSIÓN V2 DE REVISIÓN · DATOS SIMULADOS</div>
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

        <section className="science-metrics">
          <article><span>36</span><p>Resúmenes recibidos</p></article>
          <article><span>21 / 15</span><p>Científicos / experiencias</p></article>
          <article><span>14</span><p>Socios ACASPEX</p></article>
          <article><span>62 %</span><p>Evaluaciones completadas</p></article>
        </section>

        <section className="science-card">
          <div className="science-head">
            <div><h2>Seguimiento de resúmenes</h2></div>
            <button className="science-secondary" disabled>
              <Sparkles size={16} /> Asignación automática
            </button>
          </div>
          <div className="science-table-wrap">
            <table className="science-table">
              <thead>
                <tr><th>Código</th><th>Título</th><th>Tipo</th><th>Evaluación</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {submissions.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, index) => (
                      <td key={`${row[0]}-${index}`}>
                        <span className={index === 4 ? 'science-status' : ''}>{cell}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="science-admin-grid">
          <section className="science-card">
            <h2>Selección de finalistas</h2>
            <p className="science-hint">
              2 científicos + 2 experiencias + mejor puntuación global restante.
            </p>
            <ol className="science-finalists">
              {finalists.map(([code, detail]) => (
                <li key={code}><b>{code}</b><span>{detail}</span></li>
              ))}
            </ol>
          </section>
          <section className="science-card">
            <h2>Datos para la clausura</h2>
            <div className="science-bars">
              <p><span>Trabajo científico</span><b style={{ width: '58%' }} /></p>
              <p><span>Experiencia de mejora</span><b style={{ width: '42%' }} /></p>
              <p><span>Evaluaciones completadas</span><b style={{ width: '62%' }} /></p>
            </div>
            <button className="science-secondary" disabled>
              <FileBarChart size={16} /> Preparar informe de clausura
            </button>
          </section>
        </div>

        <section className="science-card">
          <h2>Proceso científico previsto</h2>
          <p className="science-hint">
            Conflictos de interés · dos evaluadores · tercera revisión con diferencia ≥30 ·
            mediana · desempates · defensa 70 % y diseño 30 % · certificados y clausura.
          </p>
        </section>
      </main>
      <footer className="science-footer">
        ACASPEX · Asociación Extremeña de Calidad Asistencial y Seguridad del Paciente
      </footer>
    </div>
  );
}
