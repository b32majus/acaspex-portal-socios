import { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, UserPlus, ArrowLeft, FileText } from 'lucide-react';
import { mockSubmissions, statusLabels, modalityLabels, type MockSubmission } from './mockConferenceData';

type StatusFilter = 'all' | string;
type ModalityFilter = 'all' | string;

export function MockAdminComunicacionesPage() {
  const [selected, setSelected] = useState<MockSubmission | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modalityFilter, setModalityFilter] = useState<ModalityFilter>('all');
  const [search, setSearch] = useState('');

  const assetBase = import.meta.env.BASE_URL;

  const filtered = mockSubmissions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (modalityFilter !== 'all' && s.modality !== modalityFilter) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.submission_code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function statusColor(status: string) {
    switch (status) {
      case 'received': return 'bg-slate-100 text-slate-700';
      case 'under_review': return 'bg-blue-100 text-blue-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'needs_info': return 'bg-amber-100 text-amber-700';
      case 'poster_pending': return 'bg-purple-100 text-purple-700';
      case 'poster_received': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  if (selected) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-teal-900 text-white px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <img src={`${assetBase}assets/acaspex/logo-burbuja.jpg`} alt="ACASPEX" className="h-10 w-auto" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">ACASPEX</p>
              <p className="text-sm text-teal-100">Admin — Comunicaciones mock</p>
            </div>
          </div>
        </header>
        <div className="bg-amber-500 text-white text-center py-1.5 text-xs font-semibold tracking-wide">
          MOCK DEMO — sin datos reales, sin conexión a base de datos
        </div>
        <main className="max-w-4xl mx-auto p-6">
          <button
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-1.5 text-sm text-teal-700 hover:text-teal-900 mb-6"
          >
            <ArrowLeft size={16} /> Volver al listado
          </button>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 mb-2">
                  {selected.submission_code}
                </span>
                <h1 className="text-2xl font-bold text-slate-900">{selected.title}</h1>
              </div>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColor(selected.status)}`}>
                {statusLabels[selected.status]}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
              <div><span className="font-medium text-slate-700">Modalidad:</span> {modalityLabels[selected.modality]}</div>
              <div><span className="font-medium text-slate-700">Área:</span> {selected.topic_area}</div>
              <div><span className="font-medium text-slate-700">Autor principal:</span> {selected.main_author_name}</div>
              <div><span className="font-medium text-slate-700">Centro:</span> {selected.center}</div>
              <div><span className="font-medium text-slate-700">Fecha:</span> {new Date(selected.created_at).toLocaleDateString('es-ES')}</div>
              <div><span className="font-medium text-slate-700">Provincia:</span> {selected.province}</div>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Autores</h3>
              <p className="text-sm text-slate-600">{selected.authors_text}</p>
            </div>
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Resumen</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{selected.abstract_text}</p>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Acciones</h3>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                  <Clock size={14} /> Marcar en revisión
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors">
                  <CheckCircle size={14} /> Aceptar
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors">
                  <XCircle size={14} /> Rechazar
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors">
                  <UserPlus size={14} /> Asignar evaluador
                </button>
              </div>
            </div>
          </div>
        </main>
        <footer className="border-t border-slate-200 bg-white px-6 py-4 mt-8">
          <div className="max-w-6xl mx-auto text-center text-xs text-slate-400">
            MOCK DEMO — Acciones simuladas, sin persistencia
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-teal-900 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <img src={`${assetBase}assets/acaspex/logo-burbuja.jpg`} alt="ACASPEX" className="h-10 w-auto" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">ACASPEX</p>
            <p className="text-sm text-teal-100">Admin — Comunicaciones mock</p>
          </div>
        </div>
      </header>
      <div className="bg-amber-500 text-white text-center py-1.5 text-xs font-semibold tracking-wide">
        MOCK DEMO — sin datos reales, sin conexión a base de datos
      </div>

      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Comunicaciones recibidas</h1>
          <p className="text-sm text-slate-500">III Jornada ACASPEX — MOCK DEMO</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">Todos los estados</option>
              {Object.entries(statusLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">Todas las modalidades</option>
              {Object.entries(modalityLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Código</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Título</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Modalidad</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Área</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Autor</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Fecha</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-teal-700">{s.submission_code}</td>
                  <td className="px-4 py-3 text-slate-800 max-w-xs truncate">{s.title}</td>
                  <td className="px-4 py-3 text-slate-600">{modalityLabels[s.modality]}</td>
                  <td className="px-4 py-3 text-slate-600">{s.topic_area}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(s.status)}`}>
                      {statusLabels[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.main_author_name}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(s.created_at).toLocaleDateString('es-ES')}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(s)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-50 transition-colors"
                    >
                      <Eye size={14} /> Ver
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No se encontraron comunicaciones con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-slate-500">
          {filtered.length} de {mockSubmissions.length} comunicaciones
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-4 mt-8">
        <div className="max-w-6xl mx-auto text-center text-xs text-slate-400">
          MOCK DEMO — Datos simulados, sin conexión a base de datos
        </div>
      </footer>
    </div>
  );
}
