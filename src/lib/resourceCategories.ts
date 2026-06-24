import type { ComponentType } from 'react';
import {
  Activity,
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  Folder,
  GraduationCap,
  HeartPulse,
  Route,
  Shield,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export type ResourceSection = 'knowledge_center' | 'project_bank' | 'corporate_material';

export type ResourceCategoryOption = {
  id: string;
  section: ResourceSection;
  slug: string;
  name: string;
  description: string | null;
  icon_key?: string | null;
  sort_order: number;
  is_active: boolean;
};

export type ResourceCategoryIconKey =
  | 'book-open'
  | 'shield'
  | 'activity'
  | 'graduation-cap'
  | 'wrench'
  | 'clipboard-list'
  | 'heart-pulse'
  | 'users'
  | 'sparkles'
  | 'building'
  | 'folder'
  | 'bar-chart'
  | 'route';

export type ResourceCategoryIconOption = {
  key: ResourceCategoryIconKey;
  label: string;
  icon: ComponentType<{ size?: number | string; className?: string }>;
};

export const managedResourceSections: ResourceSection[] = ['knowledge_center', 'project_bank', 'corporate_material'];

export const resourceSectionLabel: Record<ResourceSection, string> = {
  corporate_material: 'Material Corporativo',
  knowledge_center: 'Centro de Conocimiento',
  project_bank: 'Banco de Proyectos',
};

export const resourceCategoryIconOptions: ResourceCategoryIconOption[] = [
  { key: 'book-open', label: 'Libro', icon: BookOpen },
  { key: 'shield', label: 'Escudo', icon: Shield },
  { key: 'activity', label: 'Actividad', icon: Activity },
  { key: 'graduation-cap', label: 'Formación', icon: GraduationCap },
  { key: 'wrench', label: 'Herramienta', icon: Wrench },
  { key: 'clipboard-list', label: 'Checklist', icon: ClipboardList },
  { key: 'heart-pulse', label: 'Salud', icon: HeartPulse },
  { key: 'users', label: 'Personas', icon: Users },
  { key: 'sparkles', label: 'Innovación', icon: Sparkles },
  { key: 'building', label: 'Organización', icon: Building2 },
  { key: 'folder', label: 'Carpeta', icon: Folder },
  { key: 'bar-chart', label: 'Indicadores', icon: BarChart3 },
  { key: 'route', label: 'Ruta', icon: Route },
];

const resourceCategoryIconOptionMap = new Map(resourceCategoryIconOptions.map((option) => [option.key, option]));

export function getResourceCategoryIconOption(iconKey?: string | null): ResourceCategoryIconOption {
  return resourceCategoryIconOptionMap.get((iconKey || 'folder') as ResourceCategoryIconKey)
    ?? resourceCategoryIconOptionMap.get('folder')!;
}

export function getResourceCategoryIcon(iconKey?: string | null) {
  return getResourceCategoryIconOption(iconKey).icon;
}

export async function fetchActiveResourceCategories(section: ResourceSection): Promise<ResourceCategoryOption[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from('resource_categories')
    .select('id, section, slug, name, description, icon_key, sort_order, is_active')
    .eq('section', section)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error || !data) return [];
  return data as ResourceCategoryOption[];
}

export async function fetchEditableResourceCategories(
  section: ResourceSection,
  currentCategoryId?: string | null,
): Promise<ResourceCategoryOption[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from('resource_categories')
    .select('id, section, slug, name, description, icon_key, sort_order, is_active')
    .eq('section', section)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error || !data) return [];

  const categories = data as ResourceCategoryOption[];
  return categories.filter((category) => category.is_active || category.id === currentCategoryId);
}
