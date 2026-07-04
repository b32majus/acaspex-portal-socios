import { useState, useRef } from 'react';
import { FileText, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { topicAreas, modalityLabels } from './mockConferenceData';
import {
  submitConferenceCommunication,
  getErrorMessage,
  type SubmissionSuccess,
} from '../../../lib/conferenceSubmissionClient';

export function MockPublicSubmissionPage() {
  const [form, setForm] = useState({
    title: '',
    modality: 'poster',
    topic_area: '',
    abstract_text: '',
    authors_text: '',
    main_author_name: '',
    main_author_email: '',
    main_author_phone: '',
    center: '',
    service_unit: '',
    province: '',
    privacy_accepted: false,
    communication_consent: false,
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SubmissionSuccess | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const assetBase = import.meta.env.BASE_URL;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await submitConferenceCommunication({
        ...form,
        event_slug: 'iii-jornada-acaspex',
        file,
      });

      if (result.ok) {
        setSuccess(result);
      } else {
        setError(getErrorMessage(result.code));
      }
    } catch {
      setError(getErrorMessage('unexpected_error'));
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setError(null);

    if (!selected) {
      setFile(null);
      return;
    }

    // Validate extension
    const name = selected.name.toLowerCase();
    const ext = name.split('.').pop();
    if (ext !== 'pdf' && ext !== 'docx') {
      setError('Formato no válido. Use archivos .pdf o .docx.');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size (10 MB max)
    const maxSize = 10 * 1024 * 1024;
    if (selected.size > maxSize) {
      setError(`El archivo supera el límite de 10 MB (${(selected.size / 1024 / 1024).toFixed(1)} MB). Comprima o reduzca el documento.`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFile(selected);
  }

  // ── Success screen ────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-teal-900 text-white px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <img src={`${assetBase}assets/acaspex/logo-burbuja.jpg`} alt="ACASPEX" className="h-10 w-auto" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">ACASPEX</p>
              <p className="text-sm text-teal-100">Gestión científica de jornadas</p>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-lg text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Comunicación recibida</h1>
            <p className="text-slate-600 mb-6">
              Su comunicación ha sido registrada correctamente. El código asignado es:
            </p>
            <div className="inline-block rounded-xl bg-teal-50 border-2 border-teal-200 px-8 py-4 mb-6">
              <span className="text-3xl font-mono font-bold text-teal-700">{success.submission_code}</span>
            </div>
            <p className="text-sm text-slate-500 mb-2">
              <strong>{success.title}</strong>
            </p>
            <p className="text-sm text-slate-500">
              Guarde este código. Será necesario para consultas futuras sobre el estado de su comunicación.
            </p>
            <div className="mt-8 rounded-lg bg-amber-50 border border-amber-200 p-4 text-left">
              <p className="text-sm text-amber-800">
                <strong>Próximos pasos:</strong> El comité científico valorará su comunicación y recibirá notificación del resultado. Los datos de autoría serán tratados de forma confidencial y no serán visibles para los evaluadores durante la evaluación ciega.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Form screen ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-teal-900 text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <img src={`${assetBase}assets/acaspex/logo-burbuja.jpg`} alt="ACASPEX" className="h-10 w-auto" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">ACASPEX</p>
            <p className="text-sm text-teal-100">Gestión científica de jornadas</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          {/* Review environment banner */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 mb-6 flex items-center gap-2">
            <AlertCircle size={14} className="text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700">
              <strong>Entorno de revisión</strong> — Formulario conectado a backend en desarrollo. No enviar datos reales.
            </p>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <FileText size={16} />
              <span>III Jornada ACASPEX</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Envío de comunicaciones
            </h1>
            <p className="text-slate-600 leading-relaxed">
              Complete el siguiente formulario para enviar su comunicación al comité científico de la III Jornada ACASPEX.
              Todas las comunicaciones serán evaluadas de forma ciega por el comité.
            </p>
          </div>

          {/* Bases resumidas */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Bases resumidas</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-teal-600 mt-0.5">•</span>
                <span>El plazo de envío finaliza el <strong>15 de julio de 2026</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-600 mt-0.5">•</span>
                <span>Las comunicaciones deben ser originales y no haber sido publicadas previamente.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-600 mt-0.5">•</span>
                <span>Modalidades: comunicación oral, póster o comunicación libre.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-600 mt-0.5">•</span>
                <span>El resumen debe tener entre 200 y 300 palabras.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-600 mt-0.5">•</span>
                <span>La evaluación será ciega: oculte datos identificativos en el resumen.</span>
              </li>
            </ul>
          </div>

          {/* Privacidad */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Nota sobre privacidad:</strong> Los datos de autoría son necesarios para la gestión administrativa, pero no se mostrarán al comité evaluador durante la evaluación ciega. Solo el contenido científico (resumen, título, área temática) será visible para los evaluadores.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Error al enviar la comunicación</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos de la comunicación */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Datos de la comunicación</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título de la comunicación *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                    placeholder="Ej: Efectividad del programa X en niños con Y"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Modalidad *</label>
                    <select
                      value={form.modality}
                      onChange={(e) => setForm({ ...form, modality: e.target.value })}
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                    >
                      {Object.entries(modalityLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Área temática *</label>
                    <select
                      required
                      value={form.topic_area}
                      onChange={(e) => setForm({ ...form, topic_area: e.target.value })}
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                    >
                      <option value="">Seleccionar área</option>
                      {topicAreas.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Resumen / Abstract *</label>
                  <textarea
                    required
                    rows={6}
                    value={form.abstract_text}
                    onChange={(e) => setForm({ ...form, abstract_text: e.target.value })}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                    placeholder="Máximo 300 palabras. Incluya objetivos, metodología, resultados y conclusiones."
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Recuerde: esta es la sección que verán los evaluadores. No incluya datos identificativos.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Autores (lista completa) *</label>
                  <input
                    type="text"
                    required
                    value={form.authors_text}
                    onChange={(e) => setForm({ ...form, authors_text: e.target.value })}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                    placeholder="Nombre Apellido1, Nombre Apellido2, ..."
                  />
                </div>
              </div>
            </div>

            {/* Autor principal */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Autor principal</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo *</label>
                    <input
                      type="text"
                      required
                      value={form.main_author_name}
                      onChange={(e) => setForm({ ...form, main_author_name: e.target.value })}
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={form.main_author_email}
                      onChange={(e) => setForm({ ...form, main_author_email: e.target.value })}
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={form.main_author_phone}
                    onChange={(e) => setForm({ ...form, main_author_phone: e.target.value })}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Centro / Institución *</label>
                    <input
                      type="text"
                      required
                      value={form.center}
                      onChange={(e) => setForm({ ...form, center: e.target.value })}
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Servicio / Unidad *</label>
                    <input
                      type="text"
                      required
                      value={form.service_unit}
                      onChange={(e) => setForm({ ...form, service_unit: e.target.value })}
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Provincia *</label>
                  <input
                    type="text"
                    required
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Archivo y consentimientos */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Archivo y consentimientos</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adjuntar archivo (DOCX o PDF) *</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx"
                    required
                    onChange={handleFileChange}
                    disabled={loading}
                    className="text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-teal-700 hover:file:bg-teal-100 disabled:opacity-50"
                  />
                  {file && (
                    <p className="mt-1 text-xs text-slate-500">
                      Archivo seleccionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">Tamaño máximo: 10 MB. Formatos aceptados: .pdf, .docx</p>
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    id="privacy"
                    checked={form.privacy_accepted}
                    onChange={(e) => setForm({ ...form, privacy_accepted: e.target.checked })}
                    disabled={loading}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 disabled:opacity-50"
                  />
                  <label htmlFor="privacy" className="text-sm text-slate-600">
                    Acepto la <span className="text-teal-700 underline">política de privacidad</span> y autorizo el tratamiento de mis datos personales para la gestión científica de la III Jornada ACASPEX. *
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="communication_consent"
                    checked={form.communication_consent}
                    onChange={(e) => setForm({ ...form, communication_consent: e.target.checked })}
                    disabled={loading}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 disabled:opacity-50"
                  />
                  <label htmlFor="communication_consent" className="text-sm text-slate-600">
                    Deseo recibir comunicaciones sobre la III Jornada ACASPEX y futuras actividades de ACASPEX.
                  </label>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 transition-colors disabled:bg-teal-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Enviar comunicación
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-4 mt-8">
        <div className="max-w-3xl mx-auto text-center text-xs text-slate-400">
          Asociación Extremeña de Calidad Asistencial y Seguridad de Pacientes — ACASPEX
        </div>
      </footer>
    </div>
  );
}
