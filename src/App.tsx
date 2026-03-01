// Relative import! Not '@contexts/AuthContext'
import { AuthProvider } from './contexts/AuthContext';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ExchangePage from '@/pages/ExchangePage';
import CasinoPage from '@/pages/CasinoPage';
import AviatorPage from '@/pages/AviatorPage';
import PlinkoPage from '@/pages/PlinkoPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import AdminPage from '@/pages/AdminPage';
import SuperAdminPage from '@/pages/SuperAdminPage';
import WalletPage from '@/pages/WalletPage';
import HistoryPage from '@/pages/HistoryPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes - No Layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes with Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <LandingPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/exchange"
            element={
              <ProtectedRoute>
                <Layout>
                  <ExchangePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/casino"
            element={
              <ProtectedRoute>
                <Layout>
                  <CasinoPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/aviator"
            element={
              <ProtectedRoute>
                <Layout>
                  <AviatorPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/plinko"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlinkoPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Layout>
                  <WalletPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <HistoryPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute>
                <Layout>
                  <SuperAdminPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback - 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute>
                <Layout>
                  <SuperAdminPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
