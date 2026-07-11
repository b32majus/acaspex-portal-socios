import { Link } from 'react-router-dom';
import { FileText, Send, CheckCircle, Eye, CalendarDays } from 'lucide-react';

type HubLink = {
  to: string;
  title: string;
  description: string;
  icon: React.ElementType;
  mode: 'real' | 'mock';
  badge: string;
  target?: string;
  rel?: string;
};

const hubLinks: HubLink[] = [
  {
    to: '/admin/jornadas/comunicaciones',
    title: 'Comunicaciones III Jornada',
    description: 'Revisión y gestión administrativa de las comunicaciones recibidas.',
    icon: FileText,
    mode: 'real',
    badge: 'Real · requiere admin',
  },
  {
    to: '/jornadas/iii-jornada/comunicaciones',
    title: 'Formulario de envío',
    description: 'Formulario público para el envío de nuevas comunicaciones.',
    icon: Send,
    mode: 'real',
    badge: 'Real · público',
  },
  {
    to: '/jornadas/evaluacion',
    title: 'Evaluación real',
    description: 'Panel de evaluación para evaluadores asignados.',
    icon: CheckCircle,
    mode: 'real',
    badge: 'Real · requiere permisos',
  },
  {
    to: '/admin/jornadas/mock-comunicaciones',
    title: 'Mock admin',
    description: 'Vista simulada del panel de administración para revisión visual.',
    icon: FileText,
    mode: 'mock',
    badge: 'Mock / revisión visual',
  },
  {
    to: '/jornadas/evaluacion/mock',
    title: 'Mock evaluador',
    description: 'Vista simulada del panel de evaluación para revisión visual.',
    icon: Eye,
    mode: 'mock',
    badge: 'Mock / revisión visual',
  },
];

export function AdminJornadasHubPage() {
  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-2">
          <CalendarDays size={20} className="text-teal-700" />
          <h1 className="font-serif text-2xl font-light text-slate-900">Jornadas</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Accesos a comunicaciones, formulario de envío y evaluación.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-serif text-lg text-slate-900">Enlaces de la III Jornada</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hubLinks.map((link) => {
            const Icon = link.icon;
            const isMock = link.mode === 'mock';
            return (
              <Link
                key={link.to}
                to={link.to}
                target={link.target}
                rel={link.rel}
                className={`group relative flex flex-col gap-3 rounded-xl border p-5 transition-colors ${
                  isMock
                    ? 'border-amber-200 bg-amber-50/40 hover:border-amber-300 hover:bg-amber-50/60'
                    : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      isMock ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      isMock ? 'bg-amber-500 text-white' : 'bg-teal-700 text-white'
                    }`}
                  >
                    {link.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-teal-800">
                    {link.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {link.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
