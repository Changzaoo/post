import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Composer } from './pages/Composer';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { Calendar } from './pages/Calendar';
import { Metrics } from './pages/Metrics';
import { Reels } from './pages/Reels';
import { Admin } from './pages/Admin';
import { Funil } from './pages/Funil';
import { FunnelPage } from './pages/FunnelPage';
import { RetentionPage } from './pages/RetentionPage';
import { StrategiesPage } from './pages/StrategiesPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { ContentsPage } from './pages/ContentsPage';
import { ChecklistPage } from './pages/ChecklistPage';
import { AIPage } from './pages/AIPage';
import type { ReactNode } from 'react';

function Spinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page,#020818)' }}>
      <div style={{ width: 36, height: 36, border: '2px solid rgba(59,110,255,0.15)', borderTopColor: '#3B6EFF', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;

  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Protected — Growth OS */}
      <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/funil"          element={<ProtectedRoute><FunnelPage /></ProtectedRoute>} />
      <Route path="/retencao"       element={<ProtectedRoute><RetentionPage /></ProtectedRoute>} />
      <Route path="/estrategias"    element={<ProtectedRoute><StrategiesPage /></ProtectedRoute>} />
      <Route path="/campanhas"      element={<ProtectedRoute><CampaignsPage /></ProtectedRoute>} />
      <Route path="/conteudos"      element={<ProtectedRoute><ContentsPage /></ProtectedRoute>} />
      <Route path="/checklist"      element={<ProtectedRoute><ChecklistPage /></ProtectedRoute>} />
      <Route path="/ia"             element={<ProtectedRoute><AIPage /></ProtectedRoute>} />

      {/* Protected — Publishing */}
      <Route path="/composer"       element={<ProtectedRoute><Composer /></ProtectedRoute>} />
      <Route path="/calendar"       element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
      <Route path="/history"        element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/metrics"        element={<ProtectedRoute><Metrics /></ProtectedRoute>} />
      <Route path="/reels"          element={<ProtectedRoute><Reels /></ProtectedRoute>} />
      <Route path="/settings"       element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/admin"          element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="/funil-relevancia" element={<ProtectedRoute><Funil /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
