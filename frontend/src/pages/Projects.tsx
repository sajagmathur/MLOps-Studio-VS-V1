import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', environment: 'dev', githubRepo: '' });

  useEffect(() => {
    // Mock data
    setProjects([
      {
        id: '1',
        name: 'ML Model Deployment',
        description: 'Pipeline for deploying and monitoring ML models',
        environment: 'prod',
        status: 'active',
        pipelines: 5,
        models: 3,
        githubRepo: 'ml-models',
      },
      {
        id: '2',
        name: 'Data Processing Pipeline',
        description: 'Ingestion and preparation of training data',
        environment: 'staging',
        status: 'active',
        pipelines: 3,
        models: 1,
        githubRepo: 'data-pipelines',
      },
      {
        id: '3',
        name: 'Feature Engineering',
        description: 'Feature computation and storage',
        environment: 'dev',
        status: 'active',
        pipelines: 2,
        models: 0,
        githubRepo: 'feature-store',
      },
    ]);
  }, []);

  const handleAddProject = () => {
    const project = {
      id: (projects.length + 1).toString(),
      ...newProject,
      status: 'active',
      pipelines: 0,
      models: 0,
    };
    setProjects([...projects, project]);
    setShowModal(false);
    setNewProject({ name: '', description: '', environment: 'dev', githubRepo: '' });
  };

  const getEnvColor = (env: string) => {
    const colors: Record<string, string> = {
      dev: 'bg-blue-100 text-blue-800',
      staging: 'bg-yellow-100 text-yellow-800',
      prod: 'bg-red-100 text-red-800',
    };
    return colors[env] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-gray-700 rounded">
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-700 rounded">
                  <Trash2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-4">{project.description}</p>

            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize`}
                style={{
                  backgroundColor: project.environment === 'prod' ? 'rgba(239, 68, 68, 0.2)' :
                                   project.environment === 'staging' ? 'rgba(245, 158, 11, 0.2)' :
                                   'rgba(59, 130, 246, 0.2)',
                  color: project.environment === 'prod' ? '#ef4444' :
                         project.environment === 'staging' ? '#f59e0b' :
                         '#3b82f6',
                }}>
                {project.environment}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-700">
              <div>
                <p className="text-gray-400 text-xs">Pipelines</p>
                <p className="text-xl font-semibold">{project.pipelines}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Models</p>
                <p className="text-xl font-semibold">{project.models}</p>
              </div>
            </div>

            {project.githubRepo && (
              <a href="#" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-4">
                <ExternalLink className="w-3 h-3" />
                {project.githubRepo}
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Create New Project</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
                  placeholder="e.g., ML Model Deployment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
                  placeholder="Describe this project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Environment</label>
                <select
                  value={newProject.environment}
                  onChange={(e) => setNewProject({ ...newProject, environment: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
                >
                  <option value="dev">Development</option>
                  <option value="staging">Staging</option>
                  <option value="prod">Production</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">GitHub Repository</label>
                <input
                  type="text"
                  value={newProject.githubRepo}
                  onChange={(e) => setNewProject({ ...newProject, githubRepo: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
                  placeholder="e.g., ml-models"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
