import { Link, Outlet } from 'react-router-dom';

const adminLinks = [
  { label: 'Panel', to: '/admin' },
  { label: 'Socios', to: '/admin/socios' },
  { label: 'Recursos', to: '/admin/recursos' },
  { label: 'Renovaciones', to: '/admin/renovaciones' },
];

export function AdminLayout() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="border-b border-slate-200 bg-white p-6 md:border-b-0 md:border-r">
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700">ACASPEX</p>
          <h1 className="mt-1 text-xl font-semibold">Administrador</h1>
          <nav className="mt-6 flex flex-wrap gap-2 md:flex-col">
            {adminLinks.map((link) => (
              <Link key={link.to} className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50" to={link.to}>
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section className="p-6 md:p-8">
          <Outlet />
        </section>
      </div>
    </main>
  );
}
