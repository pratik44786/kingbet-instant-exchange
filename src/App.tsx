import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ExchangePage from './pages/ExchangePage';
import CasinoPage from './pages/CasinoPage';
import AviatorPage from './pages/AviatorPage';
import PlinkoPage from './pages/PlinkoPage';
import CrashPage from './pages/CrashPage';
import DicePage from './pages/DicePage';
import MinesPage from './pages/MinesPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import SuperAdminPage from './pages/SuperAdminPage';
import WalletPage from './pages/WalletPage';
import HistoryPage from './pages/HistoryPage';

// Root level redirect logic to fix Landing Page issue
const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Agar login hai toh decide karo kahan bhejna hai
  if (isAuthenticated && user) {
    if (user.role === 'superadmin') return <Navigate to="/superadmin" replace />;
    if (user.role === 'admin' || user.role === 'agent') return <Navigate to="/admin" replace />;
    return <Navigate to="/exchange" replace />; // Regular users ke liye
  }
  
  // Agar login nahi hai toh login page par
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppProvider>
            <Routes>
              {/* 1️⃣ Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* 2️⃣ Auth Guarded Routes with Layout */}
              <Route element={<ProtectedRoute><Layout><RootRedirect /></Layout></ProtectedRoute>} path="/" />
              
              <Route path="/exchange" element={<ProtectedRoute><Layout><ExchangePage /></Layout></ProtectedRoute>} />
              <Route path="/landing" element={<ProtectedRoute><Layout><LandingPage /></Layout></ProtectedRoute>} />
              
              {/* Casino Section */}
              <Route path="/casino" element={<ProtectedRoute><Layout><CasinoPage /></Layout></ProtectedRoute>} />
              <Route path="/casino/aviator" element={<ProtectedRoute><Layout><AviatorPage /></Layout></ProtectedRoute>} />
              <Route path="/casino/plinko" element={<ProtectedRoute><Layout><PlinkoPage /></Layout></ProtectedRoute>} />
              <Route path="/casino/crash" element={<ProtectedRoute><Layout><CrashPage /></Layout></ProtectedRoute>} />
              <Route path="/casino/dice" element={<ProtectedRoute><Layout><DicePage /></Layout></ProtectedRoute>} />
              <Route path="/casino/mines" element={<ProtectedRoute><Layout><MinesPage /></Layout></ProtectedRoute>} />
              
              {/* Quick Game Routes */}
              <Route path="/aviator" element={<ProtectedRoute><Layout><AviatorPage /></Layout></ProtectedRoute>} />
              <Route path="/plinko" element={<ProtectedRoute><Layout><PlinkoPage /></Layout></ProtectedRoute>} />
              
              {/* User Management */}
              <Route path="/wallet" element={<ProtectedRoute><Layout><WalletPage /></Layout></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><Layout><HistoryPage /></Layout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
              
              {/* Admin Panels */}
              <Route path="/admin" element={<ProtectedRoute><Layout><AdminPage /></Layout></ProtectedRoute>} />
              <Route path="/superadmin" element={<ProtectedRoute><Layout><SuperAdminPage /></Layout></ProtectedRoute>} />

              {/* 3️⃣ Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
