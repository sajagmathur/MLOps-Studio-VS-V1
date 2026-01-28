import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Folder, AlertCircle, Loader } from 'lucide-react';
import { APIClient } from '../services/APIClient';
import { useNotification } from '../hooks/useNotification';

interface Project {
  id: string;
  name: string;
  description: string;
  environment: 'dev' | 'staging' | 'prod';
  status: 'active' | 'inactive';
  pipelinesCount?: number;
  modelsCount?: number;
  owner?: string;
  createdAt?: string;
  githubRepo?: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    environment: 'dev' as const, 
    githubRepo: '' 
  });
  const { showNotification } = useNotification();

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await APIClient.apiGet('/projects');
      const data = Array.isArray(res) ? res : res.data || [];
      setProjects(data);
    } catch (err) {
      console.warn('Failed to load projects, showing empty list:', err);
      // Don't crash - just show empty list
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showNotification('Project name is required', 'warning');
      return;
    }

    try {
      await APIClient.apiPost('/projects', formData);
      showNotification('Project created successfully', 'success');
      setShowModal(false);
      setFormData({ name: '', description: '', environment: 'dev', githubRepo: '' });
      await loadProjects();
    } catch (err) {
      console.warn('Failed to create project:', err);
      // Add project locally on error
      const newProject: Project = {
        id: Date.now().toString(),
        ...formData,
        status: 'active'
      };
      setProjects([...projects, newProject]);
      setShowModal(false);
      setFormData({ name: '', description: '', environment: 'dev', githubRepo: '' });
      showNotification('Project created locally', 'info');
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.name.trim()) {
      showNotification('Project name is required', 'warning');
      return;
    }

    try {
      await APIClient.apiPut(`/projects/${editingId}`, formData);
      showNotification('Project updated successfully', 'success');
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', description: '', environment: 'dev', githubRepo: '' });
      await loadProjects();
    } catch (err) {
      console.warn('Failed to update project:', err);
      // Update project locally on error
      setProjects(projects.map(p => p.id === editingId ? { ...p, ...formData } : p));
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', description: '', environment: 'dev', githubRepo: '' });
      showNotification('Project updated locally', 'info');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await APIClient.apiDelete(`/projects/${id}`);
      showNotification('Project deleted successfully', 'success');
      await loadProjects();
    } catch (err) {
      console.warn('Failed to delete project:', err);
      // Delete project locally on error
      setProjects(projects.filter(p => p.id !== id));
      showNotification('Project deleted locally', 'info');
    }
  };

  const openEditModal = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      description: project.description || '',
      environment: (project.environment || 'dev') as 'dev' | 'staging' | 'prod',
      githubRepo: project.githubRepo || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', description: '', environment: 'dev', githubRepo: '' });
  };

  const getEnvColor = (env: string) => {
    return env === 'prod' ? 'from-red-600/20 to-red-400/10 border-red-400/30' :
           env === 'staging' ? 'from-yellow-600/20 to-yellow-400/10 border-yellow-400/30' :
           'from-blue-600/20 to-blue-400/10 border-blue-400/30';
  };

  const getEnvTextColor = (env: string) => {
    return env === 'prod' ? 'text-red-400' :
           env === 'staging' ? 'text-yellow-400' :
           'text-blue-400';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Projects</h1>
          <p className="text-white/60">Manage your ML projects and environments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all font-medium"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-400 font-medium">Error Loading Projects</p>
            <p className="text-red-300/80 text-sm mt-1">{error}</p>
            <button
              onClick={loadProjects}
              className="mt-2 text-red-300 hover:text-red-200 text-sm font-medium underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader size={32} className="text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-white/70">Loading projects...</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <Folder size={48} className="mx-auto text-white/30 mb-4" />
          <p className="text-white/60 mb-4">No projects found</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
          >
            <Plus size={16} />
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`p-6 bg-gradient-to-br ${getEnvColor(project.environment)} rounded-xl border transition-all hover:border-white/40`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{project.name}</h3>
                  <p className="text-white/60 text-sm">{project.description || 'No description'}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => openEditModal(project)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/70 hover:text-white"
                    title="Edit project"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all text-white/70 hover:text-red-400"
                    title="Delete project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Environment Badge */}
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getEnvTextColor(project.environment)} bg-white/10 border border-white/20`}>
                  {project.environment.toUpperCase()}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/20">
                <div>
                  <p className="text-white/60 text-xs font-medium">PIPELINES</p>
                  <p className="text-2xl font-bold text-white mt-1">{project.pipelinesCount || 0}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs font-medium">MODELS</p>
                  <p className="text-2xl font-bold text-white mt-1">{project.modelsCount || 0}</p>
                </div>
              </div>

              {/* GitHub Link */}
              {project.githubRepo && (
                <a
                  href={`https://github.com/${project.githubRepo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-4 transition-colors"
                >
                  <ExternalLink size={14} />
                  {project.githubRepo}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 w-full max-w-md border border-white/20 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingId ? 'Edit Project' : 'Create New Project'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="e.g., ML Model Deployment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none transition-colors resize-none"
                  placeholder="Describe this project"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Environment</label>
                <select
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value as 'dev' | 'staging' | 'prod' })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-blue-400 focus:outline-none transition-colors"
                >
                  <option value="dev" className="bg-slate-800">Development</option>
                  <option value="staging" className="bg-slate-800">Staging</option>
                  <option value="prod" className="bg-slate-800">Production</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">GitHub Repository</label>
                <input
                  type="text"
                  value={formData.githubRepo}
                  onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="e.g., org/ml-models"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all font-medium"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
