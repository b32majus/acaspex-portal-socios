import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, Edit, ImageIcon, Info, Trash2, Upload, X } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { fetchEditableResourceCategories, resourceSectionLabel, type ResourceCategoryOption, type ResourceSection } from '../../lib/resourceCategories';
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
  const [section, setSection] = useState<ResourceSection>('corporate_material');
  const [categoryId, setCategoryId] = useState<string>('');
  const [subsections, setSubsections] = useState<ResourceCategoryOption[]>([]);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceWarning, setReplaceWarning] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [coverPath, setCoverPath] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      let found: (typeof mockResources)[number] | null = null;

      if (configured && supabase && resourceId) {
        const { data, error } = await supabase
          .from('resources')
          .select('id, title, subtitle, description, resource_type, status, file_path, cover_image_path, external_url, published_at, archived_at, created_at, section, category_id')
          .eq('id', resourceId)
          .maybeSingle();

        if (!error && data && !cancelled) {
          const r = data as Record<string, unknown>;
          found = {
            id: r.id as string,
            title: r.title as string,
            subtitle: (r.subtitle as string) || '',
            description: (r.description as string) || '',
            category: ((r.category_id as string | null) || (r.section === 'corporate_material' ? 'corporativo' : 'proyectos')) as ResourceCategory,
            type: (r.resource_type as ResourceType) || 'document',
            status: (r.status as ResourceStatus) || 'draft',
            publishedAt: (r.published_at as string) || null,
            filePath: (r.file_path as string) || '',
            coverImagePath: (r.cover_image_path as string) || '',
            externalUrl: (r.external_url as string) || '',
            estimatedReadMinutes: null,
            coverStyle: 'corporativo' as ResourceCoverStyle,
            visualTone: 'corporativo' as 'corporativo',
            featured: false,
            fileLabel: null,
            section: (r.section as ResourceSection) || 'corporate_material',
            categoryId: (r.category_id as string | null) || '',
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
          const rawFound = found as typeof found & { section?: ResourceSection; categoryId?: string | null };
          setSection(rawFound.section ?? 'corporate_material');
          setCategoryId(rawFound.categoryId ?? '');
          setCoverPath((rawFound as Record<string, unknown>).coverImagePath as string || '');
        }
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [configured, resourceId]);

  useEffect(() => {
    if (!configured) {
      setSubsections([]);
      return;
    }

    fetchEditableResourceCategories(section, categoryId || null).then(setSubsections);
  }, [configured, section, categoryId]);

  useEffect(() => {
    if (!configured || !supabase || !coverPath || removeCover) {
      setExistingCoverUrl(null);
      return;
    }
    supabase.storage
      .from('acaspex-resource-files')
      .createSignedUrl(coverPath, 300)
      .then(({ data }) => {
        if (data?.signedUrl) setExistingCoverUrl(data.signedUrl);
      })
      .catch(() => {});
  }, [configured, coverPath, removeCover]);

  async function handleSave() {
    if (!configured || !supabase || !resource) return;
    const isReal = resource.id.length === 36 && resource.id.includes('-');
    if (!isReal) {
      setFeedback({ type: 'info', message: 'Los recursos demo no se pueden guardar en Supabase.' });
      return;
    }

    setSaving(true);
    setFeedback(null);
    setReplaceWarning(null);

    let newFilePath: string | null = null;
    let newCoverPath: string | null = null;
    const oldFilePath = resource.filePath;
    const oldCoverPath = coverPath;

    try {
      if (replaceFile) {
        const safeName = replaceFile.name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
        const sectionPath = section === 'corporate_material' ? 'corporativo' : section;
        const storagePath = `${sectionPath}/2026/${crypto.randomUUID()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from('acaspex-resource-files')
          .upload(storagePath, replaceFile, {
            contentType: replaceFile.type,
            upsert: false,
          });

        if (uploadError) throw new Error('Error al subir archivo: ' + uploadError.message);
        newFilePath = storagePath;
      }

      if (coverFile && !removeCover) {
        const coverSafeName = coverFile.name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
        const sectionPath = section === 'corporate_material' ? 'corporativo' : section;
        newCoverPath = `${sectionPath}/2026/${crypto.randomUUID()}-cover-${coverSafeName}`;

        const { error: coverError } = await supabase.storage
          .from('acaspex-resource-files')
          .upload(newCoverPath, coverFile, {
            contentType: coverFile.type,
            upsert: false,
          });

        if (coverError) {
          if (newFilePath) {
            await supabase.storage.from('acaspex-resource-files').remove([newFilePath]);
          }
          throw new Error('Error al subir portada: ' + coverError.message);
        }
      }

      const update: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        resource_type: type,
        status,
        external_url: externalUrl.trim() || null,
        category_id: categoryId || null,
      };

      if (newFilePath) {
        update.file_path = newFilePath;
      }

      if (newCoverPath) {
        update.cover_image_path = newCoverPath;
      } else if (removeCover) {
        update.cover_image_path = null;
      }

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
        const toRemove: string[] = [];
        if (newFilePath) toRemove.push(newFilePath);
        if (newCoverPath) toRemove.push(newCoverPath);
        if (toRemove.length > 0) {
          await supabase.storage.from('acaspex-resource-files').remove(toRemove);
        }
        throw new Error('Error al actualizar: ' + error.message);
      }

      if (newFilePath && oldFilePath) {
        const { error: deleteError } = await supabase.storage
          .from('acaspex-resource-files')
          .remove([oldFilePath]);
        if (deleteError) {
          setReplaceWarning('El archivo anterior no se pudo eliminar: ' + deleteError.message);
        }
      }

      if ((newCoverPath || removeCover) && oldCoverPath) {
        const { error: coverDelError } = await supabase.storage
          .from('acaspex-resource-files')
          .remove([oldCoverPath]);
        if (coverDelError) {
          setReplaceWarning((prev) => (prev ? prev + ' ' : '') + 'La portada anterior no se pudo eliminar: ' + coverDelError.message);
        }
      }

      setResource({
        ...resource,
        title: title.trim(),
        description: description.trim() || '',
        type,
        status,
        externalUrl: externalUrl.trim() || '',
        filePath: newFilePath || resource.filePath,
        category: (categoryId || resource.category) as ResourceCategory,
      } as typeof resource);
      setReplaceFile(null);
      setCoverFile(null);
      setCoverPreview(null);
      setRemoveCover(false);
      setCoverPath(removeCover ? '' : (newCoverPath || oldCoverPath));
      setFeedback({ type: 'success', message: 'Recurso actualizado correctamente.' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al guardar el recurso.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!configured || !supabase || !resource) return;

    setDeleting(true);
    setFeedback(null);
    setReplaceWarning(null);

    const oldFilePath = resource.filePath;
    const oldCoverPath = coverPath;

    try {
      const { error: visibilityError } = await supabase
        .from('resource_visibility')
        .delete()
        .eq('resource_id', resource.id);

      if (visibilityError) throw new Error('Error al eliminar visibilidad: ' + visibilityError.message);

      const { error: resourceError } = await supabase
        .from('resources')
        .delete()
        .eq('id', resource.id);

      if (resourceError) throw new Error('Error al eliminar recurso: ' + resourceError.message);

      const toRemove: string[] = [];
      if (oldFilePath) toRemove.push(oldFilePath);
      if (oldCoverPath) toRemove.push(oldCoverPath);
      if (toRemove.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('acaspex-resource-files')
          .remove(toRemove);
        if (storageError) {
          console.warn('Storage cleanup warning:', storageError.message);
        }
      }

      navigate('/admin/recursos');
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al eliminar el recurso.',
      });
      setDeleting(false);
      setConfirmDelete(false);
    }
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
            <label className="block text-xs font-medium text-slate-500">
              Sección
            </label>
            <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
              {resourceSectionLabel[section]}
            </div>
          </div>
          {subsections.length > 0 ? (
            <div>
              <label htmlFor="resource-subsection" className="block text-xs font-medium text-slate-500">
                Subsección
              </label>
              <select
                id="resource-subsection"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value="">Sin subsección</option>
                {subsections.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}{category.is_active ? '' : ' (inactiva)'}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-400">Solo se ofrecen activas, manteniendo la actual si está inactiva.</p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-500">
                Subsección
              </label>
              <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
                Sección sin subsecciones
              </div>
            </div>
          )}
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
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500">
              Archivo
            </label>
            {resource.filePath ? (
              <div className="mt-1 space-y-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <code className="text-xs">{resource.filePath}</code>
                </div>
                <p className="text-xs text-slate-500">Puedes sustituir el archivo actual seleccionando uno nuevo.</p>
                <div>
                  <input
                    id="resource-replace-file"
                    type="file"
                    onChange={(e) => { setReplaceFile(e.target.files?.[0] ?? null); setReplaceWarning(null); }}
                    accept=".png,.jpg,.jpeg,.pdf,.docx,.pptx"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-teal-700"
                  />
                  {replaceFile && (
                    <div className="mt-2 flex items-center gap-2">
                      <Upload size={14} className="text-teal-600" />
                      <span className="text-xs text-teal-700">
                        Nuevo: {replaceFile.name} ({(replaceFile.size / 1024).toFixed(0)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => setReplaceFile(null)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                  {replaceWarning && (
                    <p className="mt-1 text-xs text-amber-600">{replaceWarning}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
                Sin archivo asociado
              </div>
            )}
          </div>
          <div className="sm:col-span-2 border-t border-slate-100 pt-4">
            <label className="block text-xs font-medium text-slate-500">
              Imagen de portada (opcional)
            </label>
            {!removeCover && existingCoverUrl ? (
              <div className="mt-2 space-y-2">
                <img src={existingCoverUrl} alt="Portada actual" className="max-h-40 rounded-lg border border-slate-200 object-contain" />
                <div className="flex gap-2">
                  <span className="text-xs text-slate-400">Selecciona un archivo nuevo para sustituirla.</span>
                  <button
                    type="button"
                    onClick={() => { setCoverFile(null); setCoverPreview(null); setRemoveCover(true); }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Quitar portada
                  </button>
                </div>
              </div>
            ) : removeCover ? (
              <div className="mt-2">
                <span className="text-xs text-amber-600">Se eliminará la portada al guardar.</span>
                {' '}
                <button
                  type="button"
                  onClick={() => { setRemoveCover(false); setCoverFile(null); setCoverPreview(null); }}
                  className="text-xs text-teal-600 hover:text-teal-800"
                >
                  Cancelar
                </button>
              </div>
            ) : null}
            <div className="mt-2 flex flex-wrap items-start gap-4">
              <div className="flex-1 min-w-[200px]">
                <input
                  id="resource-cover-file"
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setCoverFile(f);
                    setRemoveCover(false);
                    if (f) {
                      const reader = new FileReader();
                      reader.onload = () => setCoverPreview(reader.result as string);
                      reader.readAsDataURL(f);
                    } else {
                      setCoverPreview(null);
                    }
                  }}
                  accept=".png,.jpg,.jpeg,.webp"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-teal-700"
                />
              </div>
              <div
                className="flex-1 min-w-[200px] rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-center"
                onPaste={(e) => {
                  const items = e.clipboardData?.items;
                  if (!items) return;
                  for (let i = 0; i < items.length; i++) {
                    if (items[i].type.startsWith('image/')) {
                      const blob = items[i].getAsFile();
                      if (blob) {
                        const reader = new FileReader();
                        reader.onload = () => setCoverPreview(reader.result as string);
                        reader.readAsDataURL(blob);
                        setCoverFile(new File([blob], 'captura.png', { type: 'image/png' }));
                        setRemoveCover(false);
                      }
                      break;
                    }
                  }
                }}
                tabIndex={0}
              >
                <p className="text-xs text-slate-500">
                  <ImageIcon size={14} className="inline mr-1 text-slate-400" />
                  Pega aquí una captura (Ctrl+V)
                </p>
              </div>
            </div>
            {coverPreview && (
              <div className="mt-3 relative inline-block">
                <img
                  src={coverPreview}
                  alt="Vista previa de portada"
                  className="max-h-48 rounded-lg border border-slate-200 object-contain"
                />
                <button
                  type="button"
                  onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                  className="absolute -top-2 -right-2 rounded-full bg-white border border-slate-200 p-0.5 text-slate-400 hover:text-slate-600 shadow-sm"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
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
          {isReal && status === 'archived' && (
            <div className="w-full border-t border-slate-100 pt-4 mt-2">
              {confirmDelete ? (
                <div className="rounded-lg border border-red-200 bg-red-50/60 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-800">¿Seguro que quieres eliminar definitivamente este recurso?</p>
                      <p className="mt-1 text-xs text-red-700/80">Esta acción borrará el archivo asociado, la portada si existe y no se podrá deshacer.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={15} />
                      {deleting ? 'Eliminando...' : 'Eliminar definitivamente'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleting}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={15} />
                  Eliminar recurso
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
