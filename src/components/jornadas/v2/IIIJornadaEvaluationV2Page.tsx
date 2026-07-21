import { useState } from 'react';
import { Eye, Send } from 'lucide-react';
import '../ScientificPlatform.css';

const criteria = [
  { label: 'Relevancia', weight: 10 },
  { label: 'Introducción y objetivos', weight: 15 },
  { label: 'Metodología o intervención', weight: 25 },
  { label: 'Resultados', weight: 25 },
  { label: 'Conclusiones y aplicabilidad', weight: 15 },
  { label: 'Claridad', weight: 10 },
];

const paperSections = [
  ['Introducción', 'La seguridad del paciente exige estrategias sostenidas para mejorar la adherencia profesional.'],
  ['Objetivos', 'Evaluar el efecto de una intervención multimodal en tres unidades asistenciales.'],
  ['Metodología y aspectos éticos', 'Estudio cuasiexperimental antes-después con indicadores observacionales y análisis agregado.'],
  ['Resultados', 'La adherencia aumentó del 58 % al 84 % tras seis meses de intervención.'],
  ['Conclusiones', 'La intervención fue efectiva y puede incorporarse al programa anual de seguridad.'],
];

export function IIIJornadaEvaluationV2Page() {
  const [scores, setScores] = useState(criteria.map(() => 0));
  const [authorFeedback, setAuthorFeedback] = useState('');
  const [confidentialFeedback, setConfidentialFeedback] = useState('');

  const total = Math.round(
    scores.reduce(
      (score, value, index) => score + (value / 5) * criteria[index].weight,
      0,
    ),
  );

  return (
    <div className="science-app">
      <div className="science-demo">VERSIÓN V2 DE REVISIÓN · LA EVALUACIÓN NO SE GUARDA</div>
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

        <section className="science-metrics three">
          <article><span>4</span><p>Trabajos asignados</p></article>
          <article><span>1</span><p>Completados</p></article>
          <article><span>3</span><p>Pendientes</p></article>
        </section>

        <div className="science-review">
          <section className="science-card science-paper">
            <div>
              <span className="science-pill">ACX26-014</span>{' '}
              <span className="science-pill">Trabajo científico</span>
            </div>
            <h2>Efectividad de una intervención multimodal para mejorar la higiene de manos</h2>
            {paperSections.map(([heading, paragraph]) => (
              <div key={heading}>
                <h3>{heading}</h3>
                <p>{paragraph}</p>
              </div>
            ))}
            <div className="science-notice">
              <Eye size={16} /> Autoría, centro, contacto y archivos permanecen ocultos.
            </div>
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
                value={authorFeedback}
                onChange={(event) => setAuthorFeedback(event.target.value)}
              />
            </label>
            <label>
              Comentario confidencial al comité <small>Obligatorio</small>
              <textarea
                required
                value={confidentialFeedback}
                onChange={(event) => setConfidentialFeedback(event.target.value)}
              />
            </label>
            <div className="science-notice">
              El envío se activará cuando la v2 esté conectada y los seis criterios y ambos
              comentarios estén completos.
            </div>
            <button className="science-primary" disabled>
              <Send size={17} /> Enviar evaluación
            </button>
          </aside>
        </div>
      </main>
      <footer className="science-footer">
        ACASPEX · Asociación Extremeña de Calidad Asistencial y Seguridad del Paciente
      </footer>
    </div>
  );
}
