import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/authContext';
import type { ResourceStatus, ResourceType } from '../../data/mockResources';

const sectionLabel: Record<string, string> = {
  corporate_material: 'Material Corporativo',
  knowledge_center: 'Centro de Conocimiento',
  project_bank: 'Banco de Proyectos',
};

const subsectionsBySection: Record<string, { value: string; label: string }[]> = {
  knowledge_center: [
    { value: 'calidad-asistencial', label: 'Calidad Asistencial' },
    { value: 'seguridad-del-paciente', label: 'Seguridad del Paciente' },
    { value: 'investigacion', label: 'Investigación' },
    { value: 'formacion', label: 'Formación' },
    { value: 'herramientas', label: 'Herramientas' },
  ],
  project_bank: [
    { value: 'seguridad-del-paciente-proyectos', label: 'Seguridad del paciente' },
    { value: 'mejora-de-procesos', label: 'Mejora de procesos' },
    { value: 'experiencia-del-paciente', label: 'Experiencia del paciente' },
    { value: 'continuidad-asistencial', label: 'Continuidad asistencial' },
    { value: 'humanizacion', label: 'Humanización' },
    { value: 'gestion-clinica', label: 'Gestión Clínica' },
  ],
  corporate_material: [],
};

const sectionVisibility: Record<string, string[]> = {
  corporate_material: ['administrador', 'junta_directiva'],
  knowledge_center: ['administrador', 'junta_directiva', 'socio'],
  project_bank: ['administrador', 'junta_directiva', 'socio'],
};

export function AdminResourceNewPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [title, setTitle] = useState('');
  const [section, setSection] = useState<'corporate_material' | 'knowledge_center' | 'project_bank'>('corporate_material');
  const [subsection, setSubsection] = useState('');
  const [type, setType] = useState('document');
  const [status, setStatus] = useState<ResourceStatus>('published');
  const [description, setDescription] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const configured = isSupabaseConfigured();
  const subsections = subsectionsBySection[section] || [];

  async function getCategoryId(slug: string): Promise<string | null> {
    if (!slug || !configured || !supabase) return null;
    const { data } = await supabase
      .from('resource_categories')
      .select('id')
      .eq('slug', slug)
      .eq('section', section)
      .maybeSingle();
    return (data as { id?: string } | null)?.id ?? null;
  }

  async function handleSave() {
    if (!configured) {
      setFeedback({ type: 'error', message: 'El sistema de almacenamiento no está configurado.' });
      return;
    }
    if (!file) {
      setFeedback({ type: 'error', message: 'Selecciona un archivo para subir.' });
      return;
    }
    if (!title.trim()) {
      setFeedback({ type: 'error', message: 'El título es obligatorio.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
      const sectionPath = section === 'corporate_material' ? 'corporativo' : section;
      const storagePath = `${sectionPath}/2026/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase!
        .storage
        .from('acaspex-resource-files')
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw new Error(uploadError.message);

      const { data: resource, error: resourceError } = await supabase!
        .from('resources')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          resource_type: type as ResourceType,
          status,
          file_path: storagePath,
          external_url: externalUrl.trim() || null,
          created_by: session?.user?.id ?? null,
          published_at: status === 'published' ? new Date().toISOString() : null,
          section,
          category_id: subsection ? await getCategoryId(subsection) : null,
        })
        .select('id')
        .single();

      if (resourceError) {
        await supabase!.storage.from('acaspex-resource-files').remove([storagePath]);
        throw new Error(resourceError.message);
      }

      const resourceId = (resource as { id: string }).id;
      const visibilityRecords = sectionVisibility[section].map((role) => ({
        resource_id: resourceId,
        role,
      }));
      const { error: visibilityError } = await supabase!
        .from('resource_visibility')
        .insert(visibilityRecords);

      if (visibilityError) {
        console.warn('Visibility insert warning:', visibilityError.message);
      }

      setFeedback({ type: 'success', message: 'Recurso creado correctamente.' });
      setFile(null);
      setTitle('');
      setDescription('');
      setExternalUrl('');
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'No se ha podido crear el recurso. ' + (err instanceof Error ? err.message : 'Inténtalo de nuevo.'),
      });
    } finally {
      setSaving(false);
    }
  }

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
        <div>
          <h1 className="font-serif text-3xl font-light text-slate-900">Nuevo recurso</h1>
          <p className="mt-1 text-sm text-slate-500">Sube un archivo y publícalo en la sección correspondiente.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl text-slate-900">Formulario</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="new-title" className="block text-xs font-medium text-slate-500">
              Título *
            </label>
            <input
              id="new-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div>
            <label htmlFor="new-section" className="block text-xs font-medium text-slate-500">
              Sección
            </label>
            <select
              id="new-section"
              value={section}
              onChange={(e) => { setSection(e.target.value as typeof section); setSubsection(''); }}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="corporate_material">Material Corporativo</option>
              <option value="knowledge_center">Centro de Conocimiento</option>
              <option value="project_bank">Banco de Proyectos</option>
            </select>
          </div>
          {subsections.length > 0 && (
            <div>
              <label htmlFor="new-subsection" className="block text-xs font-medium text-slate-500">
                Subsección
              </label>
              <select
                id="new-subsection"
                value={subsection}
                onChange={(e) => setSubsection(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                {subsections.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}
          {section === 'corporate_material' && (
            <div>
              <label className="block text-xs font-medium text-slate-500">
                Subsección
              </label>
              <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
                Sin subsección — Material Corporativo
              </div>
            </div>
          )}
          <div>
            <label htmlFor="new-type" className="block text-xs font-medium text-slate-500">
              Tipo de material
            </label>
            <select
              id="new-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
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
            <label htmlFor="new-status" className="block text-xs font-medium text-slate-500">
              Estado
            </label>
            <select
              id="new-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ResourceStatus)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="published">Publicado</option>
              <option value="draft">Borrador</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
          <div>
            <label htmlFor="new-visibility" className="block text-xs font-medium text-slate-500">
              Visibilidad
            </label>
            <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
              {(sectionVisibility[section] || []).map((r) => r === 'administrador' ? 'Administración' : r === 'junta_directiva' ? 'Junta Directiva' : r === 'socio' ? 'Socios' : r).join(' + ')}
            </div>
            <p className="mt-1 text-xs text-slate-400">Según la sección seleccionada.</p>
          </div>
          <div>
            <label htmlFor="new-external-url" className="block text-xs font-medium text-slate-500">
              Enlace externo (opcional)
            </label>
            <input
              id="new-external-url"
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://…"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="new-description" className="block text-xs font-medium text-slate-500">
              Descripción
            </label>
            <textarea
              id="new-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="new-file" className="block text-xs font-medium text-slate-500">
              Archivo *
            </label>
            <input
              id="new-file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              accept=".png,.jpg,.jpeg,.pdf,.docx,.pptx"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-teal-700"
            />
            {file && (
              <p className="mt-1 text-xs text-slate-500">
                {file.name} ({(file.size / 1024).toFixed(0)} KB)
              </p>
            )}
            <p className="mt-1 text-xs text-slate-400">PNG, JPG, PDF, DOCX, PPTX. Máx. 50 MB.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Upload size={15} />
            {saving ? 'Guardando...' : 'Guardar recurso'}
          </button>
          <Link
            to="/admin/recursos"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Volver a recursos
          </Link>
        </div>

        {feedback && (
          <div className={`mt-5 rounded-lg border p-4 ${
            feedback.type === 'success' ? 'border-emerald-100 bg-emerald-50/60' :
            feedback.type === 'error' ? 'border-red-100 bg-red-50/60' :
            'border-amber-100 bg-amber-50/60'
          }`}>
            <p className={`text-sm ${
              feedback.type === 'success' ? 'text-emerald-800' :
              feedback.type === 'error' ? 'text-red-800' :
              'text-amber-800'
            }`}>{feedback.message}</p>
            {feedback.type === 'success' && (
              <Link
                to={section === 'corporate_material' ? '/socios/material-corporativo' : '/socios/recursos'}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800"
              >
                Ver en {sectionLabel[section]}
                <ChevronRight size={14} />
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
