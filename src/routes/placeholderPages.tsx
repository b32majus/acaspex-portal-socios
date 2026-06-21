import { Link, useLocation, useParams } from 'react-router-dom';
import { BookOpen, CalendarCheck, ChevronRight, FileText, User } from 'lucide-react';
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
      <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">ACASPEX</p>
        <h1 className="mt-2 text-3xl font-semibold">Acceso socios</h1>
        <p className="mt-3 text-slate-600">Accede al area privada de socios de ACASPEX.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link className="rounded-full bg-teal-700 px-5 py-3 text-center text-sm font-medium text-white" to="/socios">
            Entrar como socio
          </Link>
        </div>
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
};

const typeLabel: Record<string, string> = {
  pdf: 'PDF',
  video: 'Vídeo',
  template: 'Plantilla',
  link: 'Enlace',
  presentation: 'Presentación',
};

const statusBadgeClass: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  expired: 'bg-red-100 text-red-700',
  pending_review: 'bg-amber-100 text-amber-700',
  inactive: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-50 text-red-500',
};

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
      {/* Section 1 — Hero / bienvenida */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">ACASPEX</p>
        <p className="mt-3 text-2xl font-semibold text-slate-900">Hola, {member.firstName}</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-800">Bienvenida al área de socios de ACASPEX</h1>
        <p className="mt-2 text-sm text-slate-600">
          Accede a recursos, materiales y contenidos exclusivos para la comunidad ACASPEX.
        </p>
      </section>

      {/* Section 2 — Estado de membresia */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <User size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Estado de tu membresia</h2>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p>{member.firstName} {member.lastName1} {member.lastName2}</p>
              <p>Tipo de cuota: {member.membershipType === 'general' ? 'General' : 'Reducida'}</p>
              <p>Válido hasta: {member.paidUntil ? member.paidUntil.split('-').reverse().join('/') : '—'}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
                {statusLabel}
              </span>
              <Link
                to="/socios/mi-cuenta"
                className="inline-flex items-center gap-1 rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
              >
                Ver mi cuenta
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Biblioteca */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <BookOpen size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Biblioteca de recursos</h2>
            <p className="mt-2 text-sm text-slate-600">
              Consulta guias, plantillas, grabaciones y materiales preparados para socios.
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
        <h2 className="text-lg font-semibold text-slate-900">Ultimos recursos publicados</h2>

        {publishedResources.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">
              Aun no hay recursos publicados. Proximamente encontraras aqui materiales para socios.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publishedResources.map((resource) => (
              <article
                key={resource.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
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
                <p className="mt-1 text-sm text-slate-600">{resource.subtitle}</p>
                <div className="mt-4 pt-3">
                  <Link
                    to={`/socios/recursos/${resource.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800"
                  >
                    Ver recurso
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Section 5 — Mensaje ACASPEX */}
      <section className="rounded-2xl border border-teal-100 bg-teal-50/50 p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">ACASPEX</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          ACASPEX impulsa una comunidad comprometida con la calidad asistencial y la seguridad del paciente. Este espacio reunirá materiales, formación y herramientas para acompañar ese trabajo compartido.
        </p>
      </section>
    </div>
  );
}

export function MemberLibraryPage() {
  const publishedResources = mockResources
    .filter((r) => r.status === 'published' && r.id !== 'res-004')
    .sort((a, b) => (b.publishedAt!).localeCompare(a.publishedAt!));

  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* Summary */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-700">
          Recursos disponibles:{' '}
          <span className="font-semibold text-slate-900">{publishedResources.length}</span>
        </p>
      </section>

      {/* Resource list or empty state */}
      {publishedResources.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            Aún no hay recursos publicados. Próximamente encontrarás aquí materiales para socios.
          </p>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publishedResources.map((resource) => (
            <article
              key={resource.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                  {categoryLabel[resource.category] ?? resource.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <FileText size={12} />
                  {typeLabel[resource.type] ?? resource.type}
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-900">{resource.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{resource.subtitle}</p>
              {resource.fileLabel && (
                <p className="mt-2 text-xs text-slate-500">{resource.fileLabel}</p>
              )}
              <div className="mt-4 border-t border-slate-100 pt-3">
                <Link
                  to={`/socios/recursos/${resource.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800"
                >
                  Ver recurso
                  <ChevronRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
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

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">{resourceItem.title}</h1>
        <p className="mt-1 text-slate-600">{resourceItem.subtitle}</p>
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
