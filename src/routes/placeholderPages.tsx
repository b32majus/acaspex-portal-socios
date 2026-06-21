import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  FolderKanban,
  Globe,
  GraduationCap,
  Handshake,
  Heart,
  IdCard,
  Lightbulb,
  Mail,
  MessageCircle,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  User,
  Users,
  Video,
  Wrench,
} from 'lucide-react';
import { mockMembers, mockSocioDashboard } from '../data/mockMembers';
import { mockProjects, projectCategoryLabel, projectStatusBadgeClass, projectStatusLabel, type ProjectCategory } from '../data/mockProjects';
import { mockResources } from '../data/mockResources';
import { mockNews } from '../data/mockNews';
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
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-[2fr_3fr]">
      {/* Panel izquierdo — teal oscuro */}
      <div className="relative hidden flex-col justify-between bg-teal-900 p-10 lg:p-16 text-white overflow-hidden lg:flex">
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-teal-800/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-teal-800/30 to-transparent" />

        <div className="relative z-10">
          <h2 className="font-serif text-3xl lg:text-4xl font-light tracking-tight">ACASPEX</h2>
          <p className="mt-2 text-sm text-teal-100/80">Asociación de Calidad Asistencial y Seguridad del Paciente</p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="w-16 h-px bg-teal-400/60" />
          <h3 className="font-serif text-2xl lg:text-3xl font-light leading-tight">
            Excelencia que se comparte.<br />Seguridad que nos une.
          </h3>
        </div>

        <p className="relative z-10 text-xs text-teal-200/70">
          Calidad asistencial · Seguridad del paciente · Comunidad profesional
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="relative flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl font-light text-slate-900">Acceso socios</h1>
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
                placeholder="Correo electrónico"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="Contraseña"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <Link
            to="/socios"
            className="block w-full rounded-lg bg-teal-900 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-teal-800"
          >
            Acceder al portal
          </Link>

          <Link
            to="/admin"
            className="absolute bottom-4 right-4 rounded-full p-2 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
            title="Acceso administrador"
            aria-label="Acceso administrador"
          >
            <Settings size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}

const categoryLabel: Record<string, string> = {
  calidad: 'Calidad asistencial',
  seguridad: 'Seguridad del paciente',
  investigacion: 'Investigación',
  formacion: 'Formación',
  herramientas: 'Herramientas',
  corporativo: 'Material corporativo',
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

const typeIconMap: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
  pdf: FileText,
  video: Video,
  template: ClipboardList,
  link: Globe,
  presentation: BookOpen,
};

type MockCoverProps = {
  resource: (typeof mockResources)[number];
};

function MockCover({ resource }: MockCoverProps) {
  const { coverStyle, title, subtitle } = resource;

  if (coverStyle === 'guia') {
    return (
      <div className="relative h-full w-full bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-50">
        <div className="absolute left-0 top-0 h-full w-1.5 bg-amber-600/80" />
        <div className="absolute left-3 top-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-700/70">
          Guía
        </div>
        <div className="flex h-full flex-col justify-center px-7 py-6">
          <h4 className="font-serif text-sm font-medium leading-snug text-slate-800">
            {title}
          </h4>
          <div className="mt-3 h-px w-10 bg-amber-400/60" />
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500 line-clamp-2">
            {subtitle}
          </p>
        </div>
        <div className="absolute bottom-0 right-0 h-12 w-12 rounded-tl-2xl bg-amber-100/40" />
      </div>
    );
  }

  if (coverStyle === 'plantilla') {
    return (
      <div className="relative h-full w-full bg-white">
        <div className="absolute right-0 top-0 h-full w-[38%] bg-slate-50" />
        <div className="relative z-10 flex h-full flex-col justify-between p-5">
          <div>
            <div className="mb-3 h-1.5 w-14 rounded-full bg-blue-400/70" />
            <div className="space-y-1.5">
              <div className="h-1.5 w-full rounded bg-slate-100" />
              <div className="h-1.5 w-4/5 rounded bg-slate-100" />
              <div className="h-1.5 w-3/5 rounded bg-slate-100" />
            </div>
            <div className="mt-3 flex gap-1.5">
              <div className="h-3.5 w-16 rounded border border-slate-200 bg-white" />
              <div className="h-3.5 w-12 rounded border border-slate-200 bg-white" />
              <div className="h-3.5 w-10 rounded border border-slate-200 bg-white" />
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="h-1.5 w-3/4 rounded bg-slate-100" />
              <div className="h-1.5 w-1/2 rounded bg-slate-100" />
            </div>
          </div>
          <div>
            <p className="mb-2 text-[9px] font-medium uppercase tracking-wider text-blue-500/70">Plantilla</p>
            <p className="text-[10px] leading-tight text-slate-500 line-clamp-2">
              {title}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (coverStyle === 'video') {
    return (
      <div className="relative h-full w-full bg-gradient-to-br from-violet-900 via-slate-900 to-indigo-950">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-2xl" />
        </div>
        <div className="absolute left-0 right-0 top-0 h-1 bg-violet-500/40" />
        <div className="flex h-full flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-1 ring-white/10">
            <div className="ml-0.5 h-0 w-0 border-b-[7px] border-l-[12px] border-t-[7px] border-b-transparent border-l-white border-t-transparent" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 pb-4 pt-8">
          <p className="text-[11px] font-medium leading-snug text-white">{title}</p>
          <div className="mt-1.5 flex items-center gap-2 text-[9px] text-white/50">
            <span>HD</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>Vídeo</span>
          </div>
        </div>
        <div className="absolute right-3 top-3 rounded bg-black/30 px-1.5 py-0.5 text-[9px] text-white/70">
          ACASPEX
        </div>
      </div>
    );
  }

  if (coverStyle === 'documento') {
    return (
      <div className="relative h-full w-full bg-white">
        <div className="h-6 bg-teal-900 flex items-center px-3">
          <span className="text-[9px] font-medium uppercase tracking-wider text-teal-100/80">PDF</span>
          <span className="ml-auto text-[8px] text-teal-200/60">ACASPEX</span>
        </div>
        <div className="flex flex-col px-5 py-4">
          <h4 className="font-serif text-sm font-medium leading-snug text-slate-800">
            {title}
          </h4>
          <div className="mt-3 space-y-1.5">
            <div className="h-1 w-full rounded bg-slate-100" />
            <div className="h-1 w-full rounded bg-slate-100" />
            <div className="h-1 w-4/5 rounded bg-slate-100" />
            <div className="h-1 w-full rounded bg-slate-100" />
            <div className="h-1 w-3/5 rounded bg-slate-100" />
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-1 w-full rounded bg-slate-100" />
            <div className="h-1 w-2/3 rounded bg-slate-100" />
          </div>
        </div>
        <div className="absolute bottom-3 right-4 text-[9px] text-slate-300">
          {subtitle.length > 2 ? subtitle.slice(0, 40) + '…' : subtitle}
        </div>
      </div>
    );
  }

  if (coverStyle === 'corporativo') {
    return (
      <div className="relative h-full w-full bg-teal-900 overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-teal-700/30 blur-xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-teal-950/40 to-transparent" />
        <div className="flex h-full flex-col justify-between p-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-teal-300/70">
              ACASPEX
            </p>
            <div className="mt-1.5 h-px w-12 bg-teal-400/40" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-medium leading-snug text-white">
              {title}
            </h4>
            <p className="mt-2 text-[10px] leading-relaxed text-teal-200/70 line-clamp-2">
              {subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 flex-1 bg-teal-600/50" />
            <span className="text-[9px] text-teal-300/50">Material corporativo</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <FileText size={24} className="text-slate-400" />
    </div>
  );
}

type ResourceCardProps = {
  resource: (typeof mockResources)[number];
  showPreview?: boolean;
};

function ResourceCard({ resource, showPreview = true }: ResourceCardProps) {
  const TypeIcon = typeIconMap[resource.type] ?? FileText;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {showPreview && (
        <div className="relative aspect-[16/10] overflow-hidden">
          <MockCover resource={resource} />
        </div>
      )}
      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
            {categoryLabel[resource.category] ?? resource.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <TypeIcon size={12} />
            {typeLabel[resource.type] ?? resource.type}
          </span>
        </div>
        <h3 className="font-serif text-base font-medium leading-snug text-slate-900">
          {resource.title}
        </h3>
        <p className="text-xs leading-relaxed text-slate-600 line-clamp-2">
          {resource.subtitle}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400">
            {resource.publishedAt
              ? resource.publishedAt.split('-').reverse().join('/')
              : '—'}
          </span>
          <span className="inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-medium text-teal-700">
            Socios
          </span>
        </div>
        <div className="pt-1">
          <Link
            to={`/socios/recursos/${resource.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-teal-800"
          >
            Ver recurso
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}

const NEWS_TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ size?: number | string; className?: string }>; label: string }> = {
  resource: { icon: FileText, label: 'Nuevo recurso' },
  recording: { icon: Video, label: 'Nueva grabación' },
  update: { icon: RefreshCw, label: 'Actualización' },
  project: { icon: FolderKanban, label: 'Proyecto destacado' },
  publication: { icon: BookOpen, label: 'Publicación' },
};

function formatNewsDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date('2026-06-21');
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays <= 7) return `Hace ${diffDays} días`;
  if (diffDays <= 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${date.getDate()} de ${months[date.getMonth()]}, ${date.getFullYear()}`;
}

export function MemberHomePage() {
  const member = mockMembers.find((m) => m.id === 'mem-001');
  const dashboard = mockSocioDashboard;

  if (!member) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-slate-600">Socio no encontrado.</p>
      </section>
    );
  }

  const badgeClass = statusBadgeClass[dashboard.status] ?? 'bg-slate-100 text-slate-600';

  return (
    <div className="space-y-10">
      {/* 1. Hero / bienvenida */}
      <section className="relative overflow-hidden rounded-2xl bg-teal-900 p-8 text-white sm:p-10 lg:p-12">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest text-teal-200/80">Área de socios</p>
          <p className="mt-4 font-serif text-4xl lg:text-5xl font-light text-white">Hola, {member.firstName}</p>
          <h1 className="mt-2 text-lg lg:text-xl font-light text-teal-100">
            Socia ACASPEX n.º {dashboard.memberNumber}
          </h1>
          <p className="mt-4 max-w-xl text-sm text-teal-100/80">
            Tu espacio privado con recursos, formación y herramientas para impulsar la calidad asistencial y la seguridad del paciente.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-8 h-56 w-56 rounded-full bg-teal-800/20 blur-2xl" />
      </section>

      {/* 2. Dashboard de socio — banda de indicadores */}
      <section className="rounded-2xl border border-slate-100 bg-white px-6 py-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Estado</p>
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
                {dashboard.statusLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <User size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Cuota</p>
              <p className="text-sm font-medium text-slate-900">{dashboard.membershipTypeLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <CalendarCheck size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Vigencia</p>
              <p className="text-sm font-medium text-slate-900">Válido hasta {dashboard.validUntil}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <CreditCard size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Último pago</p>
              <p className="text-sm font-medium text-slate-900">{dashboard.lastPayment}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <RefreshCw size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Próx. renovación</p>
              <p className="text-sm font-medium text-slate-900">{dashboard.nextRenewal}</p>
            </div>
          </div>

          <Link
            to="/socios/mi-cuenta"
            className="ml-auto inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-teal-800"
          >
            Ver mi perfil
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen size={15} className="text-teal-600" />
              <span className="font-medium text-slate-900">{dashboard.resourcesAvailable}</span> recursos disponibles
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileText size={15} className="text-teal-600" />
              <span className="font-medium text-slate-900">{dashboard.newsThisMonth}</span> novedades del mes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Video size={15} className="text-teal-600" />
              <span className="font-medium text-slate-900">{dashboard.recentTraining}</span> webinars este mes
            </span>
          </div>
        </div>
      </section>

      {/* 3. Novedades del mes */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8">
        {/* Phase 1: Novedades stays a Home module. No /novedades route per WO-043. */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl text-slate-900">Novedades del mes</h2>
            <p className="mt-1 text-sm text-slate-500">Actividad reciente en el portal de socios</p>
          </div>
          <Link
            to="/socios/recursos"
            className="hidden text-sm font-medium text-teal-700 transition-colors hover:text-teal-800 sm:block"
          >
            Ir al Centro de Conocimiento
          </Link>
        </div>
        <div className="mt-6 divide-y divide-slate-100">
          {mockNews.slice(0, 5).map((item) => {
            const config = NEWS_TYPE_CONFIG[item.type] ?? { icon: FileText, label: item.type };
            const Icon = config.icon;
            return (
              <Link
                key={item.id}
                to={item.linkTo}
                className="flex items-start gap-4 px-1 py-3.5 transition-colors hover:bg-slate-50 first:pt-0 last:pb-0"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                  <Icon size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-teal-600">
                      {config.label}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatNewsDate(item.date)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-700">{item.title}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-4 sm:hidden">
          <Link
            to="/socios/recursos"
            className="text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
          >
            Ir al Centro de Conocimiento
          </Link>
        </div>
      </section>

      {/* 4. Centro de Conocimiento — módulo destacado */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest text-teal-600">Módulo destacado</p>
          <h2 className="mt-3 font-serif text-2xl lg:text-3xl font-light text-slate-900">Centro de Conocimiento ACASPEX</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 max-w-lg">
            Una biblioteca profesional con guías, plantillas, grabaciones y materiales validados para socios. Documentos revisados, formación estructurada y recursos prácticos para aplicar en tu entorno asistencial.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/socios/recursos"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800"
            >
              Entrar al Centro de Conocimiento
              <ChevronRight size={15} />
            </Link>
            <Link
              to="/socios/recursos"
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <BookOpen size={15} />
              Explorar recursos
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-8 hidden h-40 w-40 rounded-full bg-teal-50/60 blur-xl lg:block" />
        <div className="pointer-events-none absolute bottom-0 right-0 hidden h-24 w-24 rounded-full bg-amber-50/50 blur-lg lg:block" />
      </section>

      {/* 5. Academia ACASPEX */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <GraduationCap size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-xl text-slate-900">Academia ACASPEX</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Espacio de formación y desarrollo profesional para socios. Próximamente: grabaciones de sesiones clínicas, presentaciones de jornadas, materiales complementarios de estudio y certificados de participación.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                <Video size={12} />
                Grabaciones
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                <BookOpen size={12} />
                Presentaciones
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                <FileText size={12} />
                Materiales complementarios
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                <ShieldCheck size={12} />
                Certificados
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Banco de Proyectos — acceso secundario editorial */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <FolderKanban size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="font-serif text-xl text-slate-900">Banco de Proyectos</h2>
              <p className="mt-2 text-sm text-slate-600">
                Iniciativas, casos prácticos y proyectos de mejora compartidos por la comunidad ACASPEX.
              </p>
            </div>
          </div>
          <Link
            to="/socios/proyectos"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 sm:mt-0"
          >
            Explorar proyectos
            <ChevronRight size={14} />
          </Link>
        </div>
      </section>

      {/* 7. Comunidad — enlaces institucionales sobrios */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8">
        <h2 className="font-serif text-lg text-slate-900">Comunidad ACASPEX</h2>
        <p className="mt-1 text-sm text-slate-500">Conecta con otros socios y accede a canales de comunicación.</p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <a
            href="mailto:contacto@acaspex.org"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-teal-700"
          >
            <Mail size={14} />
            contacto@acaspex.org
          </a>
          <a
            href="https://www.linkedin.com/company/acaspex"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-teal-700"
          >
            <Globe size={14} />
            LinkedIn ACASPEX
          </a>
          <a
            href="https://wa.me/0"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-teal-700"
          >
            <MessageCircle size={14} />
            Grupo de socios
          </a>
        </div>
      </section>
    </div>
  );
}

export function MemberLibraryPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const publishedResources = mockResources
    .filter((r) => r.status === 'published' && r.id !== 'res-004')
    .sort((a, b) => (b.publishedAt!).localeCompare(a.publishedAt!));

  const featuredResources = publishedResources.filter((r) => r.featured === true);

  const officialCategoryOrder = ['calidad', 'seguridad', 'investigacion', 'formacion', 'herramientas', 'corporativo'];

  const categoryCounts: Record<string, number> = {};
  for (const cat of officialCategoryOrder) {
    categoryCounts[cat] = publishedResources.filter((r) => r.category === cat).length;
  }

  const filteredResources = activeCategory
    ? publishedResources.filter((r) => r.category === activeCategory)
    : publishedResources;

  const activeLabel = activeCategory ? (categoryLabel[activeCategory] ?? activeCategory) : null;

  const officialCategoryIcons: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
    calidad: TrendingUp,
    seguridad: ShieldCheck,
    investigacion: Lightbulb,
    formacion: GraduationCap,
    herramientas: Wrench,
    corporativo: Building2,
  };

  const sidebarButtonClass = (isActive: boolean) =>
    cn(
      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
      isActive
        ? 'bg-teal-900 text-white'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
    );

  const mobileTabClass = (isActive: boolean) =>
    cn(
      'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
      isActive
        ? 'bg-teal-900 text-white'
        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
    );

  return (
    <div className="lg:flex lg:gap-8">
      {/* Sidebar — visible solo en desktop */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        <nav className="sticky top-8 space-y-0.5 rounded-2xl border border-slate-100 bg-white p-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={sidebarButtonClass(activeCategory === null)}
          >
            <BookOpen size={16} />
            <span className="flex-1">Todos los recursos</span>
            <span className={cn('text-xs tabular-nums', activeCategory === null ? 'text-teal-200/70' : 'text-slate-400')}>
              {publishedResources.length}
            </span>
          </button>

          {officialCategoryOrder.map((cat) => {
            const Icon = officialCategoryIcons[cat];
            const count = categoryCounts[cat] ?? 0;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={sidebarButtonClass(isActive)}
              >
                <Icon size={16} className={isActive ? 'text-teal-200/70' : 'text-slate-400'} />
                <span className="flex-1">{categoryLabel[cat]}</span>
                {count > 0 && (
                  <span className={cn('text-xs tabular-nums', isActive ? 'text-teal-200/70' : 'text-slate-400')}>{count}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Contenido principal */}
      <div className="min-w-0 flex-1">
        {/* Píldoras móviles */}
        <div className="mb-5 lg:hidden">
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={mobileTabClass(activeCategory === null)}
            >
              Todos
            </button>
            {officialCategoryOrder.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={mobileTabClass(isActive)}
                >
                  {categoryLabel[cat]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cabecera institucional — solo en vista "Todos" */}
        {!activeCategory && (
          <section className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 lg:p-8">
            <h1 className="font-serif text-3xl lg:text-4xl font-light text-slate-900">Centro de Conocimiento ACASPEX</h1>
            <p className="mt-3 text-sm text-slate-600 max-w-2xl">
              Explora, descubre y accede a contenidos para impulsar la calidad asistencial y la seguridad del paciente
            </p>
            <div className="mt-5 relative max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar en el Centro de Conocimiento…"
                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                readOnly
              />
            </div>
          </section>
        )}

        {/* Cabecera de categoría activa */}
        {activeCategory && (
          <div className="mb-6">
            <h2 className="font-serif text-xl text-slate-900">{categoryLabel[activeCategory]}</h2>
            <p className="mt-1 text-sm text-slate-500">{categoryCounts[activeCategory] ?? 0} recursos</p>
          </div>
        )}

        {/* Destacados — solo en vista "Todos" */}
        {!activeCategory && featuredResources.length > 0 && (
          <section className="mb-8 space-y-5">
            <h2 className="font-serif text-xl text-slate-900">Destacados</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredResources.map((resource, index) => (
                <div key={resource.id} className={index === 0 ? 'lg:col-span-2' : ''}>
                  <ResourceCard resource={resource} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recursos filtrados / todos */}
        <section className="space-y-5">
          {!activeCategory && (
            <h2 className="font-serif text-xl text-slate-900">Todos los recursos</h2>
          )}
          {filteredResources.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-white p-5">
              <p className="text-sm text-slate-600">Próximamente: {activeLabel}</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </section>
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
  const TypeIcon = typeIconMap[resourceItem.type] ?? FileText;

  return (
    <div className="space-y-8">
      <Link
        to="/socios/recursos"
        className="text-sm font-medium text-teal-700 hover:text-teal-800"
      >
        Volver al centro de conocimiento
      </Link>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="aspect-[2/1] overflow-hidden">
          <MockCover resource={resourceItem} />
        </div>
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-slate-900">{resourceItem.title}</h1>
          <p className="mt-1 text-slate-600">{resourceItem.subtitle}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Categoría</p>
            <span className="mt-1 inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
              {categoryLabel[resourceItem.category] ?? resourceItem.category}
            </span>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Tipo</p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-700">
              <TypeIcon size={14} className="text-slate-400" />
              {typeLabel[resourceItem.type] ?? resourceItem.type}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Publicado</p>
            <p className="mt-1 text-sm text-slate-700">
              {resourceItem.publishedAt
                ? resourceItem.publishedAt.split('-').reverse().join('/')
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Acceso</p>
            <span className="mt-1 inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
              Socios
            </span>
          </div>
        </div>
        {resourceItem.estimatedReadMinutes !== null && (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-700">Tiempo estimado:</span>{' '}
              {resourceItem.estimatedReadMinutes} min
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Descripción</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{resourceItem.description}</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {resourceItem.externalUrl ? (
          <a
            href={resourceItem.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800"
          >
            Ver recurso
            <ChevronRight size={14} />
          </a>
        ) : (
          <Link
            to={`/socios/recursos/${resourceItem.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800"
          >
            Ver recurso
            <ChevronRight size={14} />
          </Link>
        )}
      </section>
    </div>
  );
}

export function MemberAccountPage() {
  const member = mockMembers.find((m) => m.id === 'mem-001');
  const dashboard = mockSocioDashboard;

  if (!member) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Socio no encontrado.</p>
      </section>
    );
  }

  const badgeClass = statusBadgeClass[dashboard.status] ?? 'bg-slate-100 text-slate-600';

  return (
    <div className="space-y-10">
      {/* Header editorial */}
      <section className="relative overflow-hidden rounded-2xl bg-teal-900 p-8 text-white sm:p-10 lg:p-12">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest text-teal-200/80">Área de socios</p>
          <h1 className="mt-4 font-serif text-4xl font-light text-white">Mi cuenta</h1>
          <p className="mt-2 text-lg font-light text-teal-100">
            Consulta el estado de tu membresía y los datos asociados a tu perfil de socio.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-8 h-56 w-56 rounded-full bg-teal-800/20 blur-2xl" />
      </section>

      {/* Credencial digital */}
      <section className="mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white shadow-sm">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-teal-100/40 blur-2xl" />
          <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white bg-teal-100 text-teal-700 shadow-sm">
              <User size={40} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-teal-800">ACASPEX</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>
                  {dashboard.statusLabel}
                </span>
              </div>
              <p className="mt-2 font-serif text-2xl font-medium text-slate-900">
                {member.firstName} {member.lastName1} {member.lastName2}
              </p>
              <div className="mt-3 grid gap-y-2 text-sm text-slate-700 sm:grid-cols-2">
                <p>
                  <span className="font-medium text-slate-900">N.º de socio:</span>{' '}
                  <span className="font-mono text-teal-800">{dashboard.memberNumber}</span>
                </p>
                <p>
                  <span className="font-medium text-slate-900">Tipo:</span>{' '}
                  {dashboard.membershipTypeLabel}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Vigencia:</span>{' '}
                  {dashboard.validUntil}
                </p>
              </div>
            </div>
            <div className="hidden shrink-0 text-teal-700/30 sm:block">
              <IdCard size={64} strokeWidth={1} />
            </div>
          </div>
          <div className="border-t border-teal-100 bg-teal-50/60 px-6 py-3 sm:px-8">
            <p className="text-xs text-teal-800/70">Credencial digital mock / pendiente de validación</p>
          </div>
        </div>
      </section>

      {/* Perfil + Membresía */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Perfil */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <User size={18} />
            </div>
            <h2 className="font-serif text-xl text-slate-900">Perfil</h2>
          </div>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Nombre completo</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{member.firstName} {member.lastName1} {member.lastName2}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Email</dt>
              <dd className="mt-0.5 text-slate-700">{member.email}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Teléfono</dt>
              <dd className="mt-0.5 text-slate-700">{member.phone}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Categoría profesional</dt>
              <dd className="mt-0.5 text-slate-700">{member.professionalCategory}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Puesto</dt>
              <dd className="mt-0.5 text-slate-700">{member.jobTitle}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Centro / Organización</dt>
              <dd className="mt-0.5 text-slate-700">{member.organization}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Vínculo con calidad y seguridad</dt>
              <dd className="mt-0.5 leading-relaxed text-slate-700">{member.qualitySafetyLink}</dd>
            </div>
          </dl>
        </section>

        {/* Membresía */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <ShieldCheck size={18} />
            </div>
            <h2 className="font-serif text-xl text-slate-900">Membresía</h2>
          </div>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Estado</dt>
              <dd className="mt-0.5">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>
                  {dashboard.statusLabel}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Tipo de cuota</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{dashboard.membershipTypeLabel}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Vigencia</dt>
              <dd className="mt-0.5 text-slate-700">Válido hasta {dashboard.validUntil}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Último pago</dt>
              <dd className="mt-0.5 text-slate-700">
                {member.lastPaymentAmount !== null ? `${member.lastPaymentAmount} €` : '—'} el {dashboard.lastPayment}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Próxima renovación</dt>
              <dd className="mt-0.5 text-slate-700">{dashboard.nextRenewal}</dd>
            </div>
          </dl>
          <div className="mt-6 rounded-lg border border-amber-100 bg-amber-50/60 p-3">
            <p className="text-xs leading-relaxed text-amber-800/80">Información pendiente de validación por ACASPEX.</p>
          </div>
        </section>
      </div>

      {/* Consentimiento comunicaciones */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <Mail size={18} />
          </div>
          <h2 className="font-serif text-xl text-slate-900">Consentimiento comunicaciones</h2>
        </div>
        <div className="mt-5 flex items-start gap-3">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-300 bg-white">
            {member.communicationConsent && <div className="h-3 w-3 rounded-sm bg-teal-700" />}
          </div>
          <p className="text-sm text-slate-700">
            Acepto recibir comunicaciones de ACASPEX.
            <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {member.communicationConsent ? 'Activado' : 'No activado'}
            </span>
          </p>
        </div>
      </section>

      {/* Nota informativa */}
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

  const officialCategoryOrder: ProjectCategory[] = [
    'seguridad_paciente',
    'mejora_procesos',
    'experiencia_paciente',
    'continuidad_asistencial',
    'humanizacion',
    'gestion_clinica',
  ];

  const categoryIcon: Record<ProjectCategory, React.ComponentType<{ size?: number | string; className?: string }>> = {
    seguridad_paciente: ShieldCheck,
    mejora_procesos: TrendingUp,
    experiencia_paciente: Users,
    continuidad_asistencial: Stethoscope,
    humanizacion: Heart,
    gestion_clinica: Building2,
  };

  const categoryCounts: Record<string, number> = {};
  for (const p of projects) {
    categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
  }

  const filteredProjects = activeCategory
    ? projects.filter((p) => p.category === activeCategory)
    : projects;

  const activeLabel = activeCategory ? (projectCategoryLabel[activeCategory as ProjectCategory] ?? activeCategory) : null;

  const sidebarButtonClass = (isActive: boolean) =>
    cn(
      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
      isActive
        ? 'bg-teal-900 text-white'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
    );

  const mobileTabClass = (isActive: boolean) =>
    cn(
      'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
      isActive
        ? 'bg-teal-900 text-white'
        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
    );

  return (
    <div className="lg:flex lg:gap-8">
      {/* Sidebar — visible solo en desktop */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        <nav className="sticky top-8 space-y-0.5 rounded-2xl border border-slate-100 bg-white p-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={sidebarButtonClass(activeCategory === null)}
          >
            <FolderKanban size={16} className={activeCategory === null ? 'text-teal-200/70' : 'text-slate-400'} />
            <span className="flex-1">Todos los proyectos</span>
            <span className={cn('text-xs tabular-nums', activeCategory === null ? 'text-teal-200/70' : 'text-slate-400')}>
              {projects.length}
            </span>
          </button>

          {officialCategoryOrder.map((cat) => {
            const Icon = categoryIcon[cat];
            const count = categoryCounts[cat] ?? 0;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={sidebarButtonClass(isActive)}
              >
                <Icon size={16} className={isActive ? 'text-teal-200/70' : 'text-slate-400'} />
                <span className="flex-1">{projectCategoryLabel[cat]}</span>
                {count > 0 && (
                  <span className={cn('text-xs tabular-nums', isActive ? 'text-teal-200/70' : 'text-slate-400')}>{count}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Contenido principal */}
      <div className="min-w-0 flex-1">
        {/* Píldoras móviles */}
        <div className="mb-5 lg:hidden">
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={mobileTabClass(activeCategory === null)}
            >
              Todos
            </button>
            {officialCategoryOrder.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={mobileTabClass(isActive)}
                >
                  {projectCategoryLabel[cat]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cabecera institucional — solo en vista "Todos" */}
        {!activeCategory && (
          <section className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 lg:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              <FolderKanban size={12} />
              Experiencias de mejora
            </span>
            <h1 className="mt-4 font-serif text-3xl lg:text-4xl font-light text-slate-900">Banco de Proyectos</h1>
            <p className="mt-3 text-sm text-slate-600 max-w-2xl">
              Repositorio de experiencias de mejora compartidas por la comunidad ACASPEX. Casos prácticos, lecciones aprendidas y aprendizajes transferibles para aplicar en tu entorno asistencial.
            </p>
            <div className="mt-5 h-px w-16 bg-teal-700/30" />
          </section>
        )}

        {/* Cabecera de categoría activa */}
        {activeCategory && (
          <div className="mb-6">
            <h2 className="font-serif text-xl text-slate-900">{activeLabel}</h2>
            <p className="mt-1 text-sm text-slate-500">{categoryCounts[activeCategory] ?? 0} proyectos</p>
          </div>
        )}

        {/* Listado de proyectos */}
        {filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-6">
            <p className="text-sm text-slate-600">
              Próximamente: proyectos en {activeLabel ? `«${activeLabel}»` : 'esta categoría'}.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredProjects.map((project, index) => {
              const isFirst = index === 0;
              const statusBadge = projectStatusBadgeClass[project.status] ?? 'bg-slate-100 text-slate-600';
              const statusText = projectStatusLabel[project.status] ?? project.status;
              const categoryText = projectCategoryLabel[project.category] ?? project.category;

              return (
                <article
                  key={project.id}
                  className={cn(
                    'rounded-2xl border bg-white transition-colors',
                    isFirst
                      ? 'border-teal-200 p-6 lg:p-8 bg-gradient-to-br from-white to-teal-50/40'
                      : 'border-slate-100 p-5 lg:p-6 hover:border-slate-200',
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                      {categoryText}
                    </span>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge}`}>
                      {statusText}
                    </span>
                  </div>
                  <h3 className={cn('font-serif font-medium text-slate-900', isFirst ? 'mt-4 text-xl' : 'mt-3 text-lg')}>
                    {project.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {project.scope} · {project.organization}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">{project.summary}</p>

                  <div className="mt-4 border-l-2 border-teal-200 bg-teal-50/40 py-2 pl-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-teal-700">Aprendizaje transferible</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">{project.transferableLearning}</p>
                  </div>

                  {project.associatedMaterial && (
                    <div className="mt-3 flex items-center gap-1.5 text-sm text-teal-700">
                      <FileText size={14} />
                      <Link
                        to="/socios/recursos"
                        className="transition-colors hover:text-teal-800 hover:underline"
                      >
                        {project.associatedMaterial}
                      </Link>
                    </div>
                  )}

                  <div className="mt-4">
                    <Link
                      to={`/socios/proyectos/${project.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
                    >
                      Ver proyecto
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function MemberProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = mockProjects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-4">
          <h1 className="font-serif text-2xl font-medium text-slate-900">Proyecto no encontrado</h1>
          <p className="text-sm text-slate-600">
            El proyecto que buscas no existe o no está disponible.
          </p>
          <Link
            to="/socios/proyectos"
            className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
          >
            <ChevronLeft size={14} />
            Volver al Banco de Proyectos
          </Link>
        </div>
      </section>
    );
  }

  const statusBadge = projectStatusBadgeClass[project.status] ?? 'bg-slate-100 text-slate-600';
  const statusText = projectStatusLabel[project.status] ?? project.status;
  const categoryText = projectCategoryLabel[project.category] ?? project.category;

  return (
    <div className="space-y-0">
      <div className="border-b border-slate-100 bg-white py-4">
        <div className="mx-auto max-w-3xl px-6">
          <Link
            to="/socios/proyectos"
            className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
          >
            <ChevronLeft size={14} />
            Volver al Banco de Proyectos
          </Link>
        </div>
      </div>

      {/* Hero editorial */}
      <section className="bg-teal-900 text-white">
        <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-teal-50">
              {categoryText}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge}`}>
              {statusText}
            </span>
            {project.fuente && (
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-teal-50">
                {project.fuente}
              </span>
            )}
          </div>
          <h1 className="mt-5 font-serif text-3xl font-light leading-tight sm:text-4xl">
            {project.title}
          </h1>
          <p className="mt-3 text-sm text-teal-100/80">
            {project.scope} · {project.organization}
          </p>
        </div>
      </section>

      {/* Resumen */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <p className="text-sm leading-relaxed text-slate-700">{project.summary}</p>
        </div>
      </section>

      {/* Contenido editorial */}
      <article className="bg-white px-6 py-10">
        <div className="mx-auto max-w-3xl space-y-8 rounded-2xl border border-slate-100 p-6 sm:p-8">
          <section>
            <h2 className="font-serif text-lg text-slate-900">Objetivo</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{project.objetivo}</p>
          </section>

          <section className="border-t border-slate-100 pt-8">
            <h2 className="font-serif text-lg text-slate-900">Contexto</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{project.contexto}</p>
          </section>

          <section className="border-t border-slate-100 pt-8">
            <h2 className="font-serif text-lg text-slate-900">Metodología</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{project.metodologia}</p>
          </section>

          <section className="border-t border-slate-100 pt-8">
            <h2 className="font-serif text-lg text-slate-900">Indicadores</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700">
              {project.indicadores.map((indicador, index) => (
                <li key={index}>{indicador}</li>
              ))}
            </ul>
          </section>

          <section className="border-t border-slate-100 pt-8">
            <h2 className="font-serif text-lg text-slate-900">Resultados</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{project.resultados}</p>
          </section>

          <section className="border-t border-slate-100 pt-8">
            <h2 className="font-serif text-lg text-slate-900">Lecciones aprendidas</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{project.lecciones_aprendidas}</p>
          </section>

          <section className="border-t border-teal-100 bg-teal-50/30 -mx-6 -mb-6 p-6 sm:-mx-8 sm:-mb-8 sm:p-8">
            <h2 className="font-serif text-lg text-teal-900">Aprendizaje transferible</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{project.transferableLearning}</p>
          </section>

          {project.associatedMaterial && (
            <section className="border-t border-slate-100 pt-8">
              <p className="text-sm text-slate-600">
                Material asociado:{' '}
                <Link
                  to="/socios/recursos"
                  className="font-medium text-teal-700 transition-colors hover:text-teal-800"
                >
                  {project.associatedMaterial}
                </Link>
              </p>
            </section>
          )}
        </div>
      </article>

      <div className="border-t border-slate-100 bg-white px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/socios/proyectos"
            className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
          >
            <ChevronLeft size={14} />
            Volver al Banco de Proyectos
          </Link>
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
