
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import DashboardLayout from './components/layout/DashboardLayout';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminCases = lazy(() => import('./pages/admin/Cases'));
const AdminCaseDetailPage = lazy(() => import('./pages/admin/CaseDetailPage'));
const AdminTechnicians = lazy(() => import('./pages/admin/Technicians'));
const AdminTechnicianDetailPage = lazy(() => import('./pages/admin/TechnicianDetailPage'));
const AdminCalendar = lazy(() => import('./pages/admin/Calendar'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const TechDashboard = lazy(() => import('./pages/technician/Dashboard'));
const TechAllCases = lazy(() => import('./pages/technician/AllCases'));
const TechSettings = lazy(() => import('./pages/technician/Settings'));


const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-background dark:bg-dark-background">
    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const ProtectedRoute: React.FC<{ allowedRoles: string[] }> = ({ allowedRoles }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="cases" element={<AdminCases />} />
            <Route path="cases/:caseId" element={<AdminCaseDetailPage />} />
            <Route path="technicians" element={<AdminTechnicians />} />
            <Route path="technicians/:technicianId" element={<AdminTechnicianDetailPage />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Technician Routes */}
        <Route element={<ProtectedRoute allowedRoles={['technician']} />}>
          <Route path="/technician" element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<TechDashboard />} />
            <Route path="cases/:caseId" element={<AdminCaseDetailPage />} /> {/* Shared component */}
            <Route path="all-cases" element={<TechAllCases />} />
            <Route path="settings" element={<TechSettings />} />
          </Route>
        </Route>

        <Route path="*" element={
          user ? (
            user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/technician" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </Suspense>
  );
};

export default App;