import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  FolderKanban,
  Globe,
  GraduationCap,
  Handshake,
  Lightbulb,
  Mail,
  MessageCircle,
  Settings,
  ShieldCheck,
  TrendingUp,
  User,
  Users,
  Video,
  Wrench,
} from 'lucide-react';
import { mockMembers } from '../data/mockMembers';
import { mockProjects, projectCategoryLabel, projectStatusBadgeClass, projectStatusLabel } from '../data/mockProjects';
import { mockResources } from '../data/mockResources';
import { cn } from '../lib/utils';

type PlaceholderPageProps = {
  title: string;
};

function PlaceholderPage({ title }: PlaceholderPageProps) {
  const location = useLocation();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-wide text-teal-700">Pantalla placeholder Fase 1</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm text-slate-600">Ruta actual: {location.pathname}</p>
    </section>
  );
}

export function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="hidden w-1/2 flex-col justify-between bg-teal-800 p-10 text-white lg:flex">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-teal-200">ACASPEX</p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold leading-tight">Portal privado de socios</h2>
            <p className="text-sm leading-relaxed text-teal-100">
              ACASPEX impulsa una comunidad comprometida con la calidad asistencial y la seguridad del paciente. Este espacio reúne materiales, formación y herramientas para acompañar ese trabajo compartido.
            </p>
          </div>
          <div>
            <p className="text-xs text-teal-300">Asociación de Calidad Asistencial y Seguridad del Paciente</p>
          </div>
        </div>

        <div className="relative w-full p-8 sm:p-12 lg:w-1/2">
          <div className="mb-8 lg:hidden">
            <p className="text-sm font-medium uppercase tracking-wide text-teal-700">ACASPEX</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Portal privado de socios</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              ACASPEX impulsa una comunidad comprometida con la calidad asistencial y la seguridad del paciente.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Acceso socios</h1>
              <p className="mt-1 text-sm text-slate-500">Introduce tus datos para acceder al portal.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">
                  Correo electrónico
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="socio@ejemplo.com"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <Link
              to="/socios"
              className="block w-full rounded-full bg-teal-700 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-teal-800"
            >
              Entrar al portal
            </Link>

            <Link
              to="/admin"
              className="absolute bottom-3 right-3 rounded-full p-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
              title="Acceso administrador"
              aria-label="Acceso administrador"
            >
              <Settings size={16} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

const categoryLabel: Record<string, string> = {
  formacion: 'Formación',
  guias: 'Guías',
  herramientas: 'Herramientas',
  jornadas: 'Jornadas',
  plantillas: 'Plantillas',
  lean: 'Metodología Lean',
  actas: 'Actas',
  videos: 'Vídeos',
  corporativo: 'Corporativo',
  alianzas: 'Alianzas',
};

const typeLabel: Record<string, string> = {
  pdf: 'PDF',
  video: 'Vídeo',
  template: 'Plantilla',
  link: 'Enlace',
  presentation: 'Presentación',
};

const visualToneLabel: Record<string, string> = {
  formacion: 'Formación',
  lean: 'Metodología Lean',
  herramientas: 'Plantillas y herramientas',
  actas: 'Actas y documentos internos',
  videos: 'Vídeos y grabaciones',
  corporativo: 'Material corporativo',
  alianzas: 'Alianzas',
};

const visualToneOrder: string[] = [
  'formacion',
  'lean',
  'herramientas',
  'actas',
  'videos',
  'corporativo',
  'alianzas',
];

const statusBadgeClass: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  expired: 'bg-red-100 text-red-700',
  pending_review: 'bg-amber-100 text-amber-700',
  inactive: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-50 text-red-500',
};

const visualTonePatterns: Record<string, React.CSSProperties> = {
  formacion: {
    backgroundImage: 'radial-gradient(circle, rgba(37,99,235,0.10) 0.5px, transparent 0.5px)',
    backgroundSize: '8px 8px',
  },
  lean: {
    backgroundImage: 'radial-gradient(circle, rgba(4,120,87,0.10) 0.5px, transparent 0.5px)',
    backgroundSize: '8px 8px',
  },
  herramientas: {
    backgroundImage: 'radial-gradient(circle, rgba(13,148,136,0.10) 0.5px, transparent 0.5px)',
    backgroundSize: '8px 8px',
  },
  actas: {
    backgroundImage: 'radial-gradient(circle, rgba(180,83,9,0.10) 0.5px, transparent 0.5px)',
    backgroundSize: '8px 8px',
  },
  videos: {
    backgroundImage: 'radial-gradient(circle, rgba(109,40,217,0.10) 0.5px, transparent 0.5px)',
    backgroundSize: '8px 8px',
  },
  corporativo: {
    backgroundImage: 'radial-gradient(circle, rgba(51,65,85,0.10) 0.5px, transparent 0.5px)',
    backgroundSize: '8px 8px',
  },
  alianzas: {
    backgroundImage: 'radial-gradient(circle, rgba(190,18,60,0.10) 0.5px, transparent 0.5px)',
    backgroundSize: '8px 8px',
  },
};

const visualToneConfig: Record<
  string,
  { color: string; bg: string; icon: React.ComponentType<{ size?: number | string; className?: string }>; label: string }
> = {
  formacion: { color: 'text-blue-700', bg: 'bg-blue-50', icon: GraduationCap, label: 'Formación' },
  lean: { color: 'text-emerald-700', bg: 'bg-emerald-50', icon: TrendingUp, label: 'Metodología Lean' },
  herramientas: { color: 'text-teal-700', bg: 'bg-teal-50', icon: Wrench, label: 'Herramientas' },
  actas: { color: 'text-amber-700', bg: 'bg-amber-50', icon: ClipboardList, label: 'Actas' },
  videos: { color: 'text-violet-700', bg: 'bg-violet-50', icon: Video, label: 'Vídeos y grabaciones' },
  corporativo: { color: 'text-slate-700', bg: 'bg-slate-100', icon: Building2, label: 'Material corporativo' },
  alianzas: { color: 'text-rose-700', bg: 'bg-rose-50', icon: Handshake, label: 'Alianzas' },
};

type ResourceCardProps = {
  resource: (typeof mockResources)[number];
  showPreview?: boolean;
};

function ResourceCard({ resource, showPreview = true }: ResourceCardProps) {
  const tone = visualToneConfig[resource.visualTone] ?? visualToneConfig.corporativo;
  const pattern = visualTonePatterns[resource.visualTone] ?? visualTonePatterns.corporativo;
  const ToneIcon = tone.icon;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {showPreview && (
        <div className="relative aspect-video overflow-hidden">
          {resource.coverImageUrl ? (
            <img
              src={resource.coverImageUrl}
              alt={resource.coverAlt ?? resource.title}
              className="h-full w-full rounded-t-xl object-cover"
            />
          ) : (
            <div className={`flex h-full w-full flex-col items-center justify-center ${tone.bg}`} style={pattern}>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-white/60`}>
                <ToneIcon size={24} className={tone.color} />
              </div>
              <span className={`mt-2 text-xs font-medium ${tone.color}`}>{tone.label}</span>
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col gap-1.5 p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
            {categoryLabel[resource.category] ?? resource.category}
          </span>
          {resource.type && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <FileText size={12} />
              {typeLabel[resource.type] ?? resource.type}
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold text-slate-900">{resource.title}</h3>
        <p className="text-sm text-slate-600">{resource.subtitle}</p>
        {resource.fileLabel && (
          <p className="text-xs text-slate-500">{resource.fileLabel}</p>
        )}
        <div className="mt-3 border-t border-slate-100 pt-3">
          <Link
            to={`/socios/recursos/${resource.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            Ver recurso
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function MemberHomePage() {
  const member = mockMembers.find((m) => m.id === 'mem-001');
  const publishedResources = mockResources
    .filter((r) => r.status === 'published' && r.publishedAt !== null)
    .sort((a, b) => (b.publishedAt!).localeCompare(a.publishedAt!))
    .slice(0, 3);

  if (!member) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-slate-600">Socio no encontrado.</p>
      </section>
    );
  }

  const badgeClass = statusBadgeClass[member.status] ?? 'bg-slate-100 text-slate-600';
  const statusLabel = member.status === 'pending_review'
    ? 'Pendiente revisión'
    : member.status.charAt(0).toUpperCase() + member.status.slice(1);

  return (
    <div className="space-y-10">
      {/* Section 1 — Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-800 to-teal-700 p-8 text-white shadow-md sm:p-10 lg:p-12">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-teal-200">ACASPEX</p>
          <p className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">Hola, {member.firstName}</p>
          <h1 className="mt-2 text-xl font-light leading-relaxed text-teal-100 sm:text-2xl">
            Bienvenida al área de socios
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-teal-100">
            Tu espacio privado con recursos, formación y herramientas para impulsar la calidad asistencial y la seguridad del paciente.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
              {statusLabel}
            </span>
            <span className="text-xs text-teal-200">
              Membresía {member.membershipType === 'general' ? 'general' : 'reducida'} · Vence{' '}
              {member.paidUntil ? member.paidUntil.split('-').reverse().join('/') : '—'}
            </span>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-8 h-56 w-56 rounded-full bg-teal-600/20" />
        <div className="pointer-events-none absolute -bottom-10 right-20 h-40 w-40 rounded-full bg-teal-600/15" />
      </section>

      {/* Dashboard de socio — banda compacta */}
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:gap-x-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
              <ShieldCheck size={18} className="text-emerald-700" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Estado</p>
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50">
              <User size={18} className="text-teal-700" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Cuota</p>
              <p className="text-sm font-medium text-slate-900">
                {member.membershipType === 'general' ? 'General' : 'Reducida'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50">
              <CalendarCheck size={18} className="text-teal-700" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Válido hasta</p>
              <p className="text-sm font-medium text-slate-900">
                {member.paidUntil ? member.paidUntil.split('-').reverse().join('/') : '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50">
              <CreditCard size={18} className="text-teal-700" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Último pago</p>
              <p className="text-sm font-medium text-slate-900">
                {member.lastPaymentAmount !== null && member.lastPaymentDate !== null
                  ? `${member.lastPaymentAmount} € · ${member.lastPaymentDate.split('-').reverse().join('/')}`
                  : '—'}
              </p>
            </div>
          </div>

          <Link
            to="/socios/mi-cuenta"
            className="ml-auto flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
          >
            Mi cuenta
          </Link>
        </div>
      </section>

      {/* Section 2 — Qué encontrarás aquí */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900">Qué encontrarás aquí</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/socios/recursos"
            className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-teal-300 hover:shadow-sm"
          >
            <BookOpen size={24} className="text-teal-700" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900 group-hover:text-teal-800">Centro de conocimiento</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">Guías, plantillas y materiales validados por ACASPEX.</p>
          </Link>
          <Link
            to="/socios/recursos"
            className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-teal-300 hover:shadow-sm"
          >
            <Video size={24} className="text-teal-700" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900 group-hover:text-teal-800">Formación y metodología</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">Grabaciones, presentaciones y contenidos formativos para socios.</p>
          </Link>
          <Link
            to="/socios/recursos"
            className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-teal-300 hover:shadow-sm"
          >
            <FileText size={24} className="text-teal-700" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900 group-hover:text-teal-800">Materiales corporativos</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">Documentos institucionales, modelos y recursos de representación.</p>
          </Link>
          <Link
            to="/socios/proyectos"
            className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-teal-300 hover:shadow-sm"
          >
            <FolderKanban size={24} className="text-teal-700" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900 group-hover:text-teal-800">Banco de proyectos</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">Repositorio de iniciativas, casos prácticos y proyectos de mejora compartidos por la comunidad ACASPEX.</p>
          </Link>
        </div>
      </section>

      {/* Section 3 — Recursos destacados */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recursos destacados</h2>
            <p className="mt-1 text-sm text-slate-600">Últimos materiales publicados para la comunidad ACASPEX.</p>
          </div>
          <Link
            to="/socios/recursos"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800 sm:inline-flex"
          >
            Ver centro de conocimiento
            <ChevronRight size={14} />
          </Link>
        </div>

        {publishedResources.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-600">
              Aún no hay recursos publicados. Próximamente encontrarás aquí materiales para socios.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {publishedResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}

        <div className="mt-5 sm:hidden">
          <Link
            to="/socios/recursos"
            className="inline-flex items-center gap-1 rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Ver centro de conocimiento completo
            <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Section 4 — Banco de proyectos */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <FolderKanban size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Banco de proyectos</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Repositorio de iniciativas, casos prácticos y proyectos de mejora compartidos por la comunidad ACASPEX. Convierte el conocimiento de la sociedad en aprendizaje reutilizable.
            </p>
            <div className="mt-4">
              <Link
                to="/socios/proyectos"
                className="inline-flex items-center gap-1 rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
              >
                Explorar banco de proyectos
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 — Comunidad ACASPEX */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <Users size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Comunidad ACASPEX</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Forma parte activa de la comunidad ACASPEX. Conecta con otros socios, comparte experiencias y accede a canales exclusivos de comunicación.
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Canales</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://wa.me/0"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50/70 px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:border-teal-400 hover:bg-teal-100"
                >
                  <MessageCircle size={14} />
                  Grupo de socios
                </a>
                <a
                  href="https://www.linkedin.com/company/acaspex"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50/70 px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:border-teal-400 hover:bg-teal-100"
                >
                  <Globe size={14} />
                  ACASPEX en LinkedIn
                </a>
                <a
                  href="mailto:contacto@acaspex.org"
                  className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50/70 px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:border-teal-400 hover:bg-teal-100"
                >
                  <Mail size={14} />
                  contacto@acaspex.org
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 — Mensaje institucional ACASPEX */}
      <section className="rounded-2xl border border-teal-100 bg-teal-50/50 p-6 sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">ACASPEX</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          ACASPEX impulsa una comunidad comprometida con la calidad asistencial y la seguridad del paciente. Este espacio reúne materiales, formación y herramientas para acompañar ese trabajo compartido.
        </p>
      </section>
    </div>
  );
}

export function MemberLibraryPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const publishedResources = mockResources
    .filter((r) => r.status === 'published' && r.id !== 'res-004')
    .sort((a, b) => (b.publishedAt!).localeCompare(a.publishedAt!));

  const featuredResources = publishedResources.filter((r) => r.featured === true);

  const sectionCounts: Record<string, number> = {};
  for (const tone of visualToneOrder) {
    sectionCounts[tone] = publishedResources.filter((r) => r.visualTone === tone).length;
  }

  const filteredResources = activeSection
    ? publishedResources.filter((r) => r.visualTone === activeSection)
    : publishedResources;

  const activeLabel = activeSection ? (visualToneLabel[activeSection] ?? activeSection) : null;
  const activeConfig = activeSection ? visualToneConfig[activeSection] : null;

  const sidebarButtonClass = (isActive: boolean) =>
    cn(
      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
      isActive
        ? 'bg-teal-50 text-teal-700'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
    );

  const mobileTabClass = (isActive: boolean) =>
    cn(
      'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
      isActive
        ? 'bg-teal-700 text-white'
        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
    );

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <BookOpen size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold text-slate-900">Centro de conocimiento ACASPEX</h1>
            <p className="mt-1 text-sm text-slate-600">
              Consulta guías, plantillas, grabaciones y materiales disponibles para socios.
            </p>
          </div>
        </div>
      </section>

      {featuredResources.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Destacados</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </section>
      )}

      <div className="lg:flex lg:gap-8">
        <aside className="hidden lg:block lg:w-56 lg:shrink-0">
          <nav className="sticky top-8 space-y-0.5">
            <button
              type="button"
              onClick={() => setActiveSection(null)}
              className={sidebarButtonClass(activeSection === null)}
            >
              <BookOpen size={16} />
              <span className="flex-1">Todos los recursos</span>
              <span className="text-xs tabular-nums text-slate-400">
                {publishedResources.length}
              </span>
            </button>

            {visualToneOrder.map((tone) => {
              const config = visualToneConfig[tone];
              const Icon = config.icon;
              const count = sectionCounts[tone] ?? 0;
              const isActive = activeSection === tone;
              return (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setActiveSection(tone)}
                  className={sidebarButtonClass(isActive)}
                >
                  <Icon size={16} className={isActive ? 'text-teal-700' : 'text-slate-400'} />
                  <span className="flex-1">{config.label}</span>
                  {count > 0 && (
                    <span className="text-xs tabular-nums text-slate-400">{count}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 lg:hidden">
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2">
              <button
                type="button"
                onClick={() => setActiveSection(null)}
                className={mobileTabClass(activeSection === null)}
              >
                Todos
              </button>
              {visualToneOrder.map((tone) => {
                const config = visualToneConfig[tone];
                const isActive = activeSection === tone;
                return (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setActiveSection(tone)}
                    className={mobileTabClass(isActive)}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeSection ? (
            <section className="space-y-4">
              {activeConfig && (
                <div className="flex items-center gap-2.5">
                  {(() => {
                    const Icon = activeConfig.icon;
                    return <Icon size={20} className="text-teal-700" />;
                  })()}
                  <h2 className="text-lg font-semibold text-slate-900">{activeLabel}</h2>
                </div>
              )}
              {filteredResources.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm text-slate-600">Próximamente: {activeLabel}</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              )}
            </section>
          ) : (
            <div className="space-y-8">
              {visualToneOrder.map((tone) => {
                const config = visualToneConfig[tone];
                const Icon = config.icon;
                const sectionResources = publishedResources.filter((r) => r.visualTone === tone);
                return (
                  <section key={tone} className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <Icon size={20} className="text-teal-700" />
                      <h2 className="text-lg font-semibold text-slate-900">{config.label}</h2>
                    </div>
                    {sectionResources.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-slate-600">Próximamente: {config.label}</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {sectionResources.map((resource) => (
                          <ResourceCard key={resource.id} resource={resource} />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MemberResourceDetailPage() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const resource = mockResources.find((r) => r.id === resourceId);
  const isAvailable = resource && resource.status === 'published';

  if (!isAvailable) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-slate-900">Recurso no disponible</h1>
          <p className="text-sm text-slate-600">
            Este recurso no existe o todavía no está publicado.
          </p>
          <Link
            to="/socios/recursos"
            className="inline-flex items-center gap-1 rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Volver al centro de conocimiento
          </Link>
        </div>
      </section>
    );
  }

  const resourceItem = resource!;

  return (
    <div className="space-y-8">
      <Link
        to="/socios/recursos"
        className="text-sm font-medium text-teal-700 hover:text-teal-800"
      >
        Volver al centro de conocimiento
      </Link>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {resourceItem.coverImageUrl ? (
          <div className="aspect-video overflow-hidden">
            <img
              src={resourceItem.coverImageUrl}
              alt={resourceItem.coverAlt ?? resourceItem.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          (() => {
            const tone = visualToneConfig[resourceItem.visualTone] ?? visualToneConfig.corporativo;
            const pattern = visualTonePatterns[resourceItem.visualTone] ?? visualTonePatterns.corporativo;
            const ToneIcon = tone.icon;
            return (
              <div className={`flex aspect-video w-full flex-col items-center justify-center ${tone.bg}`} style={pattern}>
                <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-white/60`}>
                  <ToneIcon size={32} className={tone.color} />
                </div>
                <span className={`mt-3 text-sm font-medium ${tone.color}`}>{tone.label}</span>
              </div>
            );
          })()
        )}
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-slate-900">{resourceItem.title}</h1>
          <p className="mt-1 text-slate-600">{resourceItem.subtitle}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-medium text-slate-900">Categoría:</span>{' '}
            {categoryLabel[resourceItem.category] ?? resourceItem.category}
          </p>
          <p>
            <span className="font-medium text-slate-900">Tipo:</span>{' '}
            {typeLabel[resourceItem.type] ?? resourceItem.type}
          </p>
          <p>
            <span className="font-medium text-slate-900">Publicado:</span>{' '}
            {resourceItem.publishedAt
              ? resourceItem.publishedAt.split('-').reverse().join('/')
              : 'No publicado'}
          </p>
          {resourceItem.estimatedReadMinutes !== null && (
            <p>
              <span className="font-medium text-slate-900">Tiempo estimado:</span>{' '}
              {resourceItem.estimatedReadMinutes} min
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Descripción</h2>
        <p className="mt-2 text-sm text-slate-700">{resourceItem.description}</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {resourceItem.externalUrl ? (
          <a
            href={resourceItem.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Abrir recurso externo
          </a>
        ) : resourceItem.fileLabel ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Acceder al recurso
          </button>
        ) : null}
      </section>
    </div>
  );
}

export function MemberAccountPage() {
  const member = mockMembers.find((m) => m.id === 'mem-001');

  if (!member) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Socio no encontrado.</p>
      </section>
    );
  }

  const badgeClass = statusBadgeClass[member.status] ?? 'bg-slate-100 text-slate-600';
  const statusLabel = member.status === 'pending_review'
    ? 'Pendiente revisión'
    : member.status.charAt(0).toUpperCase() + member.status.slice(1);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Mi cuenta</h1>
        <p className="mt-1 text-sm text-slate-600">
          Consulta el estado de tu membresía y los datos asociados a tu perfil de socio.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <User size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Datos personales</h2>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p><span className="font-medium text-slate-900">Nombre completo:</span> {member.firstName} {member.lastName1} {member.lastName2}</p>
              <p><span className="font-medium text-slate-900">Email:</span> {member.email}</p>
              <p><span className="font-medium text-slate-900">Teléfono:</span> {member.phone}</p>
              <p><span className="font-medium text-slate-900">Categoría profesional:</span> {member.professionalCategory}</p>
              <p><span className="font-medium text-slate-900">Puesto:</span> {member.jobTitle}</p>
              <p><span className="font-medium text-slate-900">Organización:</span> {member.organization}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <CalendarCheck size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Estado de membresía</h2>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p>
                <span className="font-medium text-slate-900">Estado:</span>{' '}
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>
                  {statusLabel}
                </span>
              </p>
              <p><span className="font-medium text-slate-900">Tipo de cuota:</span> {member.membershipType === 'general' ? 'General' : 'Reducida'}</p>
              <p><span className="font-medium text-slate-900">Válido hasta:</span> {member.paidUntil ? member.paidUntil.split('-').reverse().join('/') : '—'}</p>
              <p><span className="font-medium text-slate-900">Último pago:</span> {member.lastPaymentAmount !== null ? `${member.lastPaymentAmount} euros` : '—'}</p>
              <p><span className="font-medium text-slate-900">Fecha último pago:</span> {member.lastPaymentDate ? member.lastPaymentDate.split('-').reverse().join('/') : '—'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">Consentimiento comunicaciones</h2>
        <p className="mt-2 text-sm text-slate-700">
          Comunicaciones: {member.communicationConsent ? 'Activadas' : 'No activadas'}
        </p>
      </section>

      <section className="rounded-2xl border border-teal-100 bg-teal-50/50 p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Esta pantalla utiliza datos ficticios de prototipo. La gestión real de datos, pagos y renovaciones se definirá en una fase posterior.
        </p>
      </section>
    </div>
  );
}

export function MemberProjectBankPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const projects = mockProjects;

  const categoryCounts: Record<string, number> = {};
  for (const p of projects) {
    categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
  }

  const filteredProjects = activeCategory
    ? projects.filter((p) => p.category === activeCategory)
    : projects;

  const sidebarButtonClass = (isActive: boolean) =>
    cn(
      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
      isActive
        ? 'bg-teal-50 text-teal-700'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
    );

  const mobileTabClass = (isActive: boolean) =>
    cn(
      'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
      isActive
        ? 'bg-teal-700 text-white'
        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
    );

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <FolderKanban size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold text-slate-900">Banco de proyectos</h1>
            <p className="mt-1 text-sm text-slate-600">
              Repositorio de iniciativas, casos prácticos y proyectos de mejora compartidos por la comunidad ACASPEX.
            </p>
          </div>
        </div>
      </section>

      <div className="lg:flex lg:gap-8">
        <aside className="hidden lg:block lg:w-56 lg:shrink-0">
          <nav className="sticky top-8 space-y-0.5">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={sidebarButtonClass(activeCategory === null)}
            >
              <FolderKanban size={16} />
              <span className="flex-1">Todos los proyectos</span>
              <span className="text-xs tabular-nums text-slate-400">
                {projects.length}
              </span>
            </button>

            {Object.entries(projectCategoryLabel).map(([key, label]) => {
              const count = categoryCounts[key] ?? 0;
              const isActive = activeCategory === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveCategory(key)}
                  className={sidebarButtonClass(isActive)}
                >
                  <Lightbulb size={16} className={isActive ? 'text-teal-700' : 'text-slate-400'} />
                  <span className="flex-1">{label}</span>
                  {count > 0 && (
                    <span className="text-xs tabular-nums text-slate-400">{count}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 lg:hidden">
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={mobileTabClass(activeCategory === null)}
              >
                Todos
              </button>
              {Object.entries(projectCategoryLabel).map(([key, label]) => {
                const isActive = activeCategory === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveCategory(key)}
                    className={mobileTabClass(isActive)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-600">
                Próximamente: proyectos en esta categoría.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => {
                const statusBadge = projectStatusBadgeClass[project.status] ?? 'bg-slate-100 text-slate-600';
                const statusText = projectStatusLabel[project.status] ?? project.status;
                const categoryText = projectCategoryLabel[project.category] ?? project.category;

                return (
                  <article
                    key={project.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <span className="inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                        {categoryText}
                      </span>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge}`}>
                        {statusText}
                      </span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-slate-900">{project.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{project.scope} · {project.organization}</p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">{project.summary}</p>
                    <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-teal-700">Aprendizaje transferible</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-700">{project.transferableLearning}</p>
                    </div>
                    {project.associatedMaterial && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-teal-700">
                        <FileText size={12} />
                        <span>Material asociado: {project.associatedMaterial}</span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  return <PlaceholderPage title="Panel admin" />;
}

export function AdminMembersPage() {
  return <PlaceholderPage title="Socios" />;
}

export function AdminMemberDetailPage() {
  const params = useParams();
  return <PlaceholderPage title={`Ficha socio ${params.memberId ?? ''}`.trim()} />;
}

export function AdminResourcesPage() {
  return <PlaceholderPage title="Recursos" />;
}

export function AdminResourceEditorPage() {
  const params = useParams();
  return <PlaceholderPage title={`Editar recurso ${params.resourceId ?? ''}`.trim()} />;
}

export function AdminRenewalsPage() {
  return <PlaceholderPage title="Renovaciones" />;
}
