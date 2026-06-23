import {
  BookOpen,
  ClipboardList,
  FileText,
  Globe,
  Image,
  Video,
} from 'lucide-react';
import type { ResourceStatus, ResourceType } from '../data/mockResources';

export const categoryLabel: Record<string, string> = {
  calidad: 'Calidad asistencial',
  seguridad: 'Seguridad del paciente',
  investigacion: 'Investigación',
  formacion: 'Formación',
  herramientas: 'Herramientas',
  corporativo: 'Material corporativo',
  proyectos: 'Banco de proyectos',
};

export const typeLabel: Record<string, string> = {
  pdf: 'PDF',
  video: 'Vídeo',
  template: 'Plantilla',
  link: 'Enlace',
  presentation: 'Presentación',
  image: 'Imagen',
  logo: 'Logo',
  teams_background: 'Fondo Teams',
  document: 'Documento',
  external_link: 'Enlace externo',
};

export const resourceStatusLabel: Record<ResourceStatus, string> = {
  published: 'Publicado',
  draft: 'Borrador',
  archived: 'Archivado',
};

export const resourceStatusBadgeClass: Record<ResourceStatus, string> = {
  published: 'bg-emerald-100 text-emerald-800',
  draft: 'bg-amber-100 text-amber-700',
  archived: 'bg-slate-100 text-slate-600',
};

export const typeIconMap: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
  pdf: FileText,
  video: Video,
  template: ClipboardList,
  link: Globe,
  presentation: BookOpen,
  image: Image,
  logo: Image,
  teams_background: Image,
  document: FileText,
  external_link: Globe,
};

export function formatResourceDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
}

export type ResourceLike = {
  type?: string;
  filePath?: string | null;
  externalUrl?: string | null;
};

export function isImageResource(resource: ResourceLike): boolean {
  if (!resource.filePath) return false;
  if (resource.type === 'image' || resource.type === 'logo' || resource.type === 'teams_background') return true;
  return !!resource.filePath.match(/\.(png|jpg|jpeg|gif|webp)$/i);
}

export function isPdfResource(resource: ResourceLike): boolean {
  if (resource.type === 'pdf') return true;
  return !!resource.filePath?.match(/\.pdf$/i);
}

export function isOfficeResource(resource: ResourceLike): boolean {
  if (!resource.filePath) return false;
  if (resource.type === 'document' || resource.type === 'template' || resource.type === 'presentation') return true;
  return !!resource.filePath.match(/\.(docx?|pptx?|xlsx?)$/i);
}

export function isExternalLinkResource(resource: ResourceLike): boolean {
  return !!(resource.externalUrl && !resource.filePath);
}

export function isPreviewableResource(resource: ResourceLike): boolean {
  return isImageResource(resource) || isPdfResource(resource);
}

export function isDownloadOnlyResource(resource: ResourceLike): boolean {
  if (!resource.filePath) return false;
  return isOfficeResource(resource) || (!isImageResource(resource) && !isPdfResource(resource));
}
