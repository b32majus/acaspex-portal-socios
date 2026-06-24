import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  Download,
  FileText,
  Globe,
  Image,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import {
  categoryLabel,
  formatResourceDate,
  isExternalLinkResource,
  isImageResource,
  isOfficeResource,
  isPdfResource,
  typeIconMap,
  typeLabel,
} from '../../lib/resourceHelpers';
import {
  mockResources,
  type ResourceCategory,
  type ResourceCoverStyle,
  type ResourceStatus,
  type ResourceType,
} from '../../data/mockResources';
import { MockCover } from './MockCover';

export function MemberResourceDetailPage() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const [resource, setResource] = useState<(typeof mockResources)[number] | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      if (configured && supabase && resourceId) {
        const { data, error } = await supabase
          .from('resources')
          .select('id, title, subtitle, description, resource_type, status, file_path, cover_image_path, external_url, published_at, section, category_id')
          .eq('id', resourceId)
          .eq('status', 'published')
          .maybeSingle();

        if (!error && data && !cancelled) {
          const r = data as Record<string, unknown>;
          const mapped = {
            id: r.id as string,
            title: r.title as string,
            subtitle: (r.subtitle as string) || (r.description as string) || '',
            description: (r.description as string) || '',
            category: (r.section === 'corporate_material' ? 'corporativo' : r.section === 'knowledge_center' ? 'calidad' : r.section === 'project_bank' ? 'proyectos' : 'calidad') as ResourceCategory,
            type: (r.resource_type as ResourceType) || 'document',
            status: (r.status as ResourceStatus) || 'published',
            publishedAt: (r.published_at as string) || null,
            filePath: (r.file_path as string) || '',
            coverImagePath: (r.cover_image_path as string) || '',
            externalUrl: (r.external_url as string) || '',
            estimatedReadMinutes: null as number | null,
            coverStyle: 'corporativo' as ResourceCoverStyle,
            visualTone: 'corporativo' as 'corporativo',
            featured: false,
            fileLabel: null,
          } as (typeof mockResources)[number];
          setResource(mapped);

          const fp = r.file_path as string | undefined;
          const rt = r.resource_type as string;
          const isImageByType = rt === 'image' || rt === 'logo' || rt === 'teams_background';
          const isImageByExt = !!fp?.match(/\.(png|jpg|jpeg|gif|webp)$/i);
          if (fp && supabase && (isImageByType || isImageByExt)) {
            const { data: urlData } = await supabase.storage
              .from('acaspex-resource-files')
              .createSignedUrl(fp, 300);
            if (urlData?.signedUrl && !cancelled) setSignedUrl(urlData.signedUrl);
          }

          const cip = r.cover_image_path as string | undefined;
          if (cip && supabase && !cancelled) {
            const { data: coverData } = await supabase.storage
              .from('acaspex-resource-files')
              .createSignedUrl(cip, 300);
            if (coverData?.signedUrl && !cancelled) setCoverImageUrl(coverData.signedUrl);
          }
        } else if (!cancelled) {
          const mock = mockResources.find((r) => r.id === resourceId);
          setResource(mock || null);
        }
      } else {
        const mock = mockResources.find((r) => r.id === resourceId);
        if (!cancelled) setResource(mock || null);
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [configured, resourceId]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="h-4 w-96 rounded bg-slate-100" />
          <div className="aspect-[2/1] rounded-lg bg-slate-100" />
        </div>
      </section>
    );
  }

  if (!resource) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-slate-900">Recurso no disponible</h1>
          <p className="text-sm text-slate-600">
            Este recurso no existe o todavía no está publicado.
          </p>
          <Link
            to="/socios/recursos"
            className="inline-flex items-center gap-1 rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Volver al centro de conocimiento
          </Link>
        </div>
      </section>
    );
  }

  const TypeIcon = typeIconMap[resource.type] ?? FileText;
  const visibilityLabel = resource.category === 'corporativo' ? 'Junta Directiva' : 'Socios';
  const backPath = resource.category === 'corporativo' ? '/socios/material-corporativo' : '/socios/recursos';

  return (
    <div className="space-y-8">
      <Link
        to={backPath}
        className="text-sm font-medium text-teal-700 hover:text-teal-800"
      >
        {resource.category === 'corporativo' ? 'Volver a Material Corporativo' : 'Volver al centro de conocimiento'}
      </Link>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="aspect-[2/1] overflow-hidden bg-slate-100">
          {isImageResource(resource) && signedUrl ? (
            <img src={signedUrl} alt={resource.title} className="h-full w-full object-contain" />
          ) : isImageResource(resource) ? (
            <div className="flex h-full w-full items-center justify-center">
              <Image size={48} className="text-slate-300" />
            </div>
          ) : isPdfResource(resource) ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-rose-50">
              <FileText size={48} className="text-rose-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-700/80">Documento PDF</span>
              <span className="text-[11px] text-slate-500">Usa "Abrir recurso" para previsualizarlo</span>
            </div>
          ) : isOfficeResource(resource) ? (
            coverImageUrl ? (
              <img src={coverImageUrl} alt={resource.title} className="h-full w-full object-contain" />
            ) : (
            (() => {
              const ext = resource.filePath?.split('.').pop()?.toLowerCase() ?? '';
              const isWord = ext === 'docx' || ext === 'doc';
              const isPpt = ext === 'pptx' || ext === 'ppt';
              const label = isWord ? 'Documento Word' : isPpt ? 'Presentación PowerPoint' : 'Documento';
              const icon = isWord ? FileText : isPpt ? BookOpen : FileText;
              const tone = isWord ? 'text-blue-400' : isPpt ? 'text-amber-500' : 'text-slate-400';
              const Icon = icon;
              return (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-slate-50">
                  <Icon size={48} className={tone} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600/80">{label}</span>
                </div>
              );
            })()
            )
          ) : isExternalLinkResource(resource) ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-sky-50">
              <Globe size={48} className="text-sky-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-700/80">Enlace externo</span>
              <span className="text-[11px] text-slate-500">Usa "Abrir recurso" para visitarlo</span>
            </div>
          ) : (
            <MockCover resource={resource} />
          )}
        </div>
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-slate-900">{resource.title}</h1>
          <p className="mt-1 text-slate-600">{resource.subtitle}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Categoría</p>
            <span className="mt-1 inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
              {categoryLabel[resource.category] ?? resource.category}
            </span>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Tipo</p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-700">
              <TypeIcon size={14} className="text-slate-400" />
              {typeLabel[resource.type] ?? resource.type}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Publicado</p>
            <p className="mt-1 text-sm text-slate-700">
              {formatResourceDate(resource.publishedAt)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Acceso</p>
            <span className="mt-1 inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
              {visibilityLabel}
            </span>
          </div>
        </div>
        {resource.estimatedReadMinutes !== null && (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-700">Tiempo estimado:</span>{' '}
              {resource.estimatedReadMinutes} min
            </p>
          </div>
        )}
      </section>

      {resource.description && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Descripción</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{resource.description}</p>
        </section>
      )}

      {isOfficeResource(resource) && resource.filePath && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {(() => {
              const ext = resource.filePath?.split('.').pop()?.toLowerCase() ?? '';
              const isPpt = ext === 'pptx' || ext === 'ppt';
              const Icon = isPpt ? BookOpen : FileText;
              return <Icon size={32} className={isPpt ? 'text-amber-500' : 'text-blue-500'} />;
            })()}
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Documento descargable</h2>
              <p className="text-sm text-slate-600">Descarga el archivo para abrirlo en tu aplicación de escritorio.</p>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {isExternalLinkResource(resource) && resource.externalUrl && (
            <a
              href={resource.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800"
            >
              Abrir recurso
              <ChevronRight size={14} />
            </a>
          )}
          {(isImageResource(resource) || isPdfResource(resource)) && resource.filePath && supabase && (
            <button
              type="button"
              onClick={() => {
                const client = supabase;
                if (!client) return;
                client.storage
                  .from('acaspex-resource-files')
                  .createSignedUrl(resource.filePath!, 300)
                  .then(({ data }) => {
                    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                  });
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800"
            >
              <ChevronRight size={14} />
              {isPdfResource(resource) ? 'Abrir PDF' : 'Ver recurso'}
            </button>
          )}
          {resource.filePath && supabase && (
            <button
              type="button"
              onClick={() => {
                const client = supabase;
                if (!client) return;
                client.storage
                  .from('acaspex-resource-files')
                  .createSignedUrl(resource.filePath!, 60)
                  .then(({ data }) => {
                    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                  });
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Download size={14} />
              {isOfficeResource(resource) ? 'Descargar archivo' : 'Descargar'}
            </button>
          )}
          {!resource.externalUrl && !resource.filePath && (
            <p className="text-sm text-slate-500">Este recurso no tiene archivo ni enlace asociado.</p>
          )}
        </div>
      </section>
    </div>
  );
}
