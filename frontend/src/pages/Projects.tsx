import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Folder, AlertCircle, Code, Lock, RefreshCw, Play, Save, ChevronRight, ChevronDown, FileText, FolderOpen, Trash } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobal } from '../contexts/GlobalContext';
import { useNotification } from '../hooks/useNotification';
import { Breadcrumb, SearchBar, EmptyState, FilterChip, Pagination } from '../components/UIPatterns';
import { CodeTerminal } from '../components/CodeTerminal';
import { themeClasses } from '../utils/themeClasses';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: 'python' | 'yaml' | 'json' | 'dockerfile' | 'text';
  children?: ProjectFile[];
  expanded?: boolean;
}

export default function Projects() {
  const { theme } = useTheme();
  const global = useGlobal();
  const { showNotification } = useNotification();

  const [viewMode, setViewMode] = useState<'list' | 'workspace'>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', environment: 'dev' as const });
  
  // Workspace state
  const [fileTree, setFileTree] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [fileType, setFileType] = useState<'python' | 'dockerfile' | 'yaml' | 'text'>('python');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const selectedProject = selectedProjectId ? global.getProject(selectedProjectId) : null;

  // Filter projects
  const filtered = global.projects.filter(p => {
    const matchesSearch = searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedProjects = filtered.slice(startIdx, startIdx + itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  const handleCreate = () => {
    if (!formData.name.trim()) {
      showNotification('Project name is required', 'warning');
      return;
    }
    const newProject = global.createProject({
      name: formData.name,
      description: formData.description,
      environment: formData.environment,
      status: 'active',
      code: [],
    });
    showNotification('Project created successfully', 'success');
    setShowModal(false);
    setFormData({ name: '', description: '', environment: 'dev' });
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name.trim()) {
      showNotification('Project name is required', 'warning');
      return;
    }
    global.updateProject(editingId, {
      name: formData.name,
      description: formData.description,
      environment: formData.environment,
    });
    showNotification('Project updated successfully', 'success');
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', description: '', environment: 'dev' });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    global.deleteProject(id);
    showNotification('Project deleted successfully', 'success');
  };

  const openEditModal = (projectId: string) => {
    const project = global.getProject(projectId);
    if (project) {
      setEditingId(projectId);
      setFormData({
        name: project.name,
        description: project.description,
        environment: project.environment,
      });
      setShowModal(true);
    }
  };

  const initializeWorkspace = (projectId: string) => {
    setSelectedProjectId(projectId);
    // Initialize with sample file structure
    setFileTree([
      {
        id: 'src-folder',
        name: 'src',
        type: 'folder',
        expanded: true,
        children: [
          {
            id: 'train-py',
            name: 'train.py',
            type: 'file',
            language: 'python',
            content: `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# Load data
df = pd.read_csv('data.csv')
print(f"Data shape: {df.shape}")

# Split data
X_train, X_test, y_train, y_test = train_test_split(df.drop('target', axis=1), df['target'])

# Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)
print(f"Training complete. Accuracy: {model.score(X_test, y_test):.2f}")`,
          },
          {
            id: 'infer-py',
            name: 'inference.py',
            type: 'file',
            language: 'python',
            content: `import pickle
import pandas as pd

# Load model
model = pickle.load(open('model.pkl', 'rb'))

# Make predictions
df = pd.read_csv('input.csv')
predictions = model.predict(df)
print(f"Predictions made for {len(predictions)} samples")`,
          },
        ],
      },
      {
        id: 'dockerfile-id',
        name: 'Dockerfile',
        type: 'file',
        language: 'dockerfile',
        content: `FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/
EXPOSE 5000

CMD ["python", "src/inference.py"]`,
      },
      {
        id: 'requirements-txt',
        name: 'requirements.txt',
        type: 'file',
        language: 'text',
        content: `scikit-learn==1.2.0
pandas==1.5.0
numpy==1.24.0
flask==2.3.0`,
      },
    ]);
    setSelectedFile(null);
    setViewMode('workspace');
  };

  const toggleFileExpand = (fileId: string) => {
    const toggle = (files: ProjectFile[]): ProjectFile[] => {
      return files.map(f =>
        f.id === fileId
          ? { ...f, expanded: !f.expanded }
          : f.children ? { ...f, children: toggle(f.children) } : f
      );
    };
    setFileTree(toggle(fileTree));
  };

  const handleFileSelect = (file: ProjectFile) => {
    if (file.type === 'file') setSelectedFile(file);
  };

  const handleUpdateFileContent = (content: string) => {
    if (selectedFile) {
      const update = (files: ProjectFile[]): ProjectFile[] => {
        return files.map(f =>
          f.id === selectedFile.id
            ? { ...f, content }
            : f.children ? { ...f, children: update(f.children) } : f
        );
      };
      setFileTree(update(fileTree));
      setSelectedFile({ ...selectedFile, content });
      showNotification('File saved', 'success');
    }
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      showNotification('File name is required', 'error');
      return;
    }

    let filename = newFileName;
    if (fileType === 'python' && !filename.endsWith('.py')) filename += '.py';
    if (fileType === 'dockerfile' && !filename.endsWith('Dockerfile')) filename = 'Dockerfile';
    if (fileType === 'yaml' && !filename.endsWith('.yaml')) filename += '.yaml';
    if (fileType === 'text' && !filename.endsWith('.txt')) filename += '.txt';

    const newFile: ProjectFile = {
      id: `file-${Date.now()}`,
      name: filename,
      type: 'file',
      language: fileType,
      content: '',
    };

    if (selectedFolderId) {
      const addToFolder = (files: ProjectFile[]): ProjectFile[] => {
        return files.map(f =>
          f.id === selectedFolderId && f.type === 'folder'
            ? { ...f, children: [...(f.children || []), newFile] }
            : f.children ? { ...f, children: addToFolder(f.children) } : f
        );
      };
      setFileTree(addToFolder(fileTree));
    } else {
      setFileTree([...fileTree, newFile]);
    }

    setNewFileName('');
    setFileType('python');
    setShowNewFileModal(false);
    setSelectedFolderId(null);
    showNotification('File created', 'success');
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      showNotification('Folder name is required', 'error');
      return;
    }

    const newFolder: ProjectFile = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      type: 'folder',
      children: [],
      expanded: false,
    };

    if (selectedFolderId) {
      const addToFolder = (files: ProjectFile[]): ProjectFile[] => {
        return files.map(f =>
          f.id === selectedFolderId && f.type === 'folder'
            ? { ...f, children: [...(f.children || []), newFolder] }
            : f.children ? { ...f, children: addToFolder(f.children) } : f
        );
      };
      setFileTree(addToFolder(fileTree));
    } else {
      setFileTree([...fileTree, newFolder]);
    }

    setNewFolderName('');
    setShowNewFolderModal(false);
    setSelectedFolderId(null);
    showNotification('Folder created', 'success');
  };

  const renderFileTree = (files: ProjectFile[], depth = 0): React.ReactNode => {
    return files.map(file => (
      <div key={file.id}>
        <div
          onClick={() => {
            if (file.type === 'folder') {
              toggleFileExpand(file.id);
            } else {
              handleFileSelect(file);
            }
          }}
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-white/10 group transition-colors ${
            selectedFile?.id === file.id ? `bg-blue-500/30 border-l-2 border-blue-400` : ''
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {file.type === 'folder' && (
            file.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          )}
          {file.type === 'folder' ? <FolderOpen size={14} /> : <FileText size={14} />}
          <span className="text-sm flex-1 truncate">{file.name}</span>
        </div>
        {file.type === 'folder' && file.expanded && file.children && renderFileTree(file.children, depth + 1)}
      </div>
    ));
  };

  const getEnvColor = (env: string) => {
    return env === 'prod' ? 'from-red-600/20 to-red-400/10 border-red-400/30' :
           env === 'staging' ? 'from-yellow-600/20 to-yellow-400/10 border-yellow-400/30' :
           'from-blue-600/20 to-blue-400/10 border-blue-400/30';
  };

  if (viewMode === 'workspace' && selectedProject) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${themeClasses.textPrimary(theme)}`}>{selectedProject.name} - Workspace</h1>
            <p className={`${themeClasses.textSecondary(theme)} mt-1`}>Environment: {selectedProject.environment}</p>
          </div>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} rounded-lg transition`}
          >
            Back to Projects
          </button>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-4 gap-4 h-[600px]">
          {/* File Tree */}
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'} border rounded-lg overflow-hidden flex flex-col`}>
            <div className={`p-3 border-b ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-300'} flex items-center justify-between`}>
              <h3 className={`font-semibold text-sm ${themeClasses.textPrimary(theme)}`}>Files</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setSelectedFolderId(null);
                    setShowNewFileModal(true);
                  }}
                  className={`p-1 hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'} rounded transition-colors`}
                  title="New file"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => {
                    setSelectedFolderId(null);
                    setShowNewFolderModal(true);
                  }}
                  className={`p-1 hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'} rounded transition-colors`}
                  title="New folder"
                >
                  <FolderOpen size={14} />
                </button>
              </div>
            </div>
            <div className={`flex-1 overflow-y-auto text-sm ${themeClasses.textPrimary(theme)}`}>
              {renderFileTree(fileTree)}
            </div>
          </div>

          {/* Code Editor */}
          <div className={`col-span-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'} border rounded-lg overflow-hidden flex flex-col`}>
            {selectedFile ? (
              <>
                <div className={`p-3 border-b ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-300'} flex items-center justify-between`}>
                  <span className={`font-semibold text-sm ${themeClasses.textPrimary(theme)}`}>{selectedFile.name}</span>
                  <button
                    onClick={() => handleUpdateFileContent(selectedFile.content || '')}
                    className="p-1 hover:bg-blue-600/20 rounded flex items-center gap-1 text-xs transition-colors text-blue-400"
                    title="Save file"
                  >
                    <Save size={14} />
                  </button>
                </div>
                <textarea
                  value={selectedFile.content || ''}
                  onChange={(e) => setSelectedFile({ ...selectedFile, content: e.target.value })}
                  className={`flex-1 ${theme === 'dark' ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-800'} p-3 focus:outline-none font-mono text-sm`}
                  spellCheck="false"
                />
              </>
            ) : (
              <div className={`flex-1 flex items-center justify-center ${themeClasses.textSecondary(theme)}`}>
                Select a file to edit
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'} border rounded-lg overflow-hidden flex flex-col`}>
            <div className={`p-3 border-b ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-300'} font-semibold text-sm`}>
              Info
            </div>
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 text-sm ${themeClasses.textSecondary(theme)}`}>
              <div>
                <p className="text-xs">Created</p>
                <p className={`${themeClasses.textPrimary(theme)} mt-1`}>{selectedProject.createdAt?.split('T')[0]}</p>
              </div>
              <div>
                <p className="text-xs">Environment</p>
                <p className={`${themeClasses.textPrimary(theme)} mt-1 capitalize`}>{selectedProject.environment}</p>
              </div>
              {selectedFile && (
                <>
                  <div>
                    <p className="text-xs">File Type</p>
                    <p className={`${themeClasses.textPrimary(theme)} mt-1`}>{selectedFile.language}</p>
                  </div>
                  <div>
                    <p className="text-xs">Size</p>
                    <p className={`${themeClasses.textPrimary(theme)} mt-1`}>{(selectedFile.content?.length || 0).toLocaleString()} bytes</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Terminal */}
        {selectedFile && (
          <div>
            <CodeTerminal
              code={selectedFile.content}
              language={selectedFile.language}
              title={`Running ${selectedFile.name}`}
              height="h-48"
            />
          </div>
        )}

        {/* Modals */}
        {showNewFileModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 w-full max-w-sm border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}>
              <h2 className={`text-xl font-bold mb-4 ${themeClasses.textPrimary(theme)}`}>Create New File</h2>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm mb-2 ${themeClasses.textSecondary(theme)}`}>File Type</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-blue-500 ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-black'
                    }`}
                  >
                    <option value="python">Python (.py)</option>
                    <option value="dockerfile">Dockerfile</option>
                    <option value="yaml">YAML (.yaml)</option>
                    <option value="text">Text (.txt)</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="File name"
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-blue-500 ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-slate-300 text-black placeholder-slate-400'
                  }`}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowNewFileModal(false);
                      setNewFileName('');
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-slate-700 hover:bg-slate-600'
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFile}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showNewFolderModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 w-full max-w-sm border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}>
              <h2 className={`text-xl font-bold mb-4 ${themeClasses.textPrimary(theme)}`}>Create New Folder</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-blue-500 ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-slate-300 text-black placeholder-slate-400'
                  }`}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowNewFolderModal(false);
                      setNewFolderName('');
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg transition ${
                      theme === 'dark'
                        ? 'bg-slate-700 hover:bg-slate-600'
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFolder}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Projects' }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-4xl font-bold ${themeClasses.textPrimary(theme)} mb-2`}>Projects</h1>
          <p className={themeClasses.textSecondary(theme)}>Manage your ML projects and code</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all font-medium"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {/* Search & Filter */}
      {global.projects.length > 0 && (
        <div className="space-y-4">
          <SearchBar
            placeholder="Search projects..."
            onSearch={setSearchQuery}
          />
          <div className="flex gap-2 flex-wrap">
            <FilterChip
              label="All"
              isActive={statusFilter === 'all'}
              onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
            />
            <FilterChip
              label="Active"
              isActive={statusFilter === 'active'}
              onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}
            />
            <FilterChip
              label="Inactive"
              isActive={statusFilter === 'inactive'}
              onClick={() => { setStatusFilter('inactive'); setCurrentPage(1); }}
            />
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {global.projects.length === 0 ? (
        <EmptyState
          icon={<Folder size={48} />}
          title="No projects yet"
          description="Create your first project to get started"
          action={{
            label: 'Create Project',
            onClick: () => setShowModal(true),
          }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No projects match your filters"
          description="Try adjusting your search criteria"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProjects.map((project) => (
              <div
                key={project.id}
                className={`p-6 bg-gradient-to-br ${getEnvColor(project.environment)} rounded-xl border ${
                  theme === 'dark' ? 'border-white/20' : 'border-slate-300'
                } transition-all hover:border-white/40`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${themeClasses.textPrimary(theme)} mb-1`}>{project.name}</h3>
                    <p className={`${themeClasses.textSecondary(theme)} text-sm`}>{project.description || 'No description'}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => initializeWorkspace(project.id)}
                      className="p-2 hover:bg-blue-500/20 rounded-lg transition-all text-blue-400"
                      title="Open workspace"
                    >
                      <Code size={16} />
                    </button>
                    <button
                      onClick={() => openEditModal(project.id)}
                      className={`p-2 hover:bg-opacity-20 rounded-lg transition-all ${themeClasses.textSecondary(theme)}`}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-all text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    project.environment === 'prod' ? 'text-red-400 bg-red-500/20' :
                    project.environment === 'staging' ? 'text-yellow-400 bg-yellow-500/20' :
                    'text-blue-400 bg-blue-500/20'
                  }`}>
                    {project.environment.toUpperCase()}
                  </span>
                </div>

                <div className="text-sm space-y-2">
                  <p className={themeClasses.textSecondary(theme)}>
                    <span className="font-semibold">{project.code.length}</span> files
                  </p>
                  <p className={themeClasses.textSecondary(theme)}>
                    Created: {project.createdAt?.split('T')[0]}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filtered.length}
            />
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl p-8 w-full max-w-md border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}>
            <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-6`}>
              {editingId ? 'Edit Project' : 'Create New Project'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-black'
                  }`}
                  placeholder="Project name"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors resize-none ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-black'
                  }`}
                  placeholder="Describe your project"
                  rows={3}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Environment</label>
                <select
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-black'
                  }`}
                >
                  <option value="dev">Development</option>
                  <option value="staging">Staging</option>
                  <option value="prod">Production</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setFormData({ name: '', description: '', environment: 'dev' });
                }}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-700 hover:bg-slate-600'
                    : 'bg-slate-200 hover:bg-slate-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
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
