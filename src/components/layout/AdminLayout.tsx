import { Link, Outlet, useLocation } from 'react-router-dom';

const adminLinks = [
  { label: 'Panel', to: '/admin' },
  { label: 'Socios', to: '/admin/socios' },
  { label: 'Recursos', to: '/admin/recursos' },
  { label: 'Renovaciones', to: '/admin/renovaciones' },
];

export function AdminLayout() {
  const location = useLocation();
  const assetBase = import.meta.env.BASE_URL;

  const isActive = (to: string) => {
    if (to === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(to);
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="border-b border-slate-200 bg-white md:w-64 md:flex-shrink-0 md:border-b-0 md:border-r">
          <div className="px-5 pt-5 pb-3 md:px-6 md:pt-6 md:pb-4">
            <img
              src={`${assetBase}assets/acaspex/logo-burbuja.png`}
              alt="ACASPEX"
              className="mb-2 h-12 w-auto max-w-full object-contain"
            />
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-600">ACASPEX</p>
            <h2 className="mt-0.5 text-lg font-semibold text-slate-800">Administración</h2>
            <p className="mt-0.5 text-xs text-slate-400">Portal de socios</p>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:gap-0 md:px-3 md:pb-6">
            {adminLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                  to={link.to}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <section className="flex-1 p-6 md:p-8">
          <Outlet />
        </section>
      </div>
    </main>
  );
}
