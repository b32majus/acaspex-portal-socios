import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Settings, Upload } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import {
  categoryLabel,
  formatResourceDate,
  resourceStatusBadgeClass,
  resourceStatusLabel,
  typeLabel,
} from '../../lib/resourceHelpers';
import {
  mockResources,
  type ResourceCategory,
  type ResourceCoverStyle,
  type ResourceStatus,
  type ResourceType,
} from '../../data/mockResources';

export function AdminResourcesPage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState<(typeof mockResources)[number][]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const all: (typeof mockResources)[number][] = [];

      if (configured && supabase) {
        const { data, error } = await supabase
          .from('resources')
          .select('id, title, subtitle, description, resource_type, status, file_path, external_url, published_at, created_at, section, category_id')
          .order('created_at', { ascending: false });

        if (!error && data) {
          for (const r of data as Array<Record<string, unknown>>) {
            const fp = r.file_path as string | undefined;
            const sec = (r.section as string) || '';
            const derivedCategory = sec === 'corporate_material' ? 'corporativo'
              : sec === 'knowledge_center' ? 'calidad'
              : sec === 'project_bank' ? 'proyectos'
              : 'corporativo';
            const ct = fp?.match(/\.(png|jpg|jpeg|gif|webp)$/i)
              ? 'image/'
              : fp?.match(/\.(pdf)$/i)
              ? 'application/pdf'
              : '';
            all.push({
              id: r.id as string,
              title: r.title as string,
              subtitle: (r.subtitle as string) || (r.title as string),
              description: (r.description as string) || '',
              category: derivedCategory as ResourceCategory,
              type: (r.resource_type as ResourceType) || 'document',
              status: (r.status as ResourceStatus) || 'draft',
              publishedAt: (r.published_at as string) || null,
              filePath: fp || '',
              externalUrl: (r.external_url as string) || '',
              estimatedReadMinutes: null,
              coverStyle: 'corporativo' as ResourceCoverStyle,
              visualTone: 'corporativo' as 'corporativo',
              featured: false,
              fileLabel: ct || (fp ? 'Archivo' : null),
            } as (typeof mockResources)[number]);
          }
        }
      }

      for (const m of mockResources) {
        if (!all.find((r) => r.id === m.id)) all.push(m);
      }

      if (!cancelled) {
        setResources(all);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [configured]);

  const publishedCount = resources.filter((r) => r.status === 'published').length;
  const draftCount = resources.filter((r) => r.status === 'draft').length;
  const archivedCount = resources.filter((r) => r.status === 'archived').length;

  async function handleStatusChange(resourceId: string, newStatus: ResourceStatus) {
    if (!configured || !supabase) return;
    const isSupabaseResource = resourceId.length === 36 && resourceId.includes('-');
    if (!isSupabaseResource) return;

    setActionFeedback(null);
    const update: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'published') update.published_at = new Date().toISOString();
    if (newStatus === 'archived') update.archived_at = new Date().toISOString();

    const { error } = await supabase
      .from('resources')
      .update(update)
      .eq('id', resourceId);

    if (error) {
      setActionFeedback({ type: 'error', message: 'Error al cambiar estado: ' + error.message });
      return;
    }

    setResources((prev) =>
      prev.map((r) =>
        r.id === resourceId ? { ...r, status: newStatus, publishedAt: newStatus === 'published' ? new Date().toISOString() : r.publishedAt } : r
      )
    );
    setActionFeedback({ type: 'success', message: `Recurso ${newStatus === 'published' ? 'publicado' : newStatus === 'archived' ? 'archivado' : 'pasado a borrador'}.` });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-20 rounded-lg bg-slate-100" />
            <div className="h-20 rounded-lg bg-slate-100" />
            <div className="h-20 rounded-lg bg-slate-100" />
          </div>
          <div className="h-64 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {actionFeedback && (
        <div className={`rounded-lg border p-3 text-sm ${
          actionFeedback.type === 'success' ? 'border-emerald-100 bg-emerald-50/60 text-emerald-800' : 'border-red-100 bg-red-50/60 text-red-800'
        }`}>
          {actionFeedback.message}
        </div>
      )}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light text-slate-900">Recursos</h1>
          <p className="mt-1 text-sm text-slate-500">Gestión de recursos del portal.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/recursos/subsecciones"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Settings size={15} />
            Gestionar subsecciones
          </Link>
          <button
            type="button"
            onClick={() => navigate('/admin/recursos/nuevo')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800"
          >
            <Upload size={15} />
            Nuevo recurso
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Publicados</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{publishedCount}</p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Borradores</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{draftCount}</p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Archivados</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{archivedCount}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        {resources.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No hay recursos todavía.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 font-medium">Título</th>
                  <th className="pb-3 font-medium">Sección</th>
                  <th className="pb-3 font-medium">Tipo</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Visibilidad</th>
                  <th className="pb-3 font-medium">Fecha</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resources.map((resource) => {
                  const statusBadge = resourceStatusBadgeClass[resource.status] ?? 'bg-slate-100 text-slate-600';
                  const isReal = resource.id.length === 36 && resource.id.includes('-');
                  const visibilityLabel = resource.category === 'corporativo' ? 'Junta Directiva' : 'Socios';
                  return (
                    <tr key={resource.id} className="hover:bg-slate-50/60">
                      <td className="py-3 font-medium text-slate-900">
                        {resource.title}
                        {isReal && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" title="Recurso real" />}
                      </td>
                      <td className="py-3 text-slate-600">{categoryLabel[resource.category] ?? resource.category}</td>
                      <td className="py-3 text-slate-600">{typeLabel[resource.type] ?? resource.type}</td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge}`}>
                          {resourceStatusLabel[resource.status] ?? resource.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">{visibilityLabel}</td>
                      <td className="py-3 text-slate-600 text-xs">
                        {formatResourceDate(resource.publishedAt ?? null)}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/recursos/${resource.id}`}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-50"
                          >
                            Editar
                            <ChevronRight size={13} />
                          </Link>
                          {isReal && resource.status === 'published' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(resource.id, 'archived')}
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50"
                              title="Archivar"
                            >
                              Archivar
                            </button>
                          )}
                          {isReal && resource.status === 'archived' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(resource.id, 'published')}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
                                title="Publicar de nuevo"
                              >
                                Publicar de nuevo
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(resource.id, 'draft')}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100"
                                title="Restaurar como borrador"
                              >
                                Restaurar borrador
                              </button>
                            </>
                          )}
                          {isReal && resource.status === 'draft' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(resource.id, 'published')}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
                                title="Publicar"
                              >
                                Publicar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(resource.id, 'archived')}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50"
                                title="Archivar"
                              >
                                Archivar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
