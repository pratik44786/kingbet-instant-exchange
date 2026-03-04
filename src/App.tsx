import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'sonner';

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-[#0b1221] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4" />
      <p className="text-gray-300">Loading...</p>
    </div>
  </div>
);

// Lazy loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ExchangePage = lazy(() => import('./pages/ExchangePage'));
const CasinoPage = lazy(() => import('./pages/CasinoPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const SuperAdminPage = lazy(() => import('./pages/SuperAdminPage'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const AviatorPage = lazy(() => import('./pages/AviatorPage'));
const CrashPage = lazy(() => import('./pages/CrashPage'));
const DicePage = lazy(() => import('./pages/DicePage'));
const MinesPage = lazy(() => import('./pages/MinesPage'));
const PlinkoPage = lazy(() => import('./pages/PlinkoPage'));

// Lazy loaded layout
const DashboardLayout = lazy(() => import('./components/DashboardLayout'));

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Role guard wrapper
const RoleGuard: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/exchange" replace />;
  }
  return <>{children}</>;
};

// Smart redirect based on auth + role
const RootRedirect = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <LandingPage />;
  if (user?.role === 'superadmin') return <Navigate to="/superadmin" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/exchange" replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected routes with Dashboard Layout */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppProvider>
                      <DashboardLayout />
                    </AppProvider>
                  </ProtectedRoute>
                }
              >
                <Route path="/exchange" element={<ExchangePage />} />
                <Route path="/casino" element={<CasinoPage />} />
                <Route path="/casino/aviator" element={<AviatorPage />} />
                <Route path="/casino/crash" element={<CrashPage />} />
                <Route path="/casino/dice" element={<DicePage />} />
                <Route path="/casino/mines" element={<MinesPage />} />
                <Route path="/casino/plinko" element={<PlinkoPage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route
                  path="/admin"
                  element={
                    <RoleGuard allowedRoles={['admin', 'superadmin']}>
                      <AdminPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/superadmin"
                  element={
                    <RoleGuard allowedRoles={['superadmin']}>
                      <SuperAdminPage />
                    </RoleGuard>
                  }
                />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
