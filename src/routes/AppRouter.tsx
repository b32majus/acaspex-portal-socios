import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { MemberLayout } from '../components/layout/MemberLayout';
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
          <Route path="/admin/socios/:memberId" element={<AdminMemberDetailPage />} />
          <Route path="/admin/solicitudes" element={<AdminSignupRequestsPage />} />
          <Route path="/admin/solicitudes/:signupId" element={<AdminSignupDetailPage />} />
          <Route path="/admin/recursos" element={<AdminResourcesPage />} />
          <Route path="/admin/recursos/nuevo" element={<AdminResourceNewPage />} />
          <Route path="/admin/recursos/subsecciones" element={<AdminResourceCategoriesPage />} />
          <Route path="/admin/recursos/:resourceId" element={<AdminResourceEditorPage />} />
          <Route path="/admin/renovaciones" element={<AdminRenewalsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
