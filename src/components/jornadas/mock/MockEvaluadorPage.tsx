import { useState } from 'react';
import { AlertTriangle, Send, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { mockSubmissions, modalityLabels, type MockSubmission } from './mockConferenceData';

interface Evaluation {
  score_relevance: number;
  score_methodology: number;
  score_impact: number;
  score_clarity: number;
  comments: string;
  recommendation: 'accept' | 'reject' | 'needs_discussion' | '';
}

const emptyEval: Evaluation = {
  score_relevance: 0,
  score_methodology: 0,
  score_impact: 0,
  score_clarity: 0,
  comments: '',
  recommendation: '',
};

export function MockEvaluadorPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const assetBase = import.meta.env.BASE_URL;
  const submission = mockSubmissions[currentIndex];
  const evalData = evaluations[submission.id] || emptyEval;
  const isSubmitted = submitted[submission.id] || false;

  function updateEval(field: keyof Evaluation, value: number | string) {
    setEvaluations((prev) => ({
      ...prev,
      [submission.id]: { ...(prev[submission.id] || emptyEval), [field]: value },
    }));
  }

  function handleSubmit() {
    setSubmitted((prev) => ({ ...prev, [submission.id]: true }));
  }

  function scoreButton(value: number, current: number, onChange: (v: number) => void, disabled: boolean) {
    const active = current === value;
    return (
      <button
        key={value}
        type="button"
        disabled={disabled}
        onClick={() => onChange(value)}
        className={`h-9 w-9 rounded-lg text-sm font-semibold transition-colors ${
          active
            ? 'bg-teal-700 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {value}
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-teal-900 text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <img src={`${assetBase}assets/acaspex/logo-burbuja.jpg`} alt="ACASPEX" className="h-10 w-auto" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">ACASPEX</p>
            <p className="text-sm text-teal-100">Evaluación ciega — Mock</p>
          </div>
        </div>
      </header>
      <div className="bg-amber-500 text-white text-center py-1.5 text-xs font-semibold tracking-wide">
        MOCK DEMO — sin datos reales, sin conexión a base de datos
      </div>

      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Evaluación de comunicación</h1>
            <p className="text-sm text-slate-500">
              Comunicación {currentIndex + 1} de {mockSubmissions.length}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <button
              onClick={() => setCurrentIndex(Math.min(mockSubmissions.length - 1, currentIndex + 1))}
              disabled={currentIndex === mockSubmissions.length - 1}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 mb-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Aviso de evaluación ciega</p>
            <p className="text-sm text-amber-700 mt-1">
              El archivo adjunto puede contener datos identificativos del autor.
              Descárguelo solo si es imprescindible para la evaluación.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-slate-100 border border-slate-200 p-3 mb-6">
          <p className="text-xs text-slate-600">
            <strong>Vista ciega:</strong> se ocultan autoría, centro, servicio, email y provincia. Solo se muestra el contenido científico.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
                  {submission.submission_code}
                </span>
                <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {modalityLabels[submission.modality]}
                </span>
                <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {submission.topic_area}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">{submission.title}</h2>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Resumen</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {submission.abstract_text}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <button className="inline-flex items-center gap-1.5 text-sm text-teal-700 hover:text-teal-900 font-medium">
                  <FileText size={14} /> Descargar archivo adjunto
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Evaluación</h3>
              <div className="space-y-4">
                {[
                  { key: 'score_relevance' as const, label: 'Relevancia' },
                  { key: 'score_methodology' as const, label: 'Metodología' },
                  { key: 'score_impact' as const, label: 'Impacto' },
                  { key: 'score_clarity' as const, label: 'Claridad' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((v) => scoreButton(v, evalData[key], (val) => updateEval(key, val), isSubmitted))}
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Recomendación *</label>
                  <select
                    value={evalData.recommendation}
                    onChange={(e) => updateEval('recommendation', e.target.value)}
                    disabled={isSubmitted}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="accept">Aceptar</option>
                    <option value="reject">Rechazar</option>
                    <option value="needs_discussion">Discutir en comité</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Comentarios</label>
                  <textarea
                    rows={4}
                    value={evalData.comments}
                    onChange={(e) => updateEval('comments', e.target.value)}
                    disabled={isSubmitted}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
                    placeholder="Observaciones sobre la calidad científica..."
                  />
                </div>
                {isSubmitted ? (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                    <p className="text-sm font-semibold text-green-700">Evaluación enviada</p>
                  </div>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 transition-colors"
                  >
                    <Send size={16} /> Enviar evaluación
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-4 mt-8">
        <div className="max-w-4xl mx-auto text-center text-xs text-slate-400">
          MOCK DEMO — Evaluación simulada, sin persistencia. Datos ciegos: autor, email, centro, servicio y provincia ocultos.
        </div>
      </footer>
    </div>
  );
}
