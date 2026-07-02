import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'sonner';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Plans = lazy(() => import('./pages/Plans'));
const Referral = lazy(() => import('./pages/Referral'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Deposit = lazy(() => import('./pages/Deposit'));
const Withdraw = lazy(() => import('./pages/Withdraw'));
const KYC = lazy(() => import('./pages/KYC'));
const Security = lazy(() => import('./pages/Security'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));
const Legal = lazy(() => import('./pages/Legal'));
const FAQ = lazy(() => import('./pages/FAQ'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="h-10 w-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
  </div>
);

const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Loader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
              <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
              <Route path="/deposit" element={<Protected><Deposit /></Protected>} />
              <Route path="/withdraw" element={<Protected><Withdraw /></Protected>} />
              <Route path="/kyc" element={<Protected><KYC /></Protected>} />
              <Route path="/security" element={<Protected><Security /></Protected>} />
              <Route path="/profile" element={<Protected><Profile /></Protected>} />
              <Route path="/admin" element={<Protected><Admin /></Protected>} />
              <Route path="/terms" element={<Legal doc="terms" />} />
              <Route path="/privacy" element={<Legal doc="privacy" />} />
              <Route path="/aml" element={<Legal doc="aml" />} />
              <Route path="/risk" element={<Legal doc="risk" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster position="top-right" theme="dark" richColors closeButton />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
