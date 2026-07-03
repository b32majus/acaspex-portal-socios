import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Filter, Plus, Search } from 'lucide-react';
import { fetchAdminMembers, getMemberValidityStatus, RENEWAL_NOTICE_DAYS, type MemberValidityStatus } from '../../lib/memberQueries';
import { mapMemberRowToForm, type MemberRow } from '../../lib/memberFormModel';
import { memberStatusOptions, memberProfileOptions, professionalCategoryOptions, organizationOptions } from '../../lib/memberFormOptions';

const statusLabelMap = Object.fromEntries(memberStatusOptions.map(o => [o.value, o.label]));
const profileLabelMap = Object.fromEntries(memberProfileOptions.map(o => [o.value, o.label]));

type ValidityFilter = 'all' | MemberValidityStatus;

const validityLabelMap: Record<MemberValidityStatus, string> = {
  vigente: 'Cuota vigente',
  proximo_vencer: 'Próximo a vencer',
  vencido: 'Cuota vencida',
  inactivo: 'Inactivo',
};

const validityBadgeClass: Record<MemberValidityStatus, string> = {
  vigente: 'bg-emerald-100 text-emerald-800',
  proximo_vencer: 'bg-amber-100 text-amber-700',
  vencido: 'bg-red-100 text-red-700',
  inactivo: 'bg-slate-100 text-slate-600',
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split('-').map(Number);
  const [ty, tm, td] = toIso.split('-').map(Number);
  const from = Date.UTC(fy, fm - 1, fd);
  const to = Date.UTC(ty, tm - 1, td);
  return Math.round((to - from) / 86_400_000);
}

function formatValidityDetail(member: MemberRow, today: string): string {
  const validity = getMemberValidityStatus(member, today);
  if (validity === 'inactivo') return '—';
  if (!member.paid_until) return '—';
  const days = daysBetween(today, member.paid_until);
  if (days === 0) return 'Vence hoy';
  if (days > 0) {
    if (days <= RENEWAL_NOTICE_DAYS) return `Quedan ${days} días`;
    return `Quedan ${days} días`;
  }
  const elapsed = Math.abs(days);
  return `Venció hace ${elapsed} ${elapsed === 1 ? 'día' : 'días'}`;
}

export function AdminMembersPage() {
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [profileFilter, setProfileFilter] = useState<string>('all');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [validityFilter, setValidityFilter] = useState<ValidityFilter>('all');

  useEffect(() => {
    fetchAdminMembers()
      .then(setRows)
      .catch(() => setError('No se pudieron cargar los socios.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const today = todayIso();
    return rows.filter((row) => {
      const form = mapMemberRowToForm(row);
      const full = `${form.firstName} ${form.lastName1} ${form.lastName2} `.toLowerCase();
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        full.includes(q) ||
        (row.email || '').toLowerCase().includes(q) ||
        (row.organization || '').toLowerCase().includes(q) ||
        (row.professional_category || '').toLowerCase().includes(q) ||
        (row.job_title || '').toLowerCase().includes(q) ||
        (row.member_number || '').toLowerCase().includes(q);

      const matchStatus = statusFilter === 'all' || row.status === statusFilter;
      const matchProfile = profileFilter === 'all' || row.member_profile === profileFilter;
      const matchOrg = organizationFilter === 'all' || row.organization === organizationFilter;
      const matchCat = categoryFilter === 'all' || row.professional_category === categoryFilter;
      const matchValidity = validityFilter === 'all' || getMemberValidityStatus(row, today) === validityFilter;

      return matchSearch && matchStatus && matchProfile && matchOrg && matchCat && matchValidity;
    });
  }, [rows, search, statusFilter, profileFilter, organizationFilter, categoryFilter, validityFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-slate-200" />
          <div className="h-32 rounded-2xl bg-slate-100" />
          <div className="h-64 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/60 p-6">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-light text-slate-900">Socios</h1>
            <p className="mt-1 text-sm text-slate-500">Gestión del registro de socios.</p>
          </div>
          <Link
            to="/admin/socios/nuevo"
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800"
          >
            <Plus size={15} /> Nuevo socio
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Filter size={16} className="text-teal-700" />
          Filtros
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label htmlFor="member-search" className="block text-xs font-medium text-slate-500">Buscar</label>
            <div className="relative mt-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="member-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, email, nº socio…"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="member-status" className="block text-xs font-medium text-slate-500">Estado</label>
            <select
              id="member-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">Todos</option>
              {memberStatusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="member-profile" className="block text-xs font-medium text-slate-500">Perfil / Cuota</label>
            <select
              id="member-profile"
              value={profileFilter}
              onChange={(e) => setProfileFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">Todas</option>
              {memberProfileOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="member-org" className="block text-xs font-medium text-slate-500">Organización</label>
            <select
              id="member-org"
              value={organizationFilter}
              onChange={(e) => setOrganizationFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">Todas</option>
              {organizationOptions.filter(o => o.value !== '').map((org) => (
                <option key={org.value} value={org.value}>{org.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="member-cat" className="block text-xs font-medium text-slate-500">Categoría profesional</label>
            <select
              id="member-cat"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">Todas</option>
              {professionalCategoryOptions.filter(o => o.value !== '').map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="member-validity" className="block text-xs font-medium text-slate-500">Vigencia de cuota</label>
            <select
              id="member-validity"
              value={validityFilter}
              onChange={(e) => setValidityFilter(e.target.value as ValidityFilter)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">Todos</option>
              <option value="vigente">Cuota vigente</option>
              <option value="proximo_vencer">Próximo a vencer</option>
              <option value="vencido">Cuota vencida</option>
              <option value="inactivo">Inactivo / no renovable</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            {rows.length === 0 ? 'No hay socios todavía.' : 'Ningún socio coincide con los filtros.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 font-medium">Nº socio</th>
                  <th className="pb-3 font-medium">Nombre</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Organización</th>
                  <th className="pb-3 font-medium">Perfil/Cuota</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Vigencia</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                  const today = todayIso();
                  return filtered.map((row) => {
                    const statusBadge =
                      row.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                      row.status === 'pending_review' ? 'bg-amber-100 text-amber-700' :
                      row.status === 'expired' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-600';
                    const validity = getMemberValidityStatus(row, today);
                    const validityDetail = formatValidityDetail(row, today);
                    return (
                    <tr key={row.id} className="hover:bg-slate-50/60">
                      <td className="py-3 font-mono text-xs text-slate-500">{row.member_number || '—'}</td>
                      <td className="py-3 font-medium text-slate-900">
                        {[row.first_name, row.last_name_1, row.last_name_2].filter(Boolean).join(' ')}
                      </td>
                      <td className="py-3 text-slate-600 text-xs">{row.email}</td>
                      <td className="py-3 text-slate-600 text-xs">{row.organization || '—'}</td>
                      <td className="py-3 text-slate-600 text-xs">
                        {profileLabelMap[row.member_profile || ''] || row.member_profile || '—'}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge}`}>
                          {statusLabelMap[row.status] || row.status}
                        </span>
                      </td>
                      <td className="py-3 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ${validityBadgeClass[validity]}`}>
                            {validityLabelMap[validity]}
                          </span>
                          <span className="text-slate-500">{validityDetail}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/admin/socios/${row.id}`}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-50"
                        >
                          Ver
                          <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                  });
                })()}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
