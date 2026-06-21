import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { MemberLayout } from '../components/layout/MemberLayout';
import {
  AdminDashboardPage,
  AdminMemberDetailPage,
  AdminMembersPage,
  AdminRenewalsPage,
  AdminResourceEditorPage,
  AdminResourceNewPage,
  AdminResourcesPage,
  AdminSignupDetailPage,
  AdminSignupRequestsPage,
  LoginPage,
  MemberAccountPage,
  MemberHomePage,
  MemberLibraryPage,
  MemberProjectBankPage,
  MemberProjectDetailPage,
  MemberResourceDetailPage,
  SignupPage,
} from './placeholderPages';

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/hazte-socio" element={<SignupPage />} />
        <Route element={<MemberLayout />}>
          <Route path="/socios" element={<MemberHomePage />} />
          <Route path="/socios/recursos" element={<MemberLibraryPage />} />
          <Route path="/socios/recursos/:resourceId" element={<MemberResourceDetailPage />} />
          <Route path="/socios/proyectos" element={<MemberProjectBankPage />} />
          <Route path="/socios/proyectos/:projectId" element={<MemberProjectDetailPage />} />
          <Route path="/socios/mi-cuenta" element={<MemberAccountPage />} />
        </Route>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/socios" element={<AdminMembersPage />} />
          <Route path="/admin/socios/:memberId" element={<AdminMemberDetailPage />} />
          <Route path="/admin/solicitudes" element={<AdminSignupRequestsPage />} />
          <Route path="/admin/solicitudes/:signupId" element={<AdminSignupDetailPage />} />
          <Route path="/admin/recursos" element={<AdminResourcesPage />} />
          <Route path="/admin/recursos/nuevo" element={<AdminResourceNewPage />} />
          <Route path="/admin/recursos/:resourceId" element={<AdminResourceEditorPage />} />
          <Route path="/admin/renovaciones" element={<AdminRenewalsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
