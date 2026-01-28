import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationContainer } from './components/NotificationContainer';
import EXLLogo from './components/EXLLogo';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import PipelineDAG from './pages/PipelineDAG';
import Monitoring from './pages/Monitoring';
import CICD from './pages/CICD';
import Integrations from './pages/Integrations';
import Admin from './pages/Admin';
import Workflow from './App';
import { Menu, X, LogOut } from 'lucide-react';

/**
 * Navigation Link Component
 */
const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm font-medium ${
        isActive
          ? 'bg-white/30 text-white shadow-lg'
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
};

/**
 * Layout wrapper with navigation
 */
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-md border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-between items-center py-4">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <EXLLogo size="md" />
                <h1 className="text-2xl font-black text-white">MLOps Studio</h1>
              </div>
              
              {/* Navigation Links */}
              <div className="flex gap-2">
                <NavLink to="/">Dashboard</NavLink>
                <NavLink to="/projects">Projects</NavLink>
                <NavLink to="/pipelines">Pipelines</NavLink>
                <NavLink to="/monitoring">Monitoring</NavLink>
                <NavLink to="/cicd">CI/CD</NavLink>
                <NavLink to="/integrations">Integrations</NavLink>
                <NavLink to="/workflow">Workflow</NavLink>
                {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <p className="text-white font-medium text-sm">{user?.name}</p>
                <p className="text-white/60 text-xs capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                <span className="text-white font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 transition-all text-sm font-medium"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center border border-white/30">
                <span className="text-white font-bold text-sm">ML</span>
              <EXLLogo size="sm" /
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-all"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/20 py-4 space-y-2">
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/projects">Projects</NavLink>
              <NavLink to="/pipelines">Pipelines</NavLink>
              <NavLink to="/monitoring">Monitoring</NavLink>
              <NavLink to="/cicd">CI/CD</NavLink>
              <NavLink to="/integrations">Integrations</NavLink>
              <NavLink to="/workflow">Workflow</NavLink>
              {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 transition-all text-sm font-medium"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Breadcrumb/Status Bar */}
      <div className="bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Project: ML Pipeline System</span>
            <span>Status: ✅ Online</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      {/* Notifications */}
      <NotificationContainer />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <p className="text-white font-bold">MLOps Studio v1.0</p>
              <p className="text-white/60 text-sm">Production ML Operations</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">© 2025 MLOps Team. All rights reserved.</p>
            </div>
            <div className="flex justify-center md:justify-end gap-4">
              <a href="#" className="text-white/60 hover:text-white transition-colors">Docs</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/**
 * App Routes Component
 */
const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🔄 AppRoutes rendering - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('📝 Not authenticated - showing login');
    return (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    );
  }

  console.log('✅ Authenticated - showing main app');
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/pipelines" element={<PipelineDAG />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/cicd" element={<CICD />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
};

/**
 * Root App Component with Providers
 */
export default function AppRouter() {
  console.log('🚀 AppRouter rendering - initializing full app with providers');
  
  // Get basename for GitHub Pages - if deployed to subdirectory
  const basename = import.meta.env.MODE === 'production' 
    ? window.location.pathname.split('/').length > 2 
      ? '/' + window.location.pathname.split('/')[1]
      : '/'
    : '/';
  
  console.log('📍 Using basename:', basename);
  
  try {
    return (
      <ErrorBoundary>
        <Router basename={basename}>
          <AuthProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </AuthProvider>
        </Router>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('❌ AppRouter fatal error:', error);
    return (
      <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
        <h1>Error Loading App</h1>
        <p>{String(error)}</p>
      </div>
    );
  }
}

