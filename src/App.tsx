import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ExchangePage from './pages/ExchangePage';
import CasinoPage from './pages/CasinoPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import SuperAdminPage from './pages/SuperAdminPage';
import WalletPage from './pages/WalletPage';
import HistoryPage from './pages/HistoryPage';

// Smart Redirect to bypass Landing page after login
const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  const role = (user?.role as string);
  if (role === 'superadmin') return <Navigate to="/superadmin" replace />;
  if (role === 'admin' || role === 'agent') return <Navigate to="/admin" replace />;
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
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected with Layout */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/exchange" element={<ExchangePage />} />
                <Route path="/casino" element={<CasinoPage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/superadmin" element={<SuperAdminPage />} />
                {/* Add other casino game routes here similarly */}
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
