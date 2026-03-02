import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ExchangePage from './pages/ExchangePage';
import CasinoPage from './pages/CasinoPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import SuperAdminPage from './pages/SuperAdminPage';
import WalletPage from './pages/WalletPage';
import HistoryPage from './pages/HistoryPage';

// Smart redirect: authenticated users go to dashboard, else landing
const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <LandingPage />;

  const role = user?.role as string;
  if (role === 'superadmin') return <Navigate to="/superadmin" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/exchange" replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppProvider>
            <Routes>
              {/* Public */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected with Dashboard Layout */}
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/exchange" element={<ExchangePage />} />
                <Route path="/casino" element={<CasinoPage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<RoleGuard allowedRoles={['admin', 'superadmin']}><AdminPage /></RoleGuard>} />
                <Route path="/superadmin" element={<RoleGuard allowedRoles={['superadmin']}><SuperAdminPage /></RoleGuard>} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
