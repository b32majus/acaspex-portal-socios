import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, CheckCircle, ChevronLeft, Edit, Plus, XCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { getResourceCategoryIconOption } from '../../lib/resourceCategories';
import { IconPicker } from './IconPicker';

type Category = {
  id: string;
  section: string;
  slug: string;
  name: string;
  description: string | null;
  icon_key: string | null;
  sort_order: number;
  is_active: boolean;
};

const sectionLabel: Record<string, string> = {
  knowledge_center: 'Centro de Conocimiento',
  project_bank: 'Banco de Proyectos',
};

const sections = ['knowledge_center', 'project_bank'] as const;

const duplicateCategoryMessage = 'Ya existe una subsección con ese nombre en esta sección. Elige otro nombre o edita la existente.';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminResourceCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const configured = isSupabaseConfigured();

  const [showCreate, setShowCreate] = useState(false);
  const [newSection, setNewSection] = useState('knowledge_center');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIconKey, setNewIconKey] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editIconKey, setEditIconKey] = useState('');
  const [saving, setSaving] = useState(false);

  const [reordering, setReordering] = useState(false);

  async function loadCategories() {
    if (!configured || !supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from('resource_categories')
      .select('id, section, slug, name, description, icon_key, sort_order, is_active')
      .in('section', ['knowledge_center', 'project_bank'])
      .order('section', { ascending: true })
      .order('sort_order', { ascending: true });

    if (data) setCategories(data as Category[]);
    setLoading(false);
  }

  useEffect(() => { loadCategories(); }, [configured]);

  async function handleCreate() {
    if (!configured || !supabase) return;
    if (!newName.trim()) return;
    setCreating(true);
    setFeedback(null);

    const slug = slugify(newName.trim());

    const { data: existingCategory, error: duplicateCheckError } = await supabase
      .from('resource_categories')
      .select('id')
      .eq('section', newSection)
      .eq('slug', slug)
      .maybeSingle();

    if (duplicateCheckError) {
      setFeedback({ type: 'error', message: 'No se ha podido comprobar si la subsección ya existe. Inténtalo de nuevo.' });
      setCreating(false);
      return;
    }

    if (existingCategory) {
      setFeedback({ type: 'error', message: duplicateCategoryMessage });
      setCreating(false);
      return;
    }

    const { data: maxOrderData, error: maxOrderError } = await supabase
      .from('resource_categories')
      .select('sort_order')
      .eq('section', newSection)
      .order('sort_order', { ascending: false })
      .limit(1);

    if (maxOrderError) {
      setFeedback({ type: 'error', message: 'Error al calcular el orden: ' + maxOrderError.message });
      setCreating(false);
      return;
    }

    const currentMaxOrder = (maxOrderData?.[0] as { sort_order?: number } | undefined)?.sort_order ?? 0;
    const nextOrder = currentMaxOrder + 1;

    const { error } = await supabase
      .from('resource_categories')
      .insert({
        section: newSection,
        name: newName.trim(),
        slug,
        description: newDesc.trim() || null,
        icon_key: newIconKey || 'folder',
        sort_order: nextOrder,
        is_active: true,
      });

    if (error) {
      if (error.code === '23505') {
        setFeedback({ type: 'error', message: duplicateCategoryMessage });
      } else {
        setFeedback({ type: 'error', message: 'No se ha podido crear la subsección. Inténtalo de nuevo.' });
      }
    } else {
      setFeedback({ type: 'success', message: 'Subsección creada.' });
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
      setNewIconKey('');
      loadCategories();
    }
    setCreating(false);
  }

  async function handleToggleActive(cat: Category) {
    if (!configured || !supabase) return;
    setFeedback(null);
    const { error } = await supabase
      .from('resource_categories')
      .update({ is_active: !cat.is_active })
      .eq('id', cat.id);

    if (error) {
      setFeedback({ type: 'error', message: 'Error: ' + error.message });
    } else {
      setFeedback({ type: 'success', message: cat.is_active ? 'Subsección desactivada.' : 'Subsección activada.' });
      loadCategories();
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
    setEditIconKey(cat.icon_key || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditIconKey('');
  }

  async function handleSaveEdit(catId: string) {
    if (!configured || !supabase) return;
    if (!editName.trim()) return;
    setSaving(true);
    setFeedback(null);

    const slug = slugify(editName.trim());

    const { error } = await supabase
      .from('resource_categories')
      .update({
        name: editName.trim(),
        slug,
        description: editDesc.trim() || null,
        icon_key: editIconKey || 'folder',
      })
      .eq('id', catId);

    if (error) {
      setFeedback({ type: 'error', message: error.code === '23505' ? duplicateCategoryMessage : 'Error al guardar: ' + error.message });
    } else {
      setFeedback({ type: 'success', message: 'Subsección actualizada.' });
      setEditingId(null);
      loadCategories();
    }
    setSaving(false);
  }

  async function handleMoveUp(cat: Category) {
    if (!configured || !supabase || reordering) return;
    setFeedback(null);
    const sameSection = categories.filter((c) => c.section === cat.section);
    const idx = sameSection.findIndex((c) => c.id === cat.id);
    if (idx <= 0) return;

    const prev = sameSection[idx - 1];
    setReordering(true);

    const first = await supabase.from('resource_categories').update({ sort_order: cat.sort_order }).eq('id', prev.id);
    if (first.error) {
      setFeedback({ type: 'error', message: 'Error al reordenar: ' + first.error.message });
      setReordering(false);
      return;
    }

    const second = await supabase.from('resource_categories').update({ sort_order: prev.sort_order }).eq('id', cat.id);
    if (second.error) {
      await supabase.from('resource_categories').update({ sort_order: prev.sort_order }).eq('id', prev.id);
      setFeedback({ type: 'error', message: 'Error al reordenar. Se intentó revertir el cambio parcial: ' + second.error.message });
    } else {
      loadCategories();
    }
    setReordering(false);
  }

  async function handleMoveDown(cat: Category) {
    if (!configured || !supabase || reordering) return;
    setFeedback(null);
    const sameSection = categories.filter((c) => c.section === cat.section);
    const idx = sameSection.findIndex((c) => c.id === cat.id);
    if (idx >= sameSection.length - 1) return;

    const next = sameSection[idx + 1];
    setReordering(true);

    const first = await supabase.from('resource_categories').update({ sort_order: cat.sort_order }).eq('id', next.id);
    if (first.error) {
      setFeedback({ type: 'error', message: 'Error al reordenar: ' + first.error.message });
      setReordering(false);
      return;
    }

    const second = await supabase.from('resource_categories').update({ sort_order: next.sort_order }).eq('id', cat.id);
    if (second.error) {
      await supabase.from('resource_categories').update({ sort_order: next.sort_order }).eq('id', next.id);
      setFeedback({ type: 'error', message: 'Error al reordenar. Se intentó revertir el cambio parcial: ' + second.error.message });
    } else {
      loadCategories();
    }
    setReordering(false);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
        <p className="text-sm text-amber-800">Supabase no está configurado. La gestión de subsecciones no está disponible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/recursos" className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800">
        <ChevronLeft size={14} />
        Volver a recursos
      </Link>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light text-slate-900">Subsecciones</h1>
          <p className="mt-1 text-sm text-slate-500">Gestiona las subsecciones de Centro de Conocimiento y Banco de Proyectos.</p>
          <p className="mt-1 text-xs text-slate-400">Material Corporativo no tiene subsecciones por ahora.</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowCreate(true); setFeedback(null); }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800"
        >
          <Plus size={15} />
          Nueva subsección
        </button>
      </section>

      {feedback && (
        <div className={`rounded-lg border p-3 text-sm ${feedback.type === 'success' ? 'border-emerald-100 bg-emerald-50/60 text-emerald-800' : 'border-red-100 bg-red-50/60 text-red-800'}`}>
          {feedback.message}
        </div>
      )}

      {showCreate && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-serif text-lg text-slate-900">Nueva subsección</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-500">Sección *</label>
              <select value={newSection} onChange={(e) => setNewSection(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600">
                <option value="knowledge_center">Centro de Conocimiento</option>
                <option value="project_bank">Banco de Proyectos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Nombre *</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej: Gestión de la cronicidad" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Descripción</label>
              <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Icono</label>
              <IconPicker value={newIconKey} onChange={setNewIconKey} disabled={creating} />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleCreate} disabled={creating || !newName.trim()} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 disabled:opacity-60">
              <Plus size={15} /> {creating ? 'Creando...' : 'Crear'}
            </button>
            <button onClick={() => setShowCreate(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">Cancelar</button>
          </div>
          {newName.trim() && <p className="mt-2 text-xs text-slate-400">Slug: <code>{slugify(newName.trim())}</code></p>}
        </section>
      )}

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">No hay subsecciones todavía.</div>
      ) : (
        sections.map((sec) => {
          const secCats = categories.filter((c) => c.section === sec);
          if (secCats.length === 0) return null;
          return (
            <section key={sec} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 font-serif text-lg text-slate-900">{sectionLabel[sec]}</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[52rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                      <th className="pb-3 font-medium">Nombre</th>
                      <th className="pb-3 font-medium">Icono</th>
                      <th className="pb-3 font-medium">Slug</th>
                      <th className="pb-3 font-medium">Orden</th>
                      <th className="pb-3 font-medium">Estado</th>
                      <th className="pb-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {secCats.map((cat) => {
                      const isEditing = editingId === cat.id;
                      const sameSection = categories.filter((c) => c.section === cat.section);
                      const idx = sameSection.findIndex((c) => c.id === cat.id);
                      const isFirst = idx === 0;
                      const isLast = idx === sameSection.length - 1;
                      const iconOption = getResourceCategoryIconOption(cat.icon_key);
                      const Icon = iconOption.icon;

                      return (
                        <tr key={cat.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 align-top">
                            {isEditing ? (
                              <div className="space-y-2">
                                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded border border-slate-200 px-2 py-1 text-sm" />
                                <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Descripción" className="w-full rounded border border-slate-200 px-2 py-1 text-sm text-slate-600" />
                              </div>
                            ) : (
                              <div>
                                <span className="font-medium text-slate-900">{cat.name}</span>
                                {cat.description && <p className="mt-0.5 text-xs text-slate-500">{cat.description}</p>}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 align-top">
                            {isEditing ? (
                              <IconPicker value={editIconKey} onChange={setEditIconKey} disabled={saving} />
                            ) : (
                              <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                                <Icon size={14} className="text-slate-500" />
                                <span>{iconOption.label}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 text-xs font-mono text-slate-500">{cat.slug}</td>
                          <td className="py-2.5">
                            <span className="text-slate-600">{cat.sort_order}</span>
                          </td>
                          <td className="py-2.5">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                              {cat.is_active ? <CheckCircle size={11} /> : <XCircle size={11} />}
                              {cat.is_active ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isEditing ? (
                                <>
                                  <button onClick={() => handleSaveEdit(cat.id)} disabled={saving || !editName.trim()} className="rounded-lg px-2.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-60">Guardar</button>
                                  <button onClick={cancelEdit} className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100">Cancelar</button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleMoveUp(cat)}
                                    disabled={reordering || isFirst}
                                    className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                    title="Subir"
                                  >
                                    <ArrowUp size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleMoveDown(cat)}
                                    disabled={reordering || isLast}
                                    className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                    title="Bajar"
                                  >
                                    <ArrowDown size={12} />
                                  </button>
                                  <button onClick={() => startEdit(cat)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-50">
                                    <Edit size={12} /> Editar
                                  </button>
                                  <button onClick={() => handleToggleActive(cat)} className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${cat.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                                    {cat.is_active ? 'Desactivar' : 'Activar'}
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
            </section>
          );
        })
      )}
    </div>
  );
}
