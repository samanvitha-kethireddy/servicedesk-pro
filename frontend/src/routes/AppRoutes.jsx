import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import TicketsListPage from '../pages/TicketsListPage';
import CreateTicketPage from '../pages/CreateTicketPage';
import TicketDetailPage from '../pages/TicketDetailPage';
import AssetsPage from '../pages/AssetsPage';
import KnowledgeBasePage from '../pages/KnowledgeBasePage';
import UserManagementPage from '../pages/UserManagementPage';
import AuditLogPage from '../pages/AuditLogPage';
import NotFoundPage from '../pages/NotFoundPage';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { useState } from 'react';
import { ROLES } from '../utils/constants';
import ProfilePage from '../pages/ProfilePage';
import DepartmentsPage from '../pages/DepartmentsPage';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-5">{children}</main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>
      } />

      <Route path="/tickets" element={
        <ProtectedRoute><AppLayout><TicketsListPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/tickets/new" element={
        <ProtectedRoute><AppLayout><CreateTicketPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/tickets/:id" element={
        <ProtectedRoute><AppLayout><TicketDetailPage /></AppLayout></ProtectedRoute>
      } />

      <Route path="/assets" element={
        <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ASSET_MANAGER, ROLES.IT_MANAGER, ROLES.TECHNICIAN]}>
          <AppLayout><AssetsPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/knowledge-base" element={
        <ProtectedRoute><AppLayout><KnowledgeBasePage /></AppLayout></ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.IT_MANAGER]}>
          <AppLayout><UserManagementPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/audit-logs" element={
        <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.IT_MANAGER]}>
          <AppLayout><AuditLogPage /></AppLayout>
        </ProtectedRoute>
      } />


<Route path="/profile" element={
  <ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>
} />

<Route path="/departments" element={
  <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]}>
    <AppLayout><DepartmentsPage /></AppLayout>
  </ProtectedRoute>
} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;