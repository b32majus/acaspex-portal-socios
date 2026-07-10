import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { MemberLayout } from '../components/layout/MemberLayout';
import { RequireAuth } from '../components/RequireAuth';
import { RequireMember } from '../components/RequireMember';
import { RequireAdmin } from '../components/RequireAdmin';
import { RequireBoardOrAdmin } from '../components/RequireBoardOrAdmin';
import {
  AdminDashboardPage,
  AdminRenewalsPage,
  AdminSignupDetailPage,
  AdminSignupRequestsPage,
  LoginPage,
  MaterialCorporativoPage,
  MemberAccountPage,
  MemberHomePage,
  MemberLibraryPage,
  MemberProjectBankPage,
  MemberProjectDetailPage,
  SignupPage,
} from './placeholderPages';
import { AdminResourcesPage } from '../components/resources/AdminResourcesPage';
import { AdminResourceEditorPage } from '../components/resources/AdminResourceEditorPage';
import { AdminResourceNewPage } from '../components/resources/AdminResourceNewPage';
import { AdminResourceCategoriesPage } from '../components/resources/AdminResourceCategoriesPage';
import { MemberResourceDetailPage } from '../components/resources/MemberResourceDetailPage';
import { AdminMembersPage } from '../components/members/AdminMembersPage';
import { AdminMemberDetailPage } from '../components/members/AdminMemberDetailPage';
import { AdminMemberNewPage } from '../components/members/AdminMemberNewPage';
import { MockPublicSubmissionPage } from '../components/jornadas/mock/MockPublicSubmissionPage';
import { MockAdminComunicacionesPage } from '../components/jornadas/mock/MockAdminComunicacionesPage';
import { MockEvaluadorPage } from '../components/jornadas/mock/MockEvaluadorPage';
import { AdminComunicacionesPage } from '../components/jornadas/AdminComunicacionesPage';
import { AdminJornadasHubPage } from '../components/jornadas/AdminJornadasHubPage';
import { EvaluadorComunicacionesPage } from '../components/jornadas/EvaluadorComunicacionesPage';

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/hazte-socio" element={<SignupPage />} />
        <Route
          element={
            <RequireMember>
              <MemberLayout />
            </RequireMember>
          }
        >
          <Route path="/socios" element={<MemberHomePage />} />
          <Route path="/socios/recursos" element={<MemberLibraryPage />} />
          <Route path="/socios/recursos/:resourceId" element={<MemberResourceDetailPage />} />
          <Route path="/socios/proyectos" element={<MemberProjectBankPage />} />
          <Route path="/socios/proyectos/:projectId" element={<MemberProjectDetailPage />} />
          <Route path="/socios/mi-cuenta" element={<MemberAccountPage />} />
        </Route>
        <Route
          element={
            <RequireBoardOrAdmin>
              <MemberLayout />
            </RequireBoardOrAdmin>
          }
        >
          <Route path="/socios/material-corporativo" element={<MaterialCorporativoPage />} />
        </Route>
        <Route
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/socios" element={<AdminMembersPage />} />
          <Route path="/admin/socios/nuevo" element={<AdminMemberNewPage />} />
          <Route path="/admin/socios/:memberId" element={<AdminMemberDetailPage />} />
          <Route path="/admin/solicitudes" element={<AdminSignupRequestsPage />} />
          <Route path="/admin/solicitudes/:signupId" element={<AdminSignupDetailPage />} />
          <Route path="/admin/recursos" element={<AdminResourcesPage />} />
          <Route path="/admin/recursos/nuevo" element={<AdminResourceNewPage />} />
          <Route path="/admin/recursos/subsecciones" element={<AdminResourceCategoriesPage />} />
          <Route path="/admin/recursos/:resourceId" element={<AdminResourceEditorPage />} />
          <Route path="/admin/renovaciones" element={<AdminRenewalsPage />} />
          <Route path="/admin/jornadas" element={<AdminJornadasHubPage />} />
          <Route path="/admin/jornadas/comunicaciones" element={<AdminComunicacionesPage />} />
        </Route>
        {/* Real evaluator route — authenticated, read-only */}
        <Route
          element={
            <RequireAuth>
              <MemberLayout />
            </RequireAuth>
          }
        >
          <Route path="/jornadas/evaluacion" element={<EvaluadorComunicacionesPage />} />
        </Route>
        {/* Mock routes — Jornadas ACASPEX (sin auth, datos simulados) */}
        <Route path="/jornadas/iii-jornada/comunicaciones" element={<MockPublicSubmissionPage />} />
        <Route path="/admin/jornadas/mock-comunicaciones" element={<MockAdminComunicacionesPage />} />
        <Route path="/jornadas/evaluacion/mock" element={<MockEvaluadorPage />} />
      </Routes>
    </Router>
  );
}
