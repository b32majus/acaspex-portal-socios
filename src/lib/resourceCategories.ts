import { supabase, isSupabaseConfigured } from './supabaseClient';

export type ResourceSection = 'knowledge_center' | 'project_bank' | 'corporate_material';

export type ResourceCategoryOption = {
  id: string;
  section: ResourceSection;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

export const managedResourceSections: ResourceSection[] = ['knowledge_center', 'project_bank'];

export const resourceSectionLabel: Record<ResourceSection, string> = {
  corporate_material: 'Material Corporativo',
  knowledge_center: 'Centro de Conocimiento',
  project_bank: 'Banco de Proyectos',
};

export async function fetchActiveResourceCategories(section: ResourceSection): Promise<ResourceCategoryOption[]> {
  if (!isSupabaseConfigured() || !supabase || section === 'corporate_material') return [];

  const { data, error } = await supabase
    .from('resource_categories')
    .select('id, section, slug, name, description, sort_order, is_active')
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
  if (!isSupabaseConfigured() || !supabase || section === 'corporate_material') return [];

  const { data, error } = await supabase
    .from('resource_categories')
    .select('id, section, slug, name, description, sort_order, is_active')
    .eq('section', section)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error || !data) return [];

  const categories = data as ResourceCategoryOption[];
  return categories.filter((category) => category.is_active || category.id === currentCategoryId);
}
