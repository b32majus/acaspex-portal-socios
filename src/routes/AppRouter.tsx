import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { MemberLayout } from '../components/layout/MemberLayout';
import {
  AdminDashboardPage,
  AdminMemberDetailPage,
  AdminMembersPage,
  AdminRenewalsPage,
  AdminResourceEditorPage,
  AdminResourcesPage,
  LoginPage,
  MemberAccountPage,
  MemberHomePage,
  MemberLibraryPage,
  MemberResourceDetailPage,
} from './placeholderPages';

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<MemberLayout />}>
          <Route path="/socios" element={<MemberHomePage />} />
          <Route path="/socios/recursos" element={<MemberLibraryPage />} />
          <Route path="/socios/recursos/:resourceId" element={<MemberResourceDetailPage />} />
          <Route path="/socios/mi-cuenta" element={<MemberAccountPage />} />
        </Route>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/socios" element={<AdminMembersPage />} />
          <Route path="/admin/socios/:memberId" element={<AdminMemberDetailPage />} />
          <Route path="/admin/recursos" element={<AdminResourcesPage />} />
          <Route path="/admin/recursos/:resourceId" element={<AdminResourceEditorPage />} />
          <Route path="/admin/renovaciones" element={<AdminRenewalsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
