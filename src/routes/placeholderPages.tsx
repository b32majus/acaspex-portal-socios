import { Link, useLocation, useParams } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  FileText,
  Globe,
  GraduationCap,
  Handshake,
  Mail,
  MessageCircle,
  Settings,
  TrendingUp,
  User,
  Users,
  Video,
  Wrench,
} from 'lucide-react';
import { mockMembers } from '../data/mockMembers';
import { mockResources } from '../data/mockResources';

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
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <section className="relative mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">ACASPEX</p>
        <h1 className="mt-2 text-3xl font-semibold">Acceso socios</h1>
        <p className="mt-3 text-slate-600">Accede al area privada de socios de ACASPEX.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link className="rounded-full bg-teal-700 px-5 py-3 text-center text-sm font-medium text-white" to="/socios">
            Entrar como socio
          </Link>
        </div>
        <Link
          to="/admin"
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
          title="Acceso administrador"
          aria-label="Acceso administrador"
        >
          <Settings size={16} />
        </Link>
      </section>
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
            <div className={`flex h-full w-full flex-col items-center justify-center ${tone.bg}`}>
              <ToneIcon size={32} className={tone.color} />
              <span className={`mt-1.5 text-xs font-medium ${tone.color}`}>{tone.label}</span>
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
      {/* Section 1 — Hero + membresía lateral */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium uppercase tracking-wide text-teal-700">ACASPEX</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">Hola, {member.firstName}</p>
            <h1 className="mt-1 text-xl font-semibold text-slate-800">Bienvenida al área de socios de ACASPEX</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Tu espacio privado con recursos, formación y herramientas para impulsar la calidad asistencial y la seguridad del paciente.
            </p>
          </div>
          <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50/80 p-4 lg:w-56">
            <div className="flex items-center gap-2">
              <User size={16} className="text-teal-700" />
              <span className="text-sm font-semibold text-slate-900">Tu membresía</span>
            </div>
            <div className="mt-2 space-y-1 text-xs text-slate-600">
              <p>{member.firstName} {member.lastName1} {member.lastName2}</p>
              <p>Tipo: {member.membershipType === 'general' ? 'General' : 'Reducida'}</p>
              <p>Vence: {member.paidUntil ? member.paidUntil.split('-').reverse().join('/') : '—'}</p>
            </div>
            <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>
              {statusLabel}
            </span>
            <div className="mt-3">
              <Link
                to="/socios/mi-cuenta"
                className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800"
              >
                Ver mi cuenta
                <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Qué encontrarás aquí */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">Qué encontrarás aquí</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <BookOpen size={24} className="text-teal-700" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">Biblioteca de recursos</h3>
            <p className="mt-1 text-xs text-slate-600">Guías, plantillas y materiales descargables validados por ACASPEX.</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <Video size={24} className="text-teal-700" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">Formación y metodología</h3>
            <p className="mt-1 text-xs text-slate-600">Grabaciones, presentaciones y contenidos formativos para socios.</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <FileText size={24} className="text-teal-700" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">Materiales corporativos</h3>
            <p className="mt-1 text-xs text-slate-600">Documentos institucionales, modelos y recursos de representación.</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <Users size={24} className="text-teal-700" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">Comunidad</h3>
            <p className="mt-1 text-xs text-slate-600">Conecta con otros socios, participa en grupos y mantente al día.</p>
          </div>
        </div>
      </section>

      {/* Section 3 — Acceso destacado a biblioteca */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <BookOpen size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Biblioteca de recursos</h2>
            <p className="mt-2 text-sm text-slate-600">
              Consulta guías, plantillas, grabaciones y materiales preparados para socios.
            </p>
            <div className="mt-4">
              <Link
                to="/socios/recursos"
                className="inline-flex items-center gap-1 rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
              >
                Ir a biblioteca
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — Recursos recientes */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Últimos recursos publicados</h2>

        {publishedResources.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">
              Aún no hay recursos publicados. Próximamente encontrarás aquí materiales para socios.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publishedResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </section>

      {/* Section 5 — Comunidad ACASPEX */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <Users size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Comunidad ACASPEX</h2>
            <p className="mt-2 text-sm text-slate-600">
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
      <section className="rounded-2xl border border-teal-100 bg-teal-50/50 p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">ACASPEX</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          ACASPEX impulsa una comunidad comprometida con la calidad asistencial y la seguridad del paciente. Este espacio reúne materiales, formación y herramientas para acompañar ese trabajo compartido.
        </p>
      </section>
    </div>
  );
}

export function MemberLibraryPage() {
  const publishedResources = mockResources
    .filter((r) => r.status === 'published' && r.id !== 'res-004')
    .sort((a, b) => (b.publishedAt!).localeCompare(a.publishedAt!));

  const featuredResources = publishedResources.filter((r) => r.featured === true);

  const sections = visualToneOrder.map((tone) => ({
    tone,
    label: visualToneLabel[tone] ?? tone,
    resources: publishedResources.filter((r) => r.visualTone === tone),
  }));

  const renderResourceCard = (resource: (typeof publishedResources)[number]) => (
    <ResourceCard key={resource.id} resource={resource} />
  );

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <BookOpen size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold text-slate-900">Biblioteca de recursos</h1>
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
            {featuredResources.map(renderResourceCard)}
          </div>
        </section>
      )}

      {sections.map((section) => (
        <section key={section.tone} className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">{section.label}</h2>
          {section.resources.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-600">Próximamente: {section.label}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.resources.map(renderResourceCard)}
            </div>
          )}
        </section>
      ))}
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
            Volver a biblioteca
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
        Volver a biblioteca
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
            const ToneIcon = tone.icon;
            return (
              <div className={`flex aspect-video w-full flex-col items-center justify-center ${tone.bg}`}>
                <ToneIcon size={40} className={tone.color} />
                <span className={`mt-2 text-sm font-medium ${tone.color}`}>{tone.label}</span>
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
