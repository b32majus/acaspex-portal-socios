import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Plus, Send, Trash2 } from 'lucide-react';
import {
  ConferenceV2Error,
  conferenceV2EventSlug,
  fetchConferenceEventAvailabilityV2,
  submitConferenceSubmissionV2,
  type ConferenceEventAvailabilityV2,
} from '../../../lib/conferenceV2Client';
import '../ScientificPlatform.css';

const scientificSections = [
  { key: 'introduction', label: 'Introducción' },
  { key: 'objectives', label: 'Objetivos' },
  { key: 'methodology', label: 'Metodología y aspectos éticos' },
  { key: 'results', label: 'Resultados' },
  { key: 'conclusions', label: 'Conclusiones' },
] as const;

const experienceSections = [
  { key: 'context', label: 'Problema y contexto' },
  { key: 'objective', label: 'Objetivo' },
  { key: 'intervention', label: 'Intervención realizada' },
  { key: 'implementation', label: 'Implementación y participación' },
  { key: 'results', label: 'Resultados o cambios observados' },
  { key: 'lessons', label: 'Aprendizajes, aplicabilidad y sostenibilidad' },
] as const;

const healthAreas = [
  ['badajoz', 'Badajoz'],
  ['merida', 'Mérida'],
  ['don-benito-villanueva', 'Don Benito–Villanueva'],
  ['llerena-zafra', 'Llerena–Zafra'],
  ['caceres', 'Cáceres'],
  ['coria', 'Coria'],
  ['navalmoral-de-la-mata', 'Navalmoral de la Mata'],
  ['plasencia', 'Plasencia'],
] as const;

const countWords = (value: string) =>
  value.trim() ? value.trim().split(/\s+/).length : 0;

const limitWords = (value: string, maximum: number) =>
  value.trim() ? value.trim().split(/\s+/).slice(0, maximum).join(' ') : '';

export function IIIJornadaSubmissionV2Page() {
  const [type, setType] = useState<'scientific' | 'experience'>('scientific');
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<Record<string, string>>({});
  const [mainAuthorName, setMainAuthorName] = useState('');
  const [mainAuthorEmail, setMainAuthorEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [centerType, setCenterType] = useState<
    'public' | 'private' | 'charter' | 'university' | 'other'
  >('public');
  const [province, setProvince] = useState('');
  const [healthArea, setHealthArea] = useState('');
  const [serviceUnit, setServiceUnit] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [presenterCommitment, setPresenterCommitment] = useState(false);
  const [noIdentifyingData, setNoIdentifyingData] = useState(false);
  const [definitiveConfirmed, setDefinitiveConfirmed] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [coauthors, setCoauthors] = useState<string[]>([]);
  const [references, setReferences] = useState<string[]>(['']);
  const [eventState, setEventState] = useState<ConferenceEventAvailabilityV2 | null>(null);
  const [eventError, setEventError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionCode, setSubmissionCode] = useState('');

  const fields = type === 'scientific' ? scientificSections : experienceSections;
  const words = useMemo(
    () => Object.values(sections).reduce((total, value) => total + countWords(value), 0),
    [sections],
  );
  const submissionsOpen = eventState?.status === 'open';

  useEffect(() => {
    let cancelled = false;
    fetchConferenceEventAvailabilityV2()
      .then((event) => {
        if (!cancelled) setEventState(event);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setEventError(
            error instanceof ConferenceV2Error
              ? error.message
              : 'No se pudo consultar el estado de la convocatoria.',
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError('');
    if (!submissionsOpen) {
      setSubmitError('El periodo de envío todavía no está abierto.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitConferenceSubmissionV2({
        event_slug: conferenceV2EventSlug,
        submission_type: type,
        title,
        sections,
        authors: [
          {
            full_name: mainAuthorName,
            email: mainAuthorEmail,
            institution,
            service_unit: serviceUnit,
            province,
          },
          ...coauthors.map((fullName) => ({ full_name: fullName })),
        ],
        references: references.filter((reference) => reference.trim()),
        center_type: centerType,
        health_area: healthArea as Parameters<typeof submitConferenceSubmissionV2>[0]['health_area'],
        main_author_is_member: isMember,
        presenter_commitment: presenterCommitment,
        no_identifying_data_confirmed: noIdentifyingData,
        privacy_accepted: privacyAccepted,
        definitive_confirmed: definitiveConfirmed,
        website: '',
      });
      setSubmissionCode(result.submission_code);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: unknown) {
      setSubmitError(
        error instanceof ConferenceV2Error
          ? error.message
          : 'No se pudo registrar el resumen.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="science-app">
      <div className={`science-demo ${submissionsOpen ? 'connected' : ''}`}>
        VERSIÓN V2 CONECTADA A STAGING ·{' '}
        {eventState ? `EVENTO ${eventState.status.toUpperCase()}` : 'COMPROBANDO EVENTO'}
      </div>
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

        {eventError && <section className="science-error">{eventError}</section>}
        {eventState && !submissionsOpen && (
          <section className="science-notice">
            <strong>Formulario conectado y cerrado.</strong> La III Jornada permanece en borrador;
            los datos no pueden enviarse hasta que el comité abra formalmente la convocatoria.
          </section>
        )}

        {submissionCode ? (
          <section className="science-success">
            <CheckCircle2 size={46} />
            <div>
              <h2>Resumen registrado correctamente</h2>
              <p>
                Conserva este código de seguimiento: <strong>{submissionCode}</strong>. El envío es
                definitivo y el póster se solicitará posteriormente a los trabajos finalistas.
              </p>
            </div>
          </section>
        ) : (
          <form onSubmit={handleSubmit}>
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
              {fields.map(({ key, label }) => (
                <label key={key}>
                  {label}
                  <textarea
                    required
                    value={sections[key] || ''}
                    onChange={(event) => updateSection(key, event.target.value)}
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
                  <input
                    required
                    value={mainAuthorName}
                    onChange={(event) => setMainAuthorName(event.target.value)}
                  />
                </label>
                <label>
                  Correo electrónico
                  <input
                    type="email"
                    required
                    value={mainAuthorEmail}
                    onChange={(event) => setMainAuthorEmail(event.target.value)}
                  />
                </label>
              </div>
              <div className="science-three">
                <label>
                  Centro / institución
                  <input
                    required
                    value={institution}
                    onChange={(event) => setInstitution(event.target.value)}
                  />
                </label>
                <label>
                  Tipo de centro
                  <select
                    required
                    value={centerType}
                    onChange={(event) => setCenterType(event.target.value as typeof centerType)}
                  >
                    <option value="public">Público</option>
                    <option value="private">Privado</option>
                    <option value="charter">Concertado</option>
                    <option value="university">Universidad</option>
                    <option value="other">Otro</option>
                  </select>
                </label>
                <label>
                  Provincia
                  <input
                    required
                    value={province}
                    onChange={(event) => setProvince(event.target.value)}
                  />
                </label>
              </div>
              <div className="science-two">
                <label>
                  Área de salud
                  <select
                    required
                    value={healthArea}
                    onChange={(event) => setHealthArea(event.target.value)}
                  >
                    <option value="">Seleccionar…</option>
                    {healthAreas.map(([value, label]) => (
                      <option value={value} key={value}>{label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Servicio / unidad
                  <input
                    required
                    value={serviceUnit}
                    onChange={(event) => setServiceUnit(event.target.value)}
                  />
                </label>
              </div>
              <div className="science-checks">
                <label>
                  <input
                    type="checkbox"
                    checked={isMember}
                    onChange={(event) => setIsMember(event.target.checked)}
                  /> Es socio/a de ACASPEX
                </label>
                <label>
                  <input
                    type="checkbox"
                    required
                    checked={presenterCommitment}
                    onChange={(event) => setPresenterCommitment(event.target.checked)}
                  /> Presentará el póster si resulta finalista
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
                  <input
                    type="checkbox"
                    required
                    checked={noIdentifyingData}
                    onChange={(event) => setNoIdentifyingData(event.target.checked)}
                  /> El resumen no contiene datos identificativos de pacientes.
                </label>
                <label>
                  <input
                    type="checkbox"
                    required
                    checked={definitiveConfirmed}
                    onChange={(event) => setDefinitiveConfirmed(event.target.checked)}
                  /> La información es correcta y el envío será definitivo.
                </label>
                <label>
                  <input
                    type="checkbox"
                    required
                    checked={privacyAccepted}
                    onChange={(event) => setPrivacyAccepted(event.target.checked)}
                  /> Acepto la política de privacidad.
                </label>
              </div>
              {submitError && <div className="science-error">{submitError}</div>}
              <button className="science-primary" disabled={!submissionsOpen || submitting}>
                <Send size={17} /> {submitting ? 'Enviando…' : 'Enviar resumen definitivo'}
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
