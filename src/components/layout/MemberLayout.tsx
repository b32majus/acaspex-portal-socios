import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useRef } from 'react';
import { useAuth } from '../../lib/authContext';
import { useIdentity } from '../../lib/identityContext';

const memberLinks = [
  { label: 'Inicio', to: '/socios' },
  { label: 'Centro de conocimiento', to: '/socios/recursos' },
  { label: 'Banco de proyectos', to: '/socios/proyectos' },
];

export function MemberLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const assetBase = import.meta.env.BASE_URL;
  const avatarMenuRef = useRef<HTMLDetailsElement>(null);
  const { session, signOut } = useAuth();
  const { role, status, accessReason } = useIdentity();

  const userEmail = session?.user?.email ?? null;
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';

  const closeDropdown = () => {
    if (avatarMenuRef.current) {
      avatarMenuRef.current.open = false;
    }
  };

  async function handleSignOut() {
    closeDropdown();
    await signOut();
    navigate('/login');
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-teal-900 text-white px-6 py-4 lg:px-8">
        <div className="mx-auto max-w-6xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`${assetBase}assets/acaspex/logo-burbuja.jpg`}
              alt="ACASPEX"
              className="h-9 w-auto rounded-lg object-contain bg-teal-800/40 ring-1 ring-white/10"
            />
            <div>
              <h1 className="font-serif text-xl lg:text-2xl font-light tracking-tight text-white">ACASPEX</h1>
              <p className="text-[11px] font-medium uppercase tracking-widest text-teal-200/70">Área de socios</p>
              {role && (
                <p className="text-[10px] text-teal-300/60 capitalize">{role.replace(/_/g, ' ')}</p>
              )}
              {accessReason === 'admin_oversight' && (
                <p className="text-[10px] text-amber-300/70">Supervisión administrativa</p>
              )}
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
            {session ? (
              <details ref={avatarMenuRef} className="relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 hover:bg-teal-800/50 rounded-full px-2 py-1">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-xs font-medium text-white">{userInitial}</span>
                  <span className="text-sm text-white/90 truncate max-w-[140px]">{userEmail ?? 'Sesión iniciada'}</span>
                  <ChevronDown className="h-4 w-4 text-white/60 shrink-0" />
                </summary>
                <div className="absolute right-0 top-full z-10 mt-2 w-44 rounded-xl border border-teal-700/50 bg-teal-900 py-1 shadow-lg">
                  <Link className="block px-4 py-2 text-sm text-white/90 hover:bg-teal-800 hover:text-white" to="/socios/mi-cuenta" onClick={closeDropdown}>Mi cuenta</Link>
                  <button className="block w-full text-left px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-teal-800" onClick={handleSignOut}>Cerrar sesión</button>
                </div>
              </details>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-white/80 transition-colors hover:text-white px-3 py-1.5"
              >
                Iniciar sesión
              </Link>
            )}
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </section>
    </main>
  );
}
