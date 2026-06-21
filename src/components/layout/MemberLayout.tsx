import { Link, Outlet } from 'react-router-dom';

const memberLinks = [
  { label: 'Inicio', to: '/socios' },
  { label: 'Biblioteca', to: '/socios/recursos' },
];

export function MemberLayout() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-teal-700">ACASPEX</p>
            <h1 className="text-xl font-semibold">Area de socios</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {memberLinks.map((link) => (
              <Link key={link.to} className="rounded-full border border-slate-200 px-4 py-2 text-sm hover:bg-slate-100" to={link.to}>
                {link.label}
              </Link>
            ))}
            <details className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-medium text-white">L</span>
                <span>Lucia</span>
              </summary>
              <div className="absolute right-0 top-full z-10 mt-2 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <Link className="block px-4 py-2 text-sm hover:bg-slate-50" to="/socios/mi-cuenta">Mi cuenta</Link>
                <Link className="block px-4 py-2 text-sm text-slate-500 hover:bg-slate-50" to="/login">Salir</Link>
              </div>
            </details>
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </section>
    </main>
  );
}
