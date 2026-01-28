import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BarChart3, GitBranch, Database, Settings, Bell, LogOut, Menu } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import PipelineDAG from './pages/PipelineDAG';
import Monitoring from './pages/Monitoring';
import CICD from './pages/CICD';
import Integrations from './pages/Integrations';
import Admin from './pages/Admin';
import './App.css';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedEnv, setSelectedEnv] = useState<'dev' | 'staging' | 'prod'>('dev');
  const [notifications, setNotifications] = useState(0);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Projects', path: '/projects', icon: '📁' },
    { label: 'Pipelines', path: '/pipelines', icon: '⚙️' },
    { label: 'Monitoring', path: '/monitoring', icon: '📈' },
    { label: 'CI/CD', path: '/cicd', icon: '🚀' },
    { label: 'Integrations', path: '/integrations', icon: '🔗' },
    { label: 'Admin', path: '/admin', icon: '👤' },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className={`flex items-center gap-2 ${sidebarOpen ? '' : 'justify-center w-full'}`}>
            <BarChart3 className="w-6 h-6 text-blue-500" />
            {sidebarOpen && <span className="font-bold text-lg">MLOps Studio</span>}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              title={item.label}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-700 space-y-3">
          {sidebarOpen && (
            <div className="text-xs">
              <p className="font-semibold">ml-engineer@org</p>
              <p className="text-gray-400">ML Engineer</p>
            </div>
          )}
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm">
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Select Project</option>
              <option value="project-1">ML Model Deployment</option>
              <option value="project-2">Data Processing Pipeline</option>
              <option value="project-3">Feature Engineering</option>
            </select>

            <select
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              value={selectedEnv}
              onChange={(e) => setSelectedEnv(e.target.value as any)}
            >
              <option value="dev">Development</option>
              <option value="staging">Staging</option>
              <option value="prod">Production</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="p-2 hover:bg-gray-700 rounded-lg relative">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>
            <button className="p-2 hover:bg-gray-700 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gray-900 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/pipelines" element={<PipelineDAG />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/cicd" element={<CICD />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Wrapper component to use Router at top level
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
