import { useMemo, useState } from 'react';
import { CheckCircle2, Plus, Send, Trash2 } from 'lucide-react';
import '../ScientificPlatform.css';

const scientificSections = [
  'Introducción',
  'Objetivos',
  'Metodología y aspectos éticos',
  'Resultados',
  'Conclusiones',
];

const experienceSections = [
  'Problema y contexto',
  'Objetivo',
  'Intervención realizada',
  'Implementación y participación',
  'Resultados o cambios observados',
  'Aprendizajes, aplicabilidad y sostenibilidad',
];

const healthAreas = [
  'Badajoz',
  'Mérida',
  'Don Benito–Villanueva',
  'Llerena–Zafra',
  'Cáceres',
  'Coria',
  'Navalmoral de la Mata',
  'Plasencia',
];

const countWords = (value: string) =>
  value.trim() ? value.trim().split(/\s+/).length : 0;

const limitWords = (value: string, maximum: number) =>
  value.trim() ? value.trim().split(/\s+/).slice(0, maximum).join(' ') : '';

export function IIIJornadaSubmissionV2Page() {
  const [type, setType] = useState<'scientific' | 'experience'>('scientific');
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<Record<string, string>>({});
  const [coauthors, setCoauthors] = useState<string[]>([]);
  const [references, setReferences] = useState<string[]>(['']);
  const [sent, setSent] = useState(false);

  const fields = type === 'scientific' ? scientificSections : experienceSections;
  const words = useMemo(
    () => Object.values(sections).reduce((total, value) => total + countWords(value), 0),
    [sections],
  );

  function updateSection(name: string, value: string) {
    const otherWords = Object.entries(sections)
      .filter(([key]) => key !== name)
      .reduce((total, [, section]) => total + countWords(section), 0);

    setSections({
      ...sections,
      [name]: limitWords(value, Math.max(0, 400 - otherWords)),
    });
  }

  function updateType(nextType: 'scientific' | 'experience') {
    setType(nextType);
    setSections({});
    setReferences(nextType === 'scientific' ? [''] : []);
  }

  return (
    <div className="science-app">
      <div className="science-demo">VERSIÓN V2 DE REVISIÓN · LOS DATOS NO SE GUARDAN</div>
      <header className="science-header">
        <div>
          <span className="science-brand">ACASPEX</span>
          <span className="science-subtitle">Gestión científica de jornadas</span>
        </div>
        <span className="science-edition">III JORNADA · 2026</span>
      </header>
      <nav className="science-nav">
        <span className="active">Envío de resumen</span>
        <span>Evaluación ciega</span>
        <span>Comité científico</span>
      </nav>

      <main className="science-shell">
        <section className="science-hero">
          <p>III Jornada ACASPEX</p>
          <h1>Envío de resúmenes</h1>
          <p>
            Presenta un trabajo científico o una experiencia de mejora. Solo se evaluará el
            resumen; los cinco finalistas defenderán su póster.
          </p>
        </section>

        {sent ? (
          <section className="science-success">
            <CheckCircle2 size={46} />
            <div>
              <h2>Resumen preparado correctamente</h2>
              <p>
                En la versión conectada se asignará un código como <strong>ACX26-001</strong>.
                El envío será definitivo y el póster se subirá posteriormente mediante un enlace
                privado.
              </p>
              <button className="science-secondary" onClick={() => setSent(false)}>
                Volver
              </button>
            </div>
          </section>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
              window.scrollTo(0, 0);
            }}
          >
            <section className="science-notice">
              <strong>Fechas previstas:</strong> resúmenes hasta el 26 de septiembre, con posible
              prórroga hasta el 2 de octubre · pósteres hasta el 16 de octubre.
            </section>

            <section className="science-card">
              <div className="science-head">
                <div>
                  <span className="science-step">1</span>
                  <h2>Datos del resumen</h2>
                </div>
                <span className={`science-counter ${words > 360 ? 'warning' : ''}`}>
                  {words} / 400 palabras
                </span>
              </div>

              <label>
                Título <small>Máximo 15 palabras</small>
                <input
                  required
                  value={title}
                  onChange={(event) => setTitle(limitWords(event.target.value, 15))}
                />
                <em>{countWords(title)} / 15</em>
              </label>

              <div className="science-two">
                <label>
                  Tipo
                  <select
                    value={type}
                    onChange={(event) => updateType(event.target.value as typeof type)}
                  >
                    <option value="scientific">Trabajo científico</option>
                    <option value="experience">Experiencia de mejora</option>
                  </select>
                </label>
                <label>
                  Presentación
                  <select disabled>
                    <option>Póster A0 vertical (84,1 × 118,9 cm)</option>
                  </select>
                </label>
              </div>

              <h3>Resumen estructurado</h3>
              <p className="science-hint">
                El límite de 400 palabras se comparte entre todos los apartados.
              </p>
              {fields.map((name) => (
                <label key={name}>
                  {name}
                  <textarea
                    required
                    value={sections[name] || ''}
                    onChange={(event) => updateSection(name, event.target.value)}
                  />
                </label>
              ))}

              <h3>
                Bibliografía{' '}
                <small>
                  {type === 'scientific'
                    ? 'Obligatoria: entre 1 y 3 referencias'
                    : 'Opcional: hasta 3 referencias'}
                </small>
              </h3>
              {references.map((reference, index) => (
                <div className="science-author" key={`reference-${index}`}>
                  <span>{index + 1}</span>
                  <input
                    aria-label={`Referencia ${index + 1}`}
                    required={type === 'scientific'}
                    value={reference}
                    onChange={(event) =>
                      setReferences(
                        references.map((item, itemIndex) =>
                          itemIndex === index ? event.target.value : item,
                        ),
                      )
                    }
                  />
                  <button
                    aria-label={`Eliminar referencia ${index + 1}`}
                    type="button"
                    disabled={type === 'scientific' && references.length === 1}
                    onClick={() =>
                      setReferences(references.filter((_, itemIndex) => itemIndex !== index))
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {references.length < 3 && (
                <button
                  type="button"
                  className="science-secondary"
                  onClick={() => setReferences([...references, ''])}
                >
                  <Plus size={16} /> Añadir referencia
                </button>
              )}
            </section>

            <section className="science-card">
              <div className="science-head">
                <div>
                  <span className="science-step">2</span>
                  <h2>Autoría y contacto</h2>
                </div>
                <span className="science-counter">Entre 1 y 6 autores</span>
              </div>

              <div className="science-two">
                <label>
                  Autor/a principal
                  <input required />
                </label>
                <label>
                  Correo electrónico
                  <input type="email" required />
                </label>
              </div>
              <div className="science-three">
                <label>
                  Centro / institución
                  <input required />
                </label>
                <label>
                  Tipo de centro
                  <select required>
                    <option>Público</option>
                    <option>Privado</option>
                    <option>Concertado</option>
                    <option>Universidad</option>
                    <option>Otro</option>
                  </select>
                </label>
                <label>
                  Provincia
                  <input required />
                </label>
              </div>
              <div className="science-two">
                <label>
                  Área de salud
                  <select required>
                    <option value="">Seleccionar…</option>
                    {healthAreas.map((area) => (
                      <option key={area}>{area}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Servicio / unidad
                  <input required />
                </label>
              </div>
              <div className="science-checks">
                <label>
                  <input type="checkbox" /> Es socio/a de ACASPEX
                </label>
                <label>
                  <input type="checkbox" required /> Presentará el póster si resulta finalista
                </label>
              </div>

              <h3>
                Resto de autores <small>Opcional: hasta 5 coautores</small>
              </h3>
              {coauthors.map((author, index) => (
                <div className="science-author" key={`coauthor-${index}`}>
                  <span>{index + 2}</span>
                  <input
                    aria-label={`Coautor ${index + 2}`}
                    required
                    value={author}
                    onChange={(event) =>
                      setCoauthors(
                        coauthors.map((item, itemIndex) =>
                          itemIndex === index ? event.target.value : item,
                        ),
                      )
                    }
                  />
                  <button
                    aria-label={`Eliminar coautor ${index + 2}`}
                    type="button"
                    onClick={() =>
                      setCoauthors(coauthors.filter((_, itemIndex) => itemIndex !== index))
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {coauthors.length < 5 && (
                <button
                  type="button"
                  className="science-secondary"
                  onClick={() => setCoauthors([...coauthors, ''])}
                >
                  <Plus size={16} /> Añadir coautor
                </button>
              )}
            </section>

            <section className="science-card">
              <div className="science-head">
                <div>
                  <span className="science-step">3</span>
                  <h2>Confirmación</h2>
                </div>
              </div>
              <div className="science-checks vertical">
                <label>
                  <input type="checkbox" required /> El resumen no contiene datos identificativos
                  de pacientes.
                </label>
                <label>
                  <input type="checkbox" required /> La información es correcta y el envío será
                  definitivo.
                </label>
                <label>
                  <input type="checkbox" required /> Acepto la política de privacidad.
                </label>
              </div>
              <button className="science-primary">
                <Send size={17} /> Enviar resumen definitivo
              </button>
            </section>
          </form>
        )}
      </main>
      <footer className="science-footer">
        ACASPEX · Asociación Extremeña de Calidad Asistencial y Seguridad del Paciente
      </footer>
    </div>
  );
}
