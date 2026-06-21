import { Link, Outlet, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useRef } from 'react';

const memberLinks = [
  { label: 'Inicio', to: '/socios' },
  { label: 'Centro de conocimiento', to: '/socios/recursos' },
  { label: 'Banco de proyectos', to: '/socios/proyectos' },
];

export function MemberLayout() {
  const location = useLocation();
  const avatarMenuRef = useRef<HTMLDetailsElement>(null);

  const closeDropdown = () => {
    if (avatarMenuRef.current) {
      avatarMenuRef.current.open = false;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-teal-900 text-white px-6 py-4 lg:px-8">
        <div className="mx-auto max-w-6xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/acaspex/logo-burbuja.jpg"
              alt="ACASPEX"
              className="h-9 w-auto rounded-lg object-contain bg-teal-800/40 ring-1 ring-white/10"
            />
            <div>
              <h1 className="font-serif text-xl lg:text-2xl font-light tracking-tight text-white">ACASPEX</h1>
              <p className="text-[11px] font-medium uppercase tracking-widest text-teal-200/70">Área de socios</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {memberLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  className={`text-sm font-medium text-white/90 transition-colors hover:text-white px-3 py-1.5${isActive ? ' text-white border-b border-white/40 pb-0.5' : ''}`}
                  to={link.to}
                >
                  {link.label}
                </Link>
              );
            })}
            <details ref={avatarMenuRef} className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 hover:bg-teal-800/50 rounded-full px-2 py-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-xs font-medium text-white">L</span>
                <span className="text-sm text-white/90">Lucía</span>
                <ChevronDown className="h-4 w-4 text-white/60" />
              </summary>
              <div className="absolute right-0 top-full z-10 mt-2 w-44 rounded-xl border border-teal-700/50 bg-teal-900 py-1 shadow-lg">
                <Link className="block px-4 py-2 text-sm text-white/90 hover:bg-teal-800 hover:text-white" to="/socios/mi-cuenta" onClick={closeDropdown}>Mi cuenta</Link>
                <Link className="block px-4 py-2 text-sm text-white/60 hover:text-white" to="/login" onClick={closeDropdown}>Salir</Link>
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
