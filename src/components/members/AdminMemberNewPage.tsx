import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { createAdminMember } from '../../lib/memberQueries';
import { createEmptyMemberFormState, type MemberFormState } from '../../lib/memberFormModel';
import { MemberForm } from './MemberForm';

export function AdminMemberNewPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<MemberFormState>(createEmptyMemberFormState());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setSubmitting(true);
    setError(null);
    try {
      const created = await createAdminMember(form);
      navigate(`/admin/socios/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el socio.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link to="/admin/socios" className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800">
        <ChevronLeft size={14} /> Volver a socios
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-teal-700">Alta administrativa</p>
          <h1 className="mt-2 font-serif text-3xl font-light text-slate-900">Nuevo socio</h1>
          <p className="mt-1 text-sm text-slate-500">Crear una ficha administrativa completa. El acceso al portal se configurará más adelante.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
        <p className="text-sm text-amber-800">
          <strong>Este alta crea una ficha administrativa. El acceso al portal se configurará en H0.9C.</strong>
        </p>
      </section>

      <MemberForm
        value={form}
        mode="create"
        submitting={submitting}
        error={error}
        onChange={setForm}
        onSubmit={handleCreate}
        onCancel={() => navigate('/admin/socios')}
      />
    </div>
  );
}
