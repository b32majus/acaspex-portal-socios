import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Building2,
  CalendarCheck,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Edit,
  Eye,
  FileText,
  Filter,
  FolderKanban,
  Globe,
  GraduationCap,
  Handshake,
  Heart,
  IdCard,
  Info,
  Lightbulb,
  Mail,
  MessageCircle,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  Upload,
  User,
  Users,
  Video,
  Wrench,
  XCircle,
} from 'lucide-react';
import { mockMembers, mockRenewals, mockSocioDashboard, type MemberStatus, type MembershipType, type ReducedFeeReason, type RenewalItem } from '../data/mockMembers';
import { mockProjects, projectCategoryLabel, projectStatusBadgeClass, projectStatusLabel, type ProjectCategory } from '../data/mockProjects';
import { mockResources, type ResourceCategory, type ResourceStatus, type ResourceType } from '../data/mockResources';
import { mockNews } from '../data/mockNews';
import {
  mockSignupRequests,
  type SignupDocumentType,
  type SignupMembershipType,
  type SignupReducedFeeReason,
  type SignupStatus,
} from '../data/mockSignup';
import { cn } from '../lib/utils';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../lib/authContext';
import { useIdentity } from '../lib/identityContext';

export function LoginPage() {
  const assetBase = import.meta.env.BASE_URL;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session, signOut } = useAuth();
  const { canAccessMemberArea, canAccessAdmin, accessReason } = useIdentity();

  const configured = isSupabaseConfigured();

  async function handleSignOut() {
    await signOut();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!configured) {
      setError('El sistema de acceso no está configurado. Contacta con administración.');
      return;
    }

    setLoading(true);

    supabase!.auth
      .signInWithPassword({ email: email.trim(), password })
      .then(({ error: authError }) => {
        if (authError) {
          setError('No hemos podido iniciar sesión con esos datos. Revisa el correo y la contraseña.');
        } else {
          navigate('/socios');
        }
      })
      .catch(() => {
        setError('No hemos podido iniciar sesión con esos datos. Revisa el correo y la contraseña.');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-[2fr_3fr]">
      {/* Panel izquierdo — teal oscuro */}
      <div className="relative hidden flex-col justify-between bg-teal-900 p-10 lg:p-16 text-white overflow-hidden lg:flex">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.7]"
          style={{ backgroundImage: `url(${assetBase}assets/acaspex/puente-alcantara.jpg)` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-teal-900/15 via-teal-900/25 to-teal-900/50" />
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-teal-800/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-teal-800/30 to-transparent" />

        <div className="relative z-10">
          <div className="mb-5 inline-block rounded-xl bg-white/95 px-3 pt-0 pb-5 shadow-sm backdrop-blur-[2px]">
            <img
              src={`${assetBase}assets/acaspex/logo-horizontal.png`}
              alt="ACASPEX"
              className="w-48 -mt-1 lg:w-56"
            />
          </div>
          <h2 className="font-serif text-3xl lg:text-4xl font-light tracking-tight">ACASPEX</h2>
          <p className="mt-2 text-sm text-white/85">Asociación Extremeña de Calidad Asistencial y Seguridad de Pacientes</p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="w-16 h-px bg-teal-400/60" />
          <h3 className="font-serif text-2xl lg:text-3xl font-light leading-tight">
            Excelencia que se comparte.<br />Seguridad que nos une.
          </h3>
        </div>

        <p className="relative z-10 text-xs text-white/70">
          Calidad asistencial · Seguridad del paciente · Comunidad profesional
        </p>
      </div>

      {/* Panel derecho — formulario o sesión activa */}
      <div className="relative flex items-center justify-center p-8 lg:p-16 bg-white">
        {session ? (
          <div className="w-full max-w-sm space-y-6">
            <div>
              <h1 className="font-serif text-2xl lg:text-3xl font-light text-slate-900">Sesión iniciada</h1>
              <p className="mt-1 text-sm text-slate-500">Conectado como {session.user?.email}</p>
              {accessReason === 'admin_oversight' && (
                <p className="mt-1 text-xs text-amber-600">Acceso con permisos de administración.</p>
              )}
            </div>
            <div className="space-y-3">
              {canAccessAdmin && (
                <Link
                  to="/admin"
                  className="block w-full rounded-lg bg-teal-900 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-teal-800"
                >
                  Ir al panel de administración
                </Link>
              )}
              {canAccessMemberArea && (
                <Link
                  to="/socios"
                  className="block w-full rounded-lg bg-teal-700 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-teal-600"
                >
                  Ver área de socios
                </Link>
              )}
              {!canAccessMemberArea && !canAccessAdmin && (
                <p className="text-sm text-slate-500 text-center py-2">Tu cuenta está pendiente de activación o revisión.</p>
              )}
              <button
                onClick={handleSignOut}
                className="block w-full rounded-lg border border-slate-200 bg-white px-5 py-3 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cerrar sesión
              </button>
            </div>
            <div className="text-center pt-2">
              <p className="text-sm text-slate-500">
                ¿Aún no eres socio?{' '}
                <Link
                  to="/hazte-socio"
                  className="font-medium text-teal-700 hover:text-teal-800 underline underline-offset-2"
                >
                  Hazte socio
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm space-y-6">
            <div>
              <h1 className="font-serif text-2xl lg:text-3xl font-light text-slate-900">Área privada de socios</h1>
              <p className="mt-1 text-sm text-slate-500">Accede con el correo y la contraseña asociados a tu cuenta de ACASPEX.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">
                  Correo electrónico
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="Correo electrónico"
                  required
                  autoComplete="email"
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
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="Contraseña"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm text-amber-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="block w-full rounded-lg bg-teal-900 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Iniciando sesión...' : 'Acceder al portal'}
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-sm text-slate-500">
                ¿Aún no eres socio?{' '}
                <Link
                  to="/hazte-socio"
                  className="font-medium text-teal-700 hover:text-teal-800 underline underline-offset-2"
                >
                  Hazte socio
                </Link>
              </p>
            </div>
          </div>
        )}

        <Link
          to="/admin"
          className="absolute bottom-4 right-4 rounded-full p-2 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
          title="Acceso administrador"
          aria-label="Acceso administrador"
        >
          <Settings size={16} />
        </Link>
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

const resourceStatusLabel: Record<ResourceStatus, string> = {
  published: 'Publicado',
  draft: 'Borrador',
  archived: 'Archivado',
};

const resourceStatusBadgeClass: Record<ResourceStatus, string> = {
  published: 'bg-emerald-100 text-emerald-800',
  draft: 'bg-amber-100 text-amber-700',
  archived: 'bg-slate-100 text-slate-600',
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
  const activeMembers = mockMembers.filter((m) => m.status === 'active').length;
  const pendingMembers = mockMembers.filter((m) => m.status === 'pending_review').length;
  const expiredMembers = mockMembers.filter((m) => m.status === 'expired').length;

  const publishedResources = mockResources.filter((r) => r.status === 'published').length;
  const draftResources = mockResources.filter((r) => r.status === 'draft').length;
  const archivedResources = mockResources.filter((r) => r.status === 'archived').length;

  const latestMembers = [...mockMembers]
    .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt))
    .slice(0, 3);

  const upcomingRenewals = mockRenewals
    .filter((r) => r.renewalState === 'upcoming')
    .slice(0, 5);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const pendingSignupCount = mockSignupRequests.filter((r) => r.status === 'pending_review').length;
  const upcomingRenewalCount = mockRenewals.filter((r) => r.renewalState === 'upcoming').length;
  const expiredRenewalCount = mockRenewals.filter((r) => r.renewalState === 'expired').length;

  const alerts = [
    {
      key: 'pending-signups',
      label: 'Solicitudes pendientes',
      count: pendingSignupCount,
      href: '/admin/solicitudes',
      icon: Users,
      color: 'amber',
    },
    {
      key: 'upcoming-renewals',
      label: 'Renovaciones próximas',
      count: upcomingRenewalCount,
      href: '/admin/renovaciones',
      icon: RefreshCw,
      color: 'teal',
    },
    {
      key: 'expired-renewals',
      label: 'Cuotas expiradas',
      count: expiredRenewalCount,
      href: '/admin/renovaciones',
      icon: AlertTriangle,
      color: 'red',
    },
    {
      key: 'draft-resources',
      label: 'Recursos en borrador',
      count: draftResources,
      href: '/admin/recursos',
      icon: FileText,
      color: 'slate',
    },
  ] as const;

  const alertColorClass: Record<(typeof alerts)[number]['color'], { card: string; iconBg: string; icon: string }> = {
    amber: { card: 'border-amber-200 bg-amber-50/60 hover:border-amber-300', iconBg: 'bg-amber-100', icon: 'text-amber-700' },
    teal: { card: 'border-teal-200 bg-teal-50/40 hover:border-teal-300', iconBg: 'bg-teal-100', icon: 'text-teal-700' },
    red: { card: 'border-red-200 bg-red-50/50 hover:border-red-300', iconBg: 'bg-red-100', icon: 'text-red-700' },
    slate: { card: 'border-slate-200 bg-slate-50 hover:border-slate-300', iconBg: 'bg-slate-200', icon: 'text-slate-700' },
  };

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-serif text-2xl font-light text-slate-900">Panel de administración</h1>
        <p className="mt-1 text-sm text-slate-500">Resumen de socios, recursos y renovaciones.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-2">
          <Bell size={18} className="text-teal-700" />
          <h2 className="font-serif text-lg text-slate-900">Alertas operativas</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            const colors = alertColorClass[alert.color];
            return (
              <Link
                key={alert.key}
                to={alert.href}
                className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${colors.card}`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colors.iconBg}`}>
                  <Icon size={18} className={colors.icon} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">{alert.label}</p>
                  <p className="mt-0.5 text-2xl font-semibold text-slate-900">{alert.count}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-serif text-lg text-slate-900">Resumen de socios</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Activos</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{activeMembers}</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Pendientes de revisión</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{pendingMembers}</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Cuotas expiradas</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{expiredMembers}</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Total registrados</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{mockMembers.length}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-serif text-lg text-slate-900">Resumen de recursos</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Publicados</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{publishedResources}</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Borradores</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{draftResources}</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Archivados</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{archivedResources}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-serif text-lg text-slate-900">Últimas altas mock</h2>
        {latestMembers.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No hay altas recientes.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {latestMembers.map((member) => (
              <li key={member.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-slate-900">
                  {member.firstName} {member.lastName1} {member.lastName2}
                </p>
                <p className="text-xs text-slate-500">{formatDate(member.joinedAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-serif text-lg text-slate-900">Próximas renovaciones mock</h2>
        {upcomingRenewals.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No hay renovaciones próximas.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {upcomingRenewals.map((renewal) => (
              <li key={renewal.memberId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-slate-900">{renewal.fullName}</p>
                <p className="text-xs text-slate-500">Vigente hasta {renewal.paidUntil ? formatDate(renewal.paidUntil) : '—'}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-serif text-lg text-slate-900">Accesos rápidos</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/admin/socios"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-teal-300 hover:text-teal-700"
          >
            <Users size={15} />
            Socios
          </Link>
          <Link
            to="/admin/recursos"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-teal-300 hover:text-teal-700"
          >
            <BookOpen size={15} />
            Recursos
          </Link>
          <Link
            to="/admin/renovaciones"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-teal-300 hover:text-teal-700"
          >
            <RefreshCw size={15} />
            Renovaciones
          </Link>
        </div>
      </section>
    </div>
  );
}

const memberStatusLabel: Record<MemberStatus, string> = {
  active: 'Activo',
  pending_review: 'Pendiente de revisión',
  expired: 'Expirado',
  inactive: 'Inactivo',
  cancelled: 'Cancelado',
};

const membershipTypeLabel: Record<MembershipType, string> = {
  general: 'General',
  reduced: 'Reducida',
};

function formatIsoDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function AdminMembersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MembershipType | 'all'>('all');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const organizations = Array.from(new Set(mockMembers.map((m) => m.organization))).sort();
  const categories = Array.from(new Set(mockMembers.map((m) => m.professionalCategory))).sort();

  const filteredMembers = mockMembers.filter((member) => {
    const fullName = `${member.firstName} ${member.lastName1} ${member.lastName2}`.toLowerCase();
    const matchesSearch =
      search.trim() === '' ||
      fullName.includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase()) ||
      member.organization.toLowerCase().includes(search.toLowerCase()) ||
      member.professionalCategory.toLowerCase().includes(search.toLowerCase()) ||
      member.jobTitle.toLowerCase().includes(search.toLowerCase());

    return (
      matchesSearch &&
      (statusFilter === 'all' || member.status === statusFilter) &&
      (typeFilter === 'all' || member.membershipType === typeFilter) &&
      (organizationFilter === 'all' || member.organization === organizationFilter) &&
      (categoryFilter === 'all' || member.professionalCategory === categoryFilter)
    );
  });

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <section>
        <h1 className="font-serif text-2xl font-light text-slate-900">Socios</h1>
        <p className="mt-1 text-sm text-slate-500">Gestión mock del registro de socios.</p>
      </section>

      {/* Filtros */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Filter size={16} className="text-teal-700" />
          Filtros
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="member-search" className="block text-xs font-medium text-slate-500">
              Buscar
            </label>
            <div className="relative mt-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="member-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, email, centro…"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="member-status" className="block text-xs font-medium text-slate-500">
              Estado
            </label>
            <select
              id="member-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as MemberStatus | 'all')}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">Todos</option>
              <option value="active">{memberStatusLabel.active}</option>
              <option value="pending_review">{memberStatusLabel.pending_review}</option>
              <option value="expired">{memberStatusLabel.expired}</option>
              <option value="inactive">{memberStatusLabel.inactive}</option>
              <option value="cancelled">{memberStatusLabel.cancelled}</option>
            </select>
          </div>

          <div>
            <label htmlFor="member-type" className="block text-xs font-medium text-slate-500">
              Tipo de cuota
            </label>
            <select
              id="member-type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as MembershipType | 'all')}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">Todas</option>
              <option value="general">{membershipTypeLabel.general}</option>
              <option value="reduced">{membershipTypeLabel.reduced}</option>
            </select>
          </div>

          <div>
            <label htmlFor="member-organization" className="block text-xs font-medium text-slate-500">
              Organización
            </label>
            <select
              id="member-organization"
              value={organizationFilter}
              onChange={(e) => setOrganizationFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">Todas</option>
              {organizations.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label htmlFor="member-category" className="block text-xs font-medium text-slate-500">
              Categoría profesional
            </label>
            <select
              id="member-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 sm:w-auto"
            >
              <option value="all">Todas</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-900">{filteredMembers.length}</span> socios
          </p>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-600">No hay socios que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 font-medium">Socio</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Categoría / Puesto</th>
                  <th className="pb-3 font-medium">Organización</th>
                  <th className="pb-3 font-medium">Cuota</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Vigencia</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => {
                  const badgeClass = statusBadgeClass[member.status] ?? 'bg-slate-100 text-slate-600';
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/60">
                      <td className="py-3 font-medium text-slate-900">
                        {member.firstName} {member.lastName1} {member.lastName2}
                      </td>
                      <td className="py-3 text-slate-600">{member.email}</td>
                      <td className="py-3 text-slate-600">
                        <span className="block text-slate-900">{member.professionalCategory}</span>
                        <span className="text-xs text-slate-500">{member.jobTitle}</span>
                      </td>
                      <td className="py-3 text-slate-600">{member.organization}</td>
                      <td className="py-3 text-slate-600">
                        {membershipTypeLabel[member.membershipType] ?? member.membershipType}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>
                          {memberStatusLabel[member.status] ?? member.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">{formatIsoDate(member.paidUntil)}</td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/admin/socios/${member.id}`}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-50"
                        >
                          Ver
                          <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export function AdminMemberDetailPage() {
  const { memberId } = useParams<{ memberId: string }>();
  const member = mockMembers.find((m) => m.id === memberId);

  if (!member) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-4">
          <h1 className="font-serif text-2xl font-light text-slate-900">Socio no encontrado</h1>
          <p className="text-sm text-slate-600">
            No existe ningún socio con el identificador indicado.
          </p>
          <Link
            to="/admin/socios"
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800"
          >
            <ChevronLeft size={14} />
            Volver a socios
          </Link>
        </div>
      </section>
    );
  }

  const reducedFeeReasonLabel: Record<NonNullable<ReducedFeeReason>, string> = {
    resident: 'Residente',
    student: 'Estudiante',
    retired: 'Jubilado/a',
  };

  const badgeClass = statusBadgeClass[member.status] ?? 'bg-slate-100 text-slate-600';
  const fullName = `${member.firstName} ${member.lastName1} ${member.lastName2}`;

  return (
    <div className="space-y-8">
      {/* Link de vuelta */}
      <Link
        to="/admin/socios"
        className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
      >
        <ChevronLeft size={14} />
        Volver a socios
      </Link>

      {/* Cabecera */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-teal-700">Ficha administrativa</p>
            <h1 className="mt-2 font-serif text-3xl font-light text-slate-900">{fullName}</h1>
            <p className="mt-1 text-sm text-slate-500">{member.organization}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
              {memberStatusLabel[member.status] ?? member.status}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {membershipTypeLabel[member.membershipType] ?? member.membershipType}
            </span>
          </div>
        </div>
      </section>

      {/* Datos personales / profesionales + Membresía */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Datos personales / profesionales */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <User size={18} />
            </div>
            <h2 className="font-serif text-xl text-slate-900">Datos personales y profesionales</h2>
          </div>
          <dl className="mt-6 space-y-4 text-sm">
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
              <dd className="mt-0.5 font-medium text-slate-900">{member.professionalCategory}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Puesto</dt>
              <dd className="mt-0.5 text-slate-700">{member.jobTitle}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Organización</dt>
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
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Fecha de alta</dt>
              <dd className="mt-0.5 text-slate-700">{formatIsoDate(member.joinedAt)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Estado</dt>
              <dd className="mt-0.5">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>
                  {memberStatusLabel[member.status] ?? member.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Tipo de cuota</dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {membershipTypeLabel[member.membershipType] ?? member.membershipType}
              </dd>
            </div>
            {member.membershipType === 'reduced' && member.reducedFeeReason && (
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Motivo cuota reducida</dt>
                <dd className="mt-0.5 text-slate-700">{reducedFeeReasonLabel[member.reducedFeeReason as NonNullable<ReducedFeeReason>]}</dd>
              </div>
            )}
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Vigencia</dt>
              <dd className="mt-0.5 text-slate-700">
                {member.paidUntil ? `Válido hasta ${formatIsoDate(member.paidUntil)}` : 'Sin vigencia registrada'}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Último pago</dt>
              <dd className="mt-0.5 text-slate-700">
                {member.lastPaymentDate
                  ? `${formatIsoDate(member.lastPaymentDate)}${member.lastPaymentAmount !== null ? ` · ${member.lastPaymentAmount} €` : ''}`
                  : '—'}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Consentimiento comunicación */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <Mail size={18} />
          </div>
          <h2 className="font-serif text-xl text-slate-900">Consentimiento comunicación</h2>
        </div>
        <div className="mt-5 flex items-start gap-3">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-300 bg-white">
            {member.communicationConsent && <div className="h-3 w-3 rounded-sm bg-teal-700" />}
          </div>
          <p className="text-sm text-slate-700">
            Acepta recibir comunicaciones de ACASPEX.
            <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {member.communicationConsent ? 'Activado' : 'No activado'}
            </span>
          </p>
        </div>
      </section>

      {/* Notas internas mock */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <FileText size={18} />
          </div>
          <h2 className="font-serif text-xl text-slate-900">Notas internas</h2>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-slate-700">{member.notes}</p>
      </section>

      {/* Acciones visuales mock / deshabilitadas */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl text-slate-900">Acciones</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 opacity-50 transition-colors cursor-not-allowed"
          >
            <Search size={15} />
            Revisar solicitud
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 opacity-50 transition-colors cursor-not-allowed"
          >
            <CheckCircle size={15} />
            Marcar como activo
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 opacity-50 transition-colors cursor-not-allowed"
          >
            <RefreshCw size={15} />
            Ver renovación
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 opacity-50 transition-colors cursor-not-allowed"
          >
            <Edit size={15} />
            Editar datos
          </button>
        </div>
      </section>
    </div>
  );
}

export function AdminResourcesPage() {
  const navigate = useNavigate();
  const publishedCount = mockResources.filter((r) => r.status === 'published').length;
  const draftCount = mockResources.filter((r) => r.status === 'draft').length;
  const archivedCount = mockResources.filter((r) => r.status === 'archived').length;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light text-slate-900">Recursos</h1>
          <p className="mt-1 text-sm text-slate-500">Gestión mock del Centro de Conocimiento.</p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/recursos/nuevo')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800"
          >
            <Upload size={15} />
            Nuevo recurso
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Publicados</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{publishedCount}</p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Borradores</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{draftCount}</p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Archivados</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{archivedCount}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-3 font-medium">Título</th>
                <th className="pb-3 font-medium">Categoría</th>
                <th className="pb-3 font-medium">Tipo</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium">Fecha</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockResources.map((resource) => {
                const statusBadge = resourceStatusBadgeClass[resource.status] ?? 'bg-slate-100 text-slate-600';
                return (
                  <tr key={resource.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-medium text-slate-900">{resource.title}</td>
                    <td className="py-3 text-slate-600">{categoryLabel[resource.category] ?? resource.category}</td>
                    <td className="py-3 text-slate-600">{typeLabel[resource.type] ?? resource.type}</td>
                    <td className="py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge}`}>
                        {resourceStatusLabel[resource.status] ?? resource.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">
                      {resource.publishedAt ? resource.publishedAt.split('-').reverse().join('/') : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/recursos/${resource.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-50"
                      >
                        Editar
                        <ChevronRight size={13} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function AdminResourceEditorPage() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const resource = mockResources.find((r) => r.id === resourceId);

  const [title, setTitle] = useState(resource?.title ?? '');
  const [subtitle, setSubtitle] = useState(resource?.subtitle ?? '');
  const [category, setCategory] = useState(resource?.category ?? 'calidad');
  const [type, setType] = useState(resource?.type ?? 'pdf');
  const [status, setStatus] = useState<ResourceStatus>(resource?.status ?? 'draft');
  const [description, setDescription] = useState(resource?.description ?? '');
  const [externalUrl, setExternalUrl] = useState(resource?.externalUrl ?? '');
  const [mockMessage, setMockMessage] = useState<string | null>(null);

  if (!resource) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-4">
          <h1 className="font-serif text-2xl font-light text-slate-900">Recurso no encontrado</h1>
          <p className="text-sm text-slate-600">
            No existe ningún recurso con el identificador indicado.
          </p>
          <Link
            to="/admin/recursos"
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800"
          >
            <ChevronLeft size={14} />
            Volver a recursos
          </Link>
        </div>
      </section>
    );
  }

  const statusBadge = resourceStatusBadgeClass[status] ?? 'bg-slate-100 text-slate-600';

  return (
    <div className="space-y-8">
      <Link
        to="/admin/recursos"
        className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
      >
        <ChevronLeft size={14} />
        Volver a recursos
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-teal-700">Recurso</p>
            <h1 className="mt-2 font-serif text-3xl font-light text-slate-900">{resource.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{resource.subtitle}</p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusBadge}`}>
            {resourceStatusLabel[status] ?? status}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl text-slate-900">Detalles del recurso</h2>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Título</dt>
            <dd className="mt-0.5 text-sm text-slate-900">{resource.title}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Categoría</dt>
            <dd className="mt-0.5 text-sm text-slate-700">{categoryLabel[resource.category] ?? resource.category}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Tipo</dt>
            <dd className="mt-0.5 text-sm text-slate-700">{typeLabel[resource.type] ?? resource.type}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Estado</dt>
            <dd className="mt-0.5">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${resourceStatusBadgeClass[resource.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {resourceStatusLabel[resource.status] ?? resource.status}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Fecha de publicación</dt>
            <dd className="mt-0.5 text-sm text-slate-700">
              {resource.publishedAt ? resource.publishedAt.split('-').reverse().join('/') : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Nivel de acceso</dt>
            <dd className="mt-0.5">
              <span className="inline-flex rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                Socios
              </span>
            </dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Descripción</dt>
          <dd className="mt-0.5 text-sm leading-relaxed text-slate-700">{resource.description}</dd>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Info size={18} className="mt-0.5 shrink-0 text-amber-700" />
            <p className="text-sm font-medium text-amber-800">Gestión mock — sin guardado real</p>
          </div>
        </div>

        <h2 className="font-serif text-xl text-slate-900">Edición mock</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="resource-title" className="block text-xs font-medium text-slate-500">
              Título
            </label>
            <input
              id="resource-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div>
            <label htmlFor="resource-subtitle" className="block text-xs font-medium text-slate-500">
              Subtítulo
            </label>
            <input
              id="resource-subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div>
            <label htmlFor="resource-category" className="block text-xs font-medium text-slate-500">
              Categoría
            </label>
            <select
              id="resource-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ResourceCategory)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              {Object.entries(categoryLabel).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="resource-type" className="block text-xs font-medium text-slate-500">
              Tipo
            </label>
            <select
              id="resource-type"
              value={type}
              onChange={(e) => setType(e.target.value as ResourceType)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              {Object.entries(typeLabel).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="resource-status" className="block text-xs font-medium text-slate-500">
              Estado
            </label>
            <select
              id="resource-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ResourceStatus)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
          <div>
            <label htmlFor="resource-external-url" className="block text-xs font-medium text-slate-500">
              Enlace externo
            </label>
            <input
              id="resource-external-url"
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://…"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="resource-description" className="block text-xs font-medium text-slate-500">
              Descripción
            </label>
            <textarea
              id="resource-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="resource-file" className="block text-xs font-medium text-slate-500">
              Archivo mock
            </label>
            <input
              id="resource-file"
              type="file"
              disabled
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 opacity-60 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-slate-400">La subida de archivos está deshabilitada en la versión mock.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setMockMessage('Borrador guardado (mock — sin guardado real)')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Edit size={15} />
            Guardar borrador
          </button>
          <button
            type="button"
            onClick={() => setMockMessage('Recurso publicado (mock — sin guardado real)')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800"
          >
            <Upload size={15} />
            Publicar
          </button>
        </div>

        {mockMessage && (
          <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-sm text-emerald-800/80">{mockMessage}</p>
          </div>
        )}
      </section>
    </div>
  );
}

export function AdminResourceNewPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('calidad');
  const [type, setType] = useState('pdf');
  const [status, setStatus] = useState<ResourceStatus>('draft');
  const [description, setDescription] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <Link
        to="/admin/recursos"
        className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
      >
        <ChevronLeft size={14} />
        Volver a recursos
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <h1 className="font-serif text-3xl font-light text-slate-900">Nuevo recurso</h1>
          <p className="mt-1 text-sm text-slate-500">Alta mock de recurso o material.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Info size={18} className="mt-0.5 shrink-0 text-amber-700" />
            <p className="text-sm font-medium text-amber-800">Gestión mock — sin guardado real</p>
          </div>
        </div>

        <h2 className="font-serif text-xl text-slate-900">Formulario de alta</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="new-title" className="block text-xs font-medium text-slate-500">
              Título
            </label>
            <input
              id="new-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div>
            <label htmlFor="new-category" className="block text-xs font-medium text-slate-500">
              Categoría
            </label>
            <select
              id="new-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              {Object.entries(categoryLabel).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="new-type" className="block text-xs font-medium text-slate-500">
              Tipo de recurso
            </label>
            <select
              id="new-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              {Object.entries(typeLabel).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="new-status" className="block text-xs font-medium text-slate-500">
              Estado
            </label>
            <select
              id="new-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ResourceStatus)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              {Object.entries(resourceStatusLabel).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="new-external-url" className="block text-xs font-medium text-slate-500">
              Enlace externo
            </label>
            <input
              id="new-external-url"
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://…"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="new-description" className="block text-xs font-medium text-slate-500">
              Descripción
            </label>
            <textarea
              id="new-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="new-file" className="block text-xs font-medium text-slate-500">
              Material asociado mock
            </label>
            <input
              id="new-file"
              type="file"
              disabled
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 opacity-60 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-slate-400">La subida de archivos está deshabilitada en la versión mock.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setFeedback('Recurso simulado. No se ha guardado ningún cambio real.')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800"
          >
            <Upload size={15} />
            Guardar recurso
          </button>
          <Link
            to="/admin/recursos"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Volver a recursos
          </Link>
        </div>

        {feedback && (
          <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-sm text-emerald-800/80">{feedback}</p>
          </div>
        )}
      </section>
    </div>
  );
}

const renewalStateLabel: Record<RenewalItem['renewalState'], string> = {
  upcoming: 'Próxima',
  expired: 'Expirada',
  not_applicable: 'No aplicable',
};

const renewalStateBadgeClass: Record<RenewalItem['renewalState'], string> = {
  upcoming: 'bg-amber-100 text-amber-700',
  expired: 'bg-red-100 text-red-700',
  not_applicable: 'bg-slate-100 text-slate-600',
};

type RenewalSectionProps = {
  title: string;
  count: number;
  items: RenewalItem[];
};

function RenewalSection({ title, count, items }: RenewalSectionProps) {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-slate-900">{title}</h2>
        <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-medium text-slate-700">
          {count}
        </span>
      </div>

      {feedback && (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-500 hover:text-emerald-700"
            aria-label="Cerrar mensaje"
          >
            <XCircle size={14} />
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No hay socios en este grupo.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-3 font-medium">Socio</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium">Tipo cuota</th>
                <th className="pb-3 font-medium">Vigencia</th>
                <th className="pb-3 font-medium">Último pago</th>
                <th className="pb-3 font-medium">Renovación</th>
                <th className="pb-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((renewal) => {
                const member = mockMembers.find((m) => m.id === renewal.memberId);
                const statusLabel = memberStatusLabel[renewal.status] ?? renewal.status;
                const statusClass = statusBadgeClass[renewal.status] ?? 'bg-slate-100 text-slate-600';
                const renewalLabel = renewalStateLabel[renewal.renewalState];
                const renewalClass = renewalStateBadgeClass[renewal.renewalState];
                const lastPayment =
                  member?.lastPaymentDate && member.lastPaymentAmount != null
                    ? `${formatIsoDate(member.lastPaymentDate)} · ${member.lastPaymentAmount}€`
                    : '—';

                return (
                  <tr key={renewal.memberId} className="text-slate-700">
                    <td className="py-3 pr-3">
                      <Link
                        to={`/admin/socios/${renewal.memberId}`}
                        className="font-medium text-slate-900 hover:text-teal-700"
                      >
                        {renewal.fullName}
                      </Link>
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      {member ? membershipTypeLabel[member.membershipType] : '—'}
                    </td>
                    <td className="py-3 pr-3">{formatIsoDate(renewal.paidUntil)}</td>
                    <td className="py-3 pr-3">{lastPayment}</td>
                    <td className="py-3 pr-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${renewalClass}`}>
                        {renewalLabel}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/socios/${renewal.memberId}`)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <Eye size={12} />
                          Ver socio
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeedback('Seguimiento marcado (mock — sin guardado real)')}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <CheckCircle size={12} />
                          Marcar seguimiento
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeedback('Recordatorio simulado. No se ha enviado ningún email real.')}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <Mail size={12} />
                          Enviar recordatorio mock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function AdminRenewalsPage() {
  const upcoming = mockRenewals.filter((r) => r.renewalState === 'upcoming');
  const expired = mockRenewals.filter((r) => r.renewalState === 'expired');
  const notApplicable = mockRenewals.filter((r) => r.renewalState === 'not_applicable');

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-serif text-2xl font-light text-slate-900">Renovaciones</h1>
        <p className="mt-1 text-sm text-slate-500">Seguimiento mock de cuotas y vigencias.</p>
      </section>

      <RenewalSection title="Próximas renovaciones" count={upcoming.length} items={upcoming} />
      <RenewalSection title="Cuotas expiradas" count={expired.length} items={expired} />
      <RenewalSection title="Sin cuota aplicable / revisión" count={notApplicable.length} items={notApplicable} />
    </div>
  );
}

const signupStatusLabel: Record<SignupStatus, string> = {
  pending_review: 'Pendiente de revisión',
  active: 'Activo',
  expired: 'Expirado',
  inactive: 'Inactivo',
  cancelled: 'Cancelado',
};

const signupMembershipSimpleLabel: Record<SignupMembershipType, string> = {
  general: 'General',
  reduced: 'Reducida',
};

function formatSignupDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function AdminSignupRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<SignupStatus | 'all'>('pending_review');

  const filteredRequests = mockSignupRequests.filter((req) =>
    statusFilter === 'all' ? true : req.status === statusFilter,
  );

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-serif text-2xl font-light text-slate-900">Solicitudes de alta</h1>
        <p className="mt-1 text-sm text-slate-500">Bandeja de revisión de solicitudes de socio.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Filter size={16} className="text-teal-700" />
          Filtros
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="signup-status" className="block text-xs font-medium text-slate-500">
              Estado
            </label>
            <select
              id="signup-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SignupStatus | 'all')}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">Todas</option>
              <option value="pending_review">{signupStatusLabel.pending_review}</option>
              <option value="active">{signupStatusLabel.active}</option>
              <option value="expired">{signupStatusLabel.expired}</option>
              <option value="inactive">{signupStatusLabel.inactive}</option>
              <option value="cancelled">{signupStatusLabel.cancelled}</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-900">{filteredRequests.length}</span> solicitudes
          </p>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-600">No hay solicitudes en este estado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 font-medium">Solicitante</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Fecha de solicitud</th>
                  <th className="pb-3 font-medium">Tipo de cuota</th>
                  <th className="pb-3 font-medium">Documentos</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => {
                  const badgeClass = statusBadgeClass[req.status] ?? 'bg-slate-100 text-slate-600';
                  const accreditationText =
                    req.membershipType === 'general'
                      ? 'No aplica'
                      : req.accreditationUploaded
                        ? 'Sí'
                        : 'No';

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/60">
                      <td className="py-3 font-medium text-slate-900">
                        {req.firstName} {req.lastName1} {req.lastName2}
                      </td>
                      <td className="py-3 text-slate-600">{req.email}</td>
                      <td className="py-3 text-slate-600">{formatSignupDate(req.requestedAt)}</td>
                      <td className="py-3 text-slate-600">
                        {signupMembershipSimpleLabel[req.membershipType]}
                      </td>
                      <td className="py-3 text-slate-600">
                        <div className="space-y-0.5">
                          <p>Justificante: {req.transferReceiptUploaded ? 'Sí' : 'No'}</p>
                          <p>Acreditación: {accreditationText}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
                        >
                          {signupStatusLabel[req.status] ?? req.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/admin/solicitudes/${req.id}`}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-50"
                        >
                          Revisar solicitud
                          <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export function AdminSignupDetailPage() {
  const { signupId } = useParams<{ signupId: string }>();
  const request = mockSignupRequests.find((r) => r.id === signupId);

  const [paymentAmount, setPaymentAmount] = useState<number | ''>(
    request ? (request.membershipType === 'reduced' ? 30 : 50) : '',
  );
  const [paymentDate, setPaymentDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [paymentReference, setPaymentReference] = useState('');
  const [activationMessage, setActivationMessage] = useState<string | null>(null);

  if (!request) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-4">
          <h1 className="font-serif text-2xl font-light text-slate-900">Solicitud no encontrada</h1>
          <p className="text-sm text-slate-600">
            No existe ninguna solicitud con el identificador indicado.
          </p>
          <Link
            to="/admin/solicitudes"
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800"
          >
            <ChevronLeft size={14} />
            Volver a solicitudes
          </Link>
        </div>
      </section>
    );
  }

  const fullName = `${request.firstName} ${request.lastName1} ${request.lastName2}`;
  const badgeClass = statusBadgeClass[request.status] ?? 'bg-slate-100 text-slate-600';
  const isReduced = request.membershipType === 'reduced';

  const today = new Date();
  const paidUntilPreview = new Date(today);
  paidUntilPreview.setMonth(paidUntilPreview.getMonth() + 12);
  const paidUntilPreviewLabel = paidUntilPreview.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handleActivate = () => {
    const paidUntil = new Date();
    paidUntil.setMonth(paidUntil.getMonth() + 12);
    const paidUntilLabel = paidUntil.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    setActivationMessage(`Socio activado (simulación). Vigencia hasta ${paidUntilLabel}.`);
  };

  return (
    <div className="space-y-8">
      <Link
        to="/admin/solicitudes"
        className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
      >
        <ChevronLeft size={14} />
        Volver a solicitudes
      </Link>

      {/* Cabecera */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-teal-700">Solicitud de alta</p>
            <h1 className="mt-2 font-serif text-3xl font-light text-slate-900">{fullName}</h1>
            <p className="mt-1 text-sm text-slate-500">{request.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
              {signupStatusLabel[request.status] ?? request.status}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {signupMembershipSimpleLabel[request.membershipType] ?? request.membershipType}
            </span>
          </div>
        </div>
      </section>

      {/* Datos de la solicitud */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Identificación */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <IdCard size={18} />
            </div>
            <h2 className="font-serif text-xl text-slate-900">Identificación</h2>
          </div>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Documento</dt>
              <dd className="mt-0.5 text-slate-700">
                {documentTypeLabel[request.documentType]} · {request.documentNumber}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Domicilio</dt>
              <dd className="mt-0.5 text-slate-700">{request.address}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Código postal</dt>
              <dd className="mt-0.5 text-slate-700">{request.postalCode}</dd>
            </div>
          </dl>
        </section>

        {/* Contacto */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <Mail size={18} />
            </div>
            <h2 className="font-serif text-xl text-slate-900">Contacto</h2>
          </div>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Email</dt>
              <dd className="mt-0.5 text-slate-700">{request.email}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Email de confirmación</dt>
              <dd className="mt-0.5 text-slate-700">{request.emailConfirmation}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Teléfono</dt>
              <dd className="mt-0.5 text-slate-700">{request.phone}</dd>
            </div>
          </dl>
        </section>

        {/* Perfil profesional */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <User size={18} />
            </div>
            <h2 className="font-serif text-xl text-slate-900">Perfil profesional</h2>
          </div>
          <dl className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Categoría profesional</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{request.professionalCategory}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Puesto de trabajo</dt>
              <dd className="mt-0.5 text-slate-700">{request.jobTitle}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Organización</dt>
              <dd className="mt-0.5 text-slate-700">{request.organization}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Vínculo con calidad y seguridad del paciente
              </dt>
              <dd className="mt-0.5 leading-relaxed text-slate-700">{request.qualitySafetyLink}</dd>
            </div>
          </dl>
        </section>

        {/* Cuota */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <CreditCard size={18} />
            </div>
            <h2 className="font-serif text-xl text-slate-900">Cuota</h2>
          </div>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Tipo de cuota</dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {signupMembershipTypeLabel[request.membershipType] ?? request.membershipType}
              </dd>
            </div>
            {isReduced && request.reducedFeeReason && (
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Motivo cuota reducida</dt>
                <dd className="mt-0.5 text-slate-700">
                  {signupReducedFeeReasonLabel[request.reducedFeeReason]}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Fecha de solicitud</dt>
              <dd className="mt-0.5 text-slate-700">{formatSignupDate(request.requestedAt)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Consentimientos</dt>
              <dd className="mt-0.5 text-slate-700">
                Comunicaciones: {request.communicationConsent ? 'Sí' : 'No'} · Datos: {request.dataProcessingConsent ? 'Sí' : 'No'}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Notas</dt>
              <dd className="mt-0.5 leading-relaxed text-slate-700">{request.notes}</dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Documentación adjunta */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl text-slate-900">Documentación adjunta</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Justificante de transferencia</p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {request.transferReceiptUploaded ? 'Subido' : 'No subido'}
            </p>
            {request.transferReceiptFileName && (
              <p className="mt-1 break-all text-xs text-slate-600">{request.transferReceiptFileName}</p>
            )}
            <button
              type="button"
              disabled
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 opacity-50 transition-colors cursor-not-allowed"
            >
              <FileText size={15} />
              Validar justificante
            </button>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Acreditación de cuota reducida</p>
            {isReduced ? (
              <>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {request.accreditationUploaded ? 'Subida' : 'No subida'}
                </p>
                {request.accreditationFileName && (
                  <p className="mt-1 break-all text-xs text-slate-600">{request.accreditationFileName}</p>
                )}
                <button
                  type="button"
                  disabled
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 opacity-50 transition-colors cursor-not-allowed"
                >
                  <ShieldCheck size={15} />
                  Validar acreditación
                </button>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-600">No aplica</p>
            )}
          </div>
        </div>
      </section>

      {/* Validación administrativa */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl text-slate-900">Validación administrativa</h2>
        <p className="mt-2 text-sm text-slate-600">
          Al activar hoy, la vigencia sería hasta <span className="font-medium text-slate-900">{paidUntilPreviewLabel}</span>.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 opacity-50 transition-colors cursor-not-allowed"
          >
            <CheckCircle size={15} />
            Activar socio
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 opacity-50 transition-colors cursor-not-allowed"
          >
            <XCircle size={15} />
            Denegar / cancelar solicitud
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 opacity-50 transition-colors cursor-not-allowed"
          >
            <Mail size={15} />
            Enviar comunicación de bienvenida
          </button>
        </div>
      </section>

      {/* Registro de pago */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl text-slate-900">Registro de pago (simulación)</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="payment-amount" className="block text-xs font-medium text-slate-500">
              Importe (€)
            </label>
            <input
              id="payment-amount"
              type="number"
              min={0}
              step={0.01}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div>
            <label htmlFor="payment-date" className="block text-xs font-medium text-slate-500">
              Fecha de pago
            </label>
            <input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div>
            <label htmlFor="payment-method" className="block text-xs font-medium text-slate-500">
              Método
            </label>
            <select
              id="payment-method"
              value="transfer"
              disabled
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 opacity-60"
            >
              <option value="transfer">Transferencia</option>
            </select>
          </div>
          <div>
            <label htmlFor="payment-reference" className="block text-xs font-medium text-slate-500">
              Referencia
            </label>
            <input
              id="payment-reference"
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Referencia de la operación"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 opacity-50 transition-colors cursor-not-allowed"
          >
            <CreditCard size={15} />
            Registrar pago
          </button>
          <button
            type="button"
            onClick={handleActivate}
            aria-disabled="true"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 opacity-50 transition-colors hover:bg-slate-50 cursor-not-allowed"
          >
            <CheckCircle size={15} />
            Activar socio
          </button>
        </div>
        {activationMessage && (
          <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-sm text-emerald-800/80">{activationMessage}</p>
          </div>
        )}
      </section>
    </div>
  );
}

const signupMembershipTypeLabel: Record<SignupMembershipType, string> = {
  general: 'General — 50 €/año',
  reduced: 'Reducida — 30 €/año',
};

const signupReducedFeeReasonLabel: Record<NonNullable<SignupReducedFeeReason>, string> = {
  resident: 'Residente en formación sanitaria especializada',
  student: 'Estudiante de rama sanitaria',
  retired: 'Profesional jubilado',
};

const documentTypeLabel: Record<SignupDocumentType, string> = {
  dni: 'DNI',
  nie: 'NIE',
  passport: 'Pasaporte',
};

const professionalCategoryOptions = [
  { value: '', label: 'Selecciona una categoría' },
  { value: 'Enfermero/a', label: 'Enfermero/a' },
  { value: 'Enfermero/a Especialista', label: 'Enfermero/a Especialista' },
  { value: 'Farmacéutico/a', label: 'Farmacéutico/a' },
  { value: 'Fisioterapeuta', label: 'Fisioterapeuta' },
  { value: 'Logopeda', label: 'Logopeda' },
  { value: 'Médico/a', label: 'Médico/a' },
  { value: 'Odontólogo/a', label: 'Odontólogo/a' },
  { value: 'Personal Administrativo', label: 'Personal Administrativo' },
  { value: 'Psicólogo/a', label: 'Psicólogo/a' },
  { value: 'Residente Formación Sanitaria Especializada', label: 'Residente Formación Sanitaria Especializada' },
  { value: 'Técnico en Cuidados Auxiliares de Enfermería', label: 'Técnico en Cuidados Auxiliares de Enfermería' },
  { value: 'Técnico Especialista', label: 'Técnico Especialista' },
  { value: 'Terapeuta Ocupacional', label: 'Terapeuta Ocupacional' },
  { value: 'Trabajador/a Social', label: 'Trabajador/a Social' },
  { value: 'Veterinario/a', label: 'Veterinario/a' },
  { value: 'Otras', label: 'Otras' },
];

const organizationOptions = [
  { value: '', label: 'Selecciona una organización' },
  { value: 'Área de Salud de Badajoz', label: 'Área de Salud de Badajoz' },
  { value: 'Área de Salud de Cáceres', label: 'Área de Salud de Cáceres' },
  { value: 'Área de Salud de Coria', label: 'Área de Salud de Coria' },
  { value: 'Área de Salud de Don Benito-Villanueva de la Serena', label: 'Área de Salud de Don Benito-Villanueva de la Serena' },
  { value: 'Área de Salud de Llerena-Zafra', label: 'Área de Salud de Llerena-Zafra' },
  { value: 'Área de Salud de Mérida', label: 'Área de Salud de Mérida' },
  { value: 'Área de Salud de Navalmoral de la Mata', label: 'Área de Salud de Navalmoral de la Mata' },
  { value: 'Área de Salud de Plasencia', label: 'Área de Salud de Plasencia' },
  { value: 'Mutuas Colaboradoras con la Seguridad Social', label: 'Mutuas Colaboradoras con la Seguridad Social' },
  { value: 'Organización de Pacientes', label: 'Organización de Pacientes' },
  { value: 'Sector Privado', label: 'Sector Privado' },
  { value: 'SEPAD', label: 'SEPAD' },
  { value: 'Servicios Centrales SES', label: 'Servicios Centrales SES' },
  { value: 'Universidad de Extremadura', label: 'Universidad de Extremadura' },
  { value: 'Otras', label: 'Otras' },
];

type SignupFormState = {
  firstName: string;
  lastName1: string;
  lastName2: string;
  documentType: SignupDocumentType;
  documentNumber: string;
  address: string;
  postalCode: string;
  email: string;
  emailConfirmation: string;
  phone: string;
  professionalCategory: string;
  jobTitle: string;
  organization: string;
  qualitySafetyLink: string;
  membershipType: SignupMembershipType;
  reducedFeeReason: SignupReducedFeeReason;
  transferReceiptUploaded: boolean;
  transferReceiptFileName: string | null;
  accreditationUploaded: boolean;
  accreditationFileName: string | null;
  communicationConsent: boolean;
  dataProcessingConsent: boolean;
};

const signupInitialState: SignupFormState = {
  firstName: '',
  lastName1: '',
  lastName2: '',
  documentType: 'dni',
  documentNumber: '',
  address: '',
  postalCode: '',
  email: '',
  emailConfirmation: '',
  phone: '',
  professionalCategory: '',
  jobTitle: '',
  organization: '',
  qualitySafetyLink: '',
  membershipType: 'general',
  reducedFeeReason: null,
  transferReceiptUploaded: false,
  transferReceiptFileName: null,
  accreditationUploaded: false,
  accreditationFileName: null,
  communicationConsent: false,
  dataProcessingConsent: false,
};

export function SignupPage() {
  const assetBase = import.meta.env.BASE_URL;
  const [form, setForm] = useState<SignupFormState>(signupInitialState);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');

  const updateField = <K extends keyof SignupFormState>(field: K, value: SignupFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.email !== form.emailConfirmation) {
      setEmailError('Los correos electrónicos no coinciden.');
      return;
    }
    setEmailError('');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-teal-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <CheckCircle size={28} />
            </div>
            <h1 className="mt-5 font-serif text-2xl font-light text-slate-900">Solicitud recibida</h1>
            <p className="mt-2 text-sm text-slate-600">
              Pendiente de revisión por el equipo de ACASPEX.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              El equipo revisará datos, justificante y acreditación si aplica.
            </p>
            <div className="mt-6 rounded-lg border border-amber-100 bg-amber-50/60 p-4">
              <p className="text-sm leading-relaxed text-amber-800/80">
                Microsoft Forms sigue disponible como vía alternativa mientras se valida el nuevo formulario.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800"
              >
                Volver al inicio
              </Link>
              <button
                type="button"
                onClick={() => {
                  setForm(signupInitialState);
                  setSubmitted(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Enviar otra solicitud
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const isReduced = form.membershipType === 'reduced';

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:py-14 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Cabecera */}
        <div className="mb-8 text-center">
          <img
            src={`${assetBase}assets/acaspex/logo-horizontal.png`}
            alt="ACASPEX"
            className="h-14 w-auto object-contain mx-auto"
          />
          <h1 className="font-serif text-3xl font-light text-slate-900 sm:text-4xl mt-3">Hazte socio de ACASPEX</h1>
          <p className="mt-2 text-sm text-slate-600">
            Formulario en fase de validación.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identificación */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <IdCard size={18} />
              </div>
              <h2 className="font-serif text-xl text-slate-900">Identificación</h2>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="signup-firstName" className="block text-sm font-medium text-slate-700">
                  Nombre
                </label>
                <input
                  id="signup-firstName"
                  type="text"
                  value={form.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
              <div>
                <label htmlFor="signup-lastName1" className="block text-sm font-medium text-slate-700">
                  Primer apellido
                </label>
                <input
                  id="signup-lastName1"
                  type="text"
                  value={form.lastName1}
                  onChange={(e) => updateField('lastName1', e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
              <div>
                <label htmlFor="signup-lastName2" className="block text-sm font-medium text-slate-700">
                  Segundo apellido
                </label>
                <input
                  id="signup-lastName2"
                  type="text"
                  value={form.lastName2}
                  onChange={(e) => updateField('lastName2', e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
              <div>
                <label htmlFor="signup-documentType" className="block text-sm font-medium text-slate-700">
                  Tipo de documento
                </label>
                <select
                  id="signup-documentType"
                  value={form.documentType}
                  onChange={(e) => updateField('documentType', e.target.value as SignupDocumentType)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                >
                  <option value="dni">{documentTypeLabel.dni}</option>
                  <option value="nie">{documentTypeLabel.nie}</option>
                  <option value="passport">{documentTypeLabel.passport}</option>
                </select>
              </div>
              <div>
                <label htmlFor="signup-documentNumber" className="block text-sm font-medium text-slate-700">
                  Número de documento
                </label>
                <input
                  id="signup-documentNumber"
                  type="text"
                  value={form.documentNumber}
                  onChange={(e) => updateField('documentNumber', e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
              <div>
                <label htmlFor="signup-address" className="block text-sm font-medium text-slate-700">
                  Domicilio
                </label>
                <input
                  id="signup-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
              <div>
                <label htmlFor="signup-postalCode" className="block text-sm font-medium text-slate-700">
                  Código postal
                </label>
                <input
                  id="signup-postalCode"
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>
          </section>

          {/* Contacto */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <Mail size={18} />
              </div>
              <h2 className="font-serif text-xl text-slate-900">Contacto</h2>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
              <div>
                <label htmlFor="signup-emailConfirmation" className="block text-sm font-medium text-slate-700">
                  Repetir email
                </label>
                <input
                  id="signup-emailConfirmation"
                  type="email"
                  value={form.emailConfirmation}
                  onChange={(e) => updateField('emailConfirmation', e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
              {emailError && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-red-600">{emailError}</p>
                </div>
              )}
              <div className="sm:col-span-2">
                <label htmlFor="signup-phone" className="block text-sm font-medium text-slate-700">
                  Teléfono móvil
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 sm:w-1/2"
                />
              </div>
            </div>
          </section>

          {/* Perfil profesional */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <User size={18} />
              </div>
              <h2 className="font-serif text-xl text-slate-900">Perfil profesional</h2>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="signup-professionalCategory" className="block text-sm font-medium text-slate-700">
                  Categoría profesional
                </label>
                <select
                  id="signup-professionalCategory"
                  value={form.professionalCategory}
                  onChange={(e) => updateField('professionalCategory', e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                >
                  {professionalCategoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="signup-jobTitle" className="block text-sm font-medium text-slate-700">
                  Puesto de trabajo
                </label>
                <input
                  id="signup-jobTitle"
                  type="text"
                  value={form.jobTitle}
                  onChange={(e) => updateField('jobTitle', e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="signup-organization" className="block text-sm font-medium text-slate-700">
                  Organización
                </label>
                <select
                  id="signup-organization"
                  value={form.organization}
                  onChange={(e) => updateField('organization', e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                >
                  {organizationOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="signup-qualitySafetyLink" className="block text-sm font-medium text-slate-700">
                  Vinculación con calidad asistencial y seguridad del paciente
                </label>
                <textarea
                  id="signup-qualitySafetyLink"
                  rows={3}
                  value={form.qualitySafetyLink}
                  onChange={(e) => updateField('qualitySafetyLink', e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>
          </section>

          {/* Tipo de socio */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <CreditCard size={18} />
              </div>
              <h2 className="font-serif text-xl text-slate-900">Tipo de socio</h2>
            </div>
            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="signup-membershipType" className="block text-sm font-medium text-slate-700">
                  Perfil de socio
                </label>
                <select
                  id="signup-membershipType"
                  value={`${form.membershipType}__${form.reducedFeeReason ?? 'none'}`}
                  onChange={(e) => {
                    const [type, reason] = e.target.value.split('__');
                    setForm((prev) => ({
                      ...prev,
                      membershipType: type as SignupMembershipType,
                      reducedFeeReason: type === 'general' ? null : (reason as SignupReducedFeeReason),
                    }));
                  }}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 sm:w-1/2"
                >
                  <option value="general__none">General</option>
                  <option value="reduced__resident">Residente en formación sanitaria especializada</option>
                  <option value="reduced__student">Estudiante de rama sanitaria</option>
                  <option value="reduced__retired">Profesional jubilado</option>
                </select>
              </div>

              <div className="rounded-lg bg-teal-50/60 border border-teal-100 p-3">
                <p className="text-sm text-teal-800">
                  {form.membershipType === 'general'
                    ? 'Cuota aplicable: 50 €/año'
                    : 'Cuota aplicable: 30 €/año — requiere acreditación'}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 space-y-3">
                <p className="text-sm font-medium text-slate-800">Información de pago</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>Cuota general: 50 €</li>
                  <li>Cuota reducida: 30 €</li>
                  <li>Pago por transferencia bancaria</li>
                </ul>
                <div className="rounded-lg bg-white border border-slate-200 p-3 text-sm text-slate-700 leading-relaxed">
                  <p>Para completar tu inscripción como socio/a de ACASPEX, solo tienes que realizar una transferencia de <strong>50 €</strong> en la cuenta <strong>ES46 0049 5247 8628 1701 097</strong>, indicando en el concepto:</p>
                  <p className="mt-1.5 font-mono text-xs text-slate-600 italic">"Abono cuota 2026 [Nombre y apellidos][DNI]"</p>
                </div>
                {form.membershipType !== 'general' && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2 border border-amber-200">
                    Si te corresponde cuota reducida, el importe aplicable es de <strong>30 €</strong> y será necesario aportar acreditación.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="signup-transferReceipt" className="block text-sm font-medium text-slate-700">
                  Justificante de transferencia
                </label>
                <div className="mt-1.5 flex items-center gap-3">
                  <input
                    id="signup-transferReceipt"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setForm((prev) => ({
                        ...prev,
                        transferReceiptUploaded: file !== null,
                        transferReceiptFileName: file?.name ?? null,
                      }));
                    }}
                    required
                    className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-100 file:px-4 file:py-2 file:font-medium file:text-teal-700 hover:file:bg-teal-200 sm:w-auto"
                  />
                </div>
                {form.transferReceiptFileName && (
                  <p className="mt-1 text-xs text-teal-700">
                    Archivo seleccionado: {form.transferReceiptFileName}
                  </p>
                )}
                <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                  <Info size={13} className="mt-0.5 shrink-0" />
                  En esta versión de validación no se realiza subida real al servidor.
                </p>
              </div>

              {isReduced && (
                <div>
                  <label htmlFor="signup-accreditation" className="block text-sm font-medium text-slate-700">
                    Acreditación de cuota reducida
                  </label>
                  <div className="mt-1.5 flex items-center gap-3">
                    <input
                      id="signup-accreditation"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setForm((prev) => ({
                          ...prev,
                          accreditationUploaded: file !== null,
                          accreditationFileName: file?.name ?? null,
                        }));
                      }}
                      required
                      className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-100 file:px-4 file:py-2 file:font-medium file:text-teal-700 hover:file:bg-teal-200 sm:w-auto"
                    />
                  </div>
                  {form.accreditationFileName && (
                    <p className="mt-1 text-xs text-teal-700">
                      Archivo seleccionado: {form.accreditationFileName}
                    </p>
                  )}
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                    <Info size={13} className="mt-0.5 shrink-0" />
                    En esta versión de validación no se realiza subida real al servidor.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Consentimientos */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <ShieldCheck size={18} />
              </div>
              <h2 className="font-serif text-xl text-slate-900">Consentimientos</h2>
            </div>
            <div className="mt-6 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.communicationConsent}
                  onChange={(e) => updateField('communicationConsent', e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                />
                <span className="text-sm text-slate-700">
                  Acepto recibir comunicaciones informativas de ACASPEX sobre actividades, recursos y novedades del portal.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.dataProcessingConsent}
                  onChange={(e) => updateField('dataProcessingConsent', e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                />
                <span className="text-sm text-slate-700">
                  He leído y acepto las indicaciones sobre tratamiento de datos personales
                </span>
              </label>
            </div>
            <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs leading-relaxed text-slate-600">
                Le informamos que los datos de carácter personal facilitados por usted, serán utilizados únicamente con la finalidad de gestionar su pertenencia a nuestra entidad. Los datos se mantendrán mientras dure la relación y una vez finalizado el servicio, durante los periodos legales obligatorios. Tiene derecho acceder a sus datos personales, solicitar la rectificación de los datos que sean inexactos o, en su caso, solicitar la supresión, cuando entre otros motivos, los datos ya no sean necesarios para los fines para los que fueron recogidos. Para ejercitar sus derechos comuníquese con nosotros a través de la dirección de correo electrónico <strong>acaspex@outlook.es</strong>.
              </p>
            </div>
          </section>

          {/* Fallback Microsoft Forms */}
          <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-4">
            <p className="text-sm leading-relaxed text-amber-800/80">
              Mientras validamos este formulario, también puedes usar el formulario anterior de Microsoft Forms.
            </p>
          </div>

          {/* Enviar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-800"
            >
              <Upload size={16} />
              Enviar solicitud
            </button>
            <Link
              to="/"
              className="text-center text-sm font-medium text-slate-500 transition-colors hover:text-teal-700 sm:text-left"
            >
              Volver al inicio
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
