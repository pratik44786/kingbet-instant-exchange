import React, { Suspense, lazy, ComponentType } from 'react';
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

// Retry wrapper for lazy imports — retries 3 times on chunk load failure
function lazyRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 3
): React.LazyExoticComponent<T> {
  return lazy(() => {
    const attempt = (remaining: number): Promise<{ default: T }> =>
      importFn().catch((err) => {
        if (remaining <= 0) throw err;
        return new Promise<{ default: T }>((res) =>
          setTimeout(() => res(attempt(remaining - 1)), 1000)
        );
      });
    return attempt(retries);
  });
}

// Eagerly loaded (critical pages - must load instantly)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// Lazy loaded with retry
const ExchangePage = lazyRetry(() => import('./pages/ExchangePage'));
const CasinoPage = lazyRetry(() => import('./pages/CasinoPage'));
const ProfilePage = lazyRetry(() => import('./pages/ProfilePage'));
const AdminPage = lazyRetry(() => import('./pages/AdminPage'));
const SuperAdminPage = lazyRetry(() => import('./pages/SuperAdminPage'));
const WalletPage = lazyRetry(() => import('./pages/WalletPage'));
const HistoryPage = lazyRetry(() => import('./pages/HistoryPage'));
const AviatorPage = lazyRetry(() => import('./pages/AviatorPage'));
const CrashPage = lazyRetry(() => import('./pages/CrashPage'));
const DicePage = lazyRetry(() => import('./pages/DicePage'));
const MinesPage = lazyRetry(() => import('./pages/MinesPage'));
const PlinkoPage = lazyRetry(() => import('./pages/PlinkoPage'));
const DashboardLayout = lazyRetry(() => import('./components/DashboardLayout'));

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
