import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Edit, Info } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import {
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

export function AdminResourceEditorPage() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<(typeof mockResources)[number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ResourceType>('document');
  const [status, setStatus] = useState<ResourceStatus>('draft');
  const [description, setDescription] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      let found: (typeof mockResources)[number] | null = null;

      if (configured && supabase && resourceId) {
        const { data, error } = await supabase
          .from('resources')
          .select('id, title, subtitle, description, resource_type, status, file_path, external_url, published_at, archived_at, created_at')
          .eq('id', resourceId)
          .maybeSingle();

        if (!error && data && !cancelled) {
          const r = data as Record<string, unknown>;
          found = {
            id: r.id as string,
            title: r.title as string,
            subtitle: (r.subtitle as string) || '',
            description: (r.description as string) || '',
            category: 'corporativo' as ResourceCategory,
            type: (r.resource_type as ResourceType) || 'document',
            status: (r.status as ResourceStatus) || 'draft',
            publishedAt: (r.published_at as string) || null,
            filePath: (r.file_path as string) || '',
            externalUrl: (r.external_url as string) || '',
            estimatedReadMinutes: null,
            coverStyle: 'corporativo' as ResourceCoverStyle,
            visualTone: 'corporativo' as 'corporativo',
            featured: false,
            fileLabel: null,
          } as (typeof mockResources)[number];
        }
      }

      if (!found) {
        found = mockResources.find((r) => r.id === resourceId) || null;
      }

      if (!cancelled) {
        setResource(found);
        if (found) {
          setTitle(found.title);
          setType(found.type as ResourceType);
          setStatus(found.status);
          setDescription(found.description || '');
          setExternalUrl(found.externalUrl || '');
        }
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [configured, resourceId]);

  async function handleSave() {
    if (!configured || !supabase || !resource) return;
    const isReal = resource.id.length === 36 && resource.id.includes('-');
    if (!isReal) {
      setFeedback({ type: 'info', message: 'Los recursos demo no se pueden guardar en Supabase.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const update: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim() || null,
      resource_type: type,
      status,
      external_url: externalUrl.trim() || null,
    };

    if (status === 'published' && resource.status !== 'published') {
      update.published_at = new Date().toISOString();
    }
    if (status === 'archived' && resource.status !== 'archived') {
      update.archived_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('resources')
      .update(update)
      .eq('id', resource.id);

    if (error) {
      setFeedback({ type: 'error', message: 'Error al guardar: ' + error.message });
      setSaving(false);
      return;
    }

    setResource({ ...resource, title: title.trim(), description: description.trim() || '', type, status, externalUrl: externalUrl.trim() || '' });
    setFeedback({ type: 'success', message: 'Recurso actualizado correctamente.' });
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-slate-200" />
          <div className="h-32 rounded-2xl bg-slate-100" />
          <div className="h-64 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-4">
          <h1 className="font-serif text-2xl font-light text-slate-900">Recurso no encontrado</h1>
          <p className="text-sm text-slate-600">
            No existe ningún recurso con el identificador indicado.
          </p>
          <Link
            to="/admin/recursos"
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800"
          >
            <ChevronLeft size={14} />
            Volver a recursos
          </Link>
        </div>
      </section>
    );
  }

  const isReal = resource.id.length === 36 && resource.id.includes('-');
  const statusBadge = resourceStatusBadgeClass[status] ?? 'bg-slate-100 text-slate-600';

  return (
    <div className="space-y-8">
      <Link
        to="/admin/recursos"
        className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
      >
        <ChevronLeft size={14} />
        Volver a recursos
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-teal-700">Recurso{isReal ? ' real' : ' demo'}</p>
            <h1 className="mt-2 font-serif text-3xl font-light text-slate-900">{resource.title}</h1>
            {resource.subtitle && <p className="mt-1 text-sm text-slate-500">{resource.subtitle}</p>}
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusBadge}`}>
            {resourceStatusLabel[status] ?? status}
          </span>
        </div>
      </section>

      {feedback && (
        <div className={`rounded-lg border p-4 text-sm ${
          feedback.type === 'success' ? 'border-emerald-100 bg-emerald-50/60 text-emerald-800' :
          feedback.type === 'error' ? 'border-red-100 bg-red-50/60 text-red-800' :
          'border-amber-100 bg-amber-50/60 text-amber-800'
        }`}>
          {feedback.message}
        </div>
      )}

      {!isReal && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Info size={18} className="mt-0.5 shrink-0 text-amber-700" />
            <p className="text-sm font-medium text-amber-800">Este es un recurso demo. La edición no se guarda en Supabase.</p>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl text-slate-900">Edición</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="resource-title" className="block text-xs font-medium text-slate-500">
              Título *
            </label>
            <input
              id="resource-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div>
            <label htmlFor="resource-type" className="block text-xs font-medium text-slate-500">
              Tipo de material
            </label>
            <select
              id="resource-type"
              value={type}
              onChange={(e) => setType(e.target.value as ResourceType)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="image">Imagen</option>
              <option value="logo">Logo</option>
              <option value="teams_background">Fondo Teams</option>
              <option value="pdf">PDF</option>
              <option value="document">Documento</option>
              <option value="presentation">Presentación</option>
              <option value="template">Plantilla</option>
              <option value="external_link">Enlace externo</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div>
            <label htmlFor="resource-status" className="block text-xs font-medium text-slate-500">
              Estado
            </label>
            <select
              id="resource-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ResourceStatus)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
          <div>
            <label htmlFor="resource-external-url" className="block text-xs font-medium text-slate-500">
              Enlace externo
            </label>
            <input
              id="resource-external-url"
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://…"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="resource-description" className="block text-xs font-medium text-slate-500">
              Descripción
            </label>
            <textarea
              id="resource-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          {resource.filePath && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500">
                Archivo
              </label>
              <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <code className="text-xs">{resource.filePath}</code>
              </div>
              <p className="mt-1 text-xs text-slate-400">Para sustituir el archivo, crea un nuevo recurso.</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Edit size={15} />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/recursos')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
      </section>
    </div>
  );
}
