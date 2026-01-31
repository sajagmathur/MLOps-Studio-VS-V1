import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Folder, AlertCircle, Code, Lock, RefreshCw, Play, Save, ChevronRight, ChevronDown, FileText, FolderOpen, Trash, Download, Copy, X } from 'lucide-react';
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
  const [formData, setFormData] = useState({ name: '', description: '', environment: 'dev' as 'dev' | 'staging' | 'prod' });
  
  // Workspace state
  const [fileTree, setFileTree] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [fileType, setFileType] = useState<'python' | 'dockerfile' | 'yaml' | 'json' | 'text'>('python');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const selectedProject = selectedProjectId ? global.getProject(selectedProjectId) : null;

  // Load file tree from GlobalContext when project changes
  useEffect(() => {
    if (selectedProject && selectedProject.code && selectedProject.code.length > 0) {
      // Reconstruct file tree from ProjectCode array
      const reconstructedTree: ProjectFile[] = selectedProject.code.map(code => ({
        id: code.id,
        name: code.name,
        type: 'file',
        language: code.language,
        content: code.content,
      }));
      setFileTree(reconstructedTree);
    } else if (selectedProject) {
      // Initialize with sample tree for new project
      const sampleFiles = [
        {
          id: 'src-folder',
          name: 'src',
          type: 'folder' as const,
          expanded: true,
          children: [
            {
              id: 'train-py-sample',
              name: 'train.py',
              type: 'file' as const,
              language: 'python' as const,
              content: `# Training script for ${selectedProject.name}\nimport pandas as pd\n# Add your training code here`,
            },
            {
              id: 'infer-py-sample',
              name: 'inference.py',
              type: 'file' as const,
              language: 'python' as const,
              content: `# Inference script for ${selectedProject.name}\nimport pickle\n# Add your inference code here`,
            },
          ],
        },
        {
          id: 'dockerfile-sample',
          name: 'Dockerfile',
          type: 'file' as const,
          language: 'dockerfile' as const,
          content: `FROM python:3.10-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCMD ["python", "src/inference.py"]`,
        },
      ];
      setFileTree(sampleFiles);
      // Also save sample files to GlobalContext so they are immediately available to jobs
      if (!selectedProject.code || selectedProject.code.length === 0) {
        const trainCode = { name: 'train.py', language: 'python' as const, content: `# Training script for ${selectedProject.name}\nimport pandas as pd\n# Add your training code here` };
        const inferCode = { name: 'inference.py', language: 'python' as const, content: `# Inference script for ${selectedProject.name}\nimport pickle\n# Add your inference code here` };
        const dockerCode = { name: 'Dockerfile', language: 'dockerfile' as const, content: `FROM python:3.10-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCMD ["python", "src/inference.py"]` };
        global.addProjectCode(selectedProject.id, trainCode);
        global.addProjectCode(selectedProject.id, inferCode);
        global.addProjectCode(selectedProject.id, dockerCode);
      }
    }
  }, [selectedProject?.id]);

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
    setViewMode('workspace');
    setSelectedFile(null);
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

  const handleSaveFileContent = (content: string) => {
    if (!selectedFile || !selectedProject) return;

    // Update local file tree
    const update = (files: ProjectFile[]): ProjectFile[] => {
      return files.map(f =>
        f.id === selectedFile.id
          ? { ...f, content }
          : f.children ? { ...f, children: update(f.children) } : f
      );
    };
    setFileTree(update(fileTree));
    setSelectedFile({ ...selectedFile, content });

    // Save to GlobalContext
    const existingCode = selectedProject.code.find(c => c.id === selectedFile.id);
    if (existingCode) {
      // Update existing code
      global.updateProjectCode(selectedProject.id, selectedFile.id, { content });
    } else {
      // Add as new code
      const newCode = {
        name: selectedFile.name,
        language: selectedFile.language || 'python' as const,
        content,
      };
      global.addProjectCode(selectedProject.id, newCode);
    }

    showNotification('File saved to project', 'success');
  };

  const handleDeleteFile = (fileId: string) => {
    if (!confirm('Delete this file?')) return;
    
    const deleteFromTree = (files: ProjectFile[]): ProjectFile[] => {
      return files
        .filter(f => f.id !== fileId)
        .map(f => f.children ? { ...f, children: deleteFromTree(f.children) } : f);
    };
    
    setFileTree(deleteFromTree(fileTree));
    if (selectedFile?.id === fileId) setSelectedFile(null);

    // Also delete from GlobalContext if it's a saved code
    if (selectedProject) {
      const codeToDelete = selectedProject.code.find(c => c.id === fileId);
      if (codeToDelete) {
        global.deleteProjectCode(selectedProject.id, fileId);
      }
    }

    showNotification('File deleted', 'success');
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
    if (fileType === 'json' && !filename.endsWith('.json')) filename += '.json';
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

    // Save to GlobalContext immediately so code is available to jobs
    if (selectedProject) {
      global.addProjectCode(selectedProject.id, {
        name: filename,
        language: fileType,
        content: '',
      });
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

    // Save folder structure to GlobalContext as a placeholder
    if (selectedProject) {
      global.addProjectCode(selectedProject.id, {
        name: `${newFolderName}/.gitkeep`,
        language: 'text',
        content: '# Folder placeholder',
      });
    }

    setNewFolderName('');
    setShowNewFolderModal(false);
    setSelectedFolderId(null);
    showNotification('Folder created', 'success');
  };

  // Download functions
  const downloadFile = (file: ProjectFile) => {
    if (!file.content) return;
    
    const element = document.createElement('a');
    const fileBlob = new Blob([file.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = file.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showNotification(`Downloaded ${file.name}`, 'success');
  };

  const downloadProjectAsZip = async () => {
    if (!selectedProject) return;
    
    try {
      // Simple zip creation using a basic format
      // Note: For production, consider using JSZip library
      const files = selectedProject.code || [];
      
      if (files.length === 0) {
        showNotification('No files to download', 'warning');
        return;
      }

      // Create a simple text file containing all project files
      let zipContent = `# ${selectedProject.name} Project Export\n\n`;
      zipContent += `Generated: ${new Date().toLocaleString()}\n`;
      zipContent += `Total Files: ${files.length}\n\n`;

      files.forEach((file, index) => {
        zipContent += `\n${'='.repeat(80)}\n`;
        zipContent += `FILE ${index + 1}: ${file.name}\n`;
        zipContent += `Language: ${file.language}\n`;
        zipContent += `${'='.repeat(80)}\n`;
        zipContent += file.content || '';
        zipContent += '\n';
      });

      const element = document.createElement('a');
      const fileBlob = new Blob([zipContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(fileBlob);
      element.download = `${selectedProject.name.replace(/\s+/g, '_')}_export.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      showNotification(`Downloaded project as text archive`, 'success');
    } catch (err) {
      console.error('Error downloading project:', err);
      showNotification('Failed to download project', 'error');
    }
  };

  const downloadAllCode = async () => {
    if (!selectedProject || selectedProject.code.length === 0) {
      showNotification('No code files to download', 'warning');
      return;
    }

    try {
      // Download all files as a concatenated text file
      let allCode = `# ${selectedProject.name} - All Code Files\n\n`;
      allCode += `Generated: ${new Date().toLocaleString()}\n`;
      allCode += `Total Files: ${selectedProject.code.length}\n`;
      allCode += `Environment: ${selectedProject.environment}\n\n`;

      selectedProject.code.forEach((file, index) => {
        allCode += `\n${'#'.repeat(80)}\n`;
        allCode += `# FILE ${index + 1}: ${file.name} (${file.language})\n`;
        allCode += `${'#'.repeat(80)}\n\n`;
        allCode += file.content || '';
        allCode += '\n';
      });

      const element = document.createElement('a');
      const fileBlob = new Blob([allCode], { type: 'text/plain' });
      element.href = URL.createObjectURL(fileBlob);
      element.download = `${selectedProject.name.replace(/\s+/g, '_')}_all_code.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      showNotification('Downloaded all code files', 'success');
    } catch (err) {
      console.error('Error downloading code:', err);
      showNotification('Failed to download code', 'error');
    }
  };

  const renderFileTree = (files: ProjectFile[], depth = 0): React.ReactNode => {
    return files.map(file => (
      <div key={file.id}>
        <div className="group">
          <div
            onClick={() => {
              if (file.type === 'folder') {
                toggleFileExpand(file.id);
              } else {
                handleFileSelect(file);
              }
            }}
            className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-white/10 transition-colors ${
              selectedFile?.id === file.id ? `bg-blue-500/30 border-l-2 border-blue-400` : ''
            }`}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
          >
            {file.type === 'folder' && (
              file.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            )}
            {file.type === 'folder' ? <FolderOpen size={14} /> : <FileText size={14} />}
            <span className="text-sm flex-1 truncate">{file.name}</span>
            {file.type === 'file' && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadFile(file);
                  }}
                  className="p-1 hover:bg-blue-600/20 rounded transition-all"
                  title="Download file"
                >
                  <Download size={12} className="text-blue-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.id);
                  }}
                  className="p-1 hover:bg-red-600/20 rounded transition-all"
                  title="Delete file"
                >
                  <Trash size={12} className="text-red-400" />
                </button>
              </div>
            )}
          </div>
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
            <p className={`${themeClasses.textSecondary(theme)} mt-1`}>
              Environment: {selectedProject.environment} | Saved Files: {selectedProject.code.length}
            </p>
          </div>
          <div className="flex gap-2">
            {selectedProject.code.length > 0 && (
              <>
                <button
                  onClick={downloadAllCode}
                  className={`px-4 py-2 flex items-center gap-2 rounded-lg transition ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                  title="Download all code files"
                >
                  <Download size={18} />
                  All Code
                </button>
                <button
                  onClick={downloadProjectAsZip}
                  className={`px-4 py-2 flex items-center gap-2 rounded-lg transition ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                  title="Download entire project"
                >
                  <Download size={18} />
                  Project
                </button>
              </>
            )}
            <button
              onClick={() => {
                setViewMode('list');
                setSelectedProjectId(null);
              }}
              className={`px-4 py-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} rounded-lg transition`}
            >
              Back to Projects
            </button>
          </div>
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
                  <div className="flex gap-1">
                    <button
                      onClick={() => downloadFile(selectedFile)}
                      className="p-1 hover:bg-green-600/20 rounded flex items-center gap-1 text-xs transition-colors text-green-400"
                      title="Download file"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => handleSaveFileContent(selectedFile.content || '')}
                      className="p-1 hover:bg-blue-600/20 rounded flex items-center gap-1 text-xs transition-colors text-blue-400"
                      title="Save file to project"
                    >
                      <Save size={14} />
                      Save
                    </button>
                  </div>
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
              Project Info
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
              <div>
                <p className="text-xs">Saved Code Files</p>
                <p className={`${themeClasses.textPrimary(theme)} mt-1 text-lg font-semibold`}>{selectedProject.code.length}</p>
              </div>
              {selectedProject.code.length > 0 && (
                <div>
                  <p className="text-xs mb-2">Available Code</p>
                  <div className="space-y-1">
                    {selectedProject.code.map(code => (
                      <div key={code.id} className={`text-xs px-2 py-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'} rounded`}>
                        {code.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 max-w-sm w-full space-y-4`}>
              <h2 className={`text-lg font-bold ${themeClasses.textPrimary(theme)}`}>Create New File</h2>
              <input
                type="text"
                placeholder="File name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
              />
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
              >
                <option value="python">Python</option>
                <option value="dockerfile">Dockerfile</option>
                <option value="yaml">YAML</option>
                <option value="json">JSON</option>
                <option value="text">Text</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewFileModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} transition`}
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
        )}

        {showNewFolderModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 max-w-sm w-full space-y-4`}>
              <h2 className={`text-lg font-bold ${themeClasses.textPrimary(theme)}`}>Create New Folder</h2>
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} transition`}
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
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${themeClasses.textPrimary(theme)}`}>Projects</h1>
          <p className={`${themeClasses.textSecondary(theme)} mt-1`}>Manage your ML projects</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', description: '', environment: 'dev' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 items-center flex-wrap">
        <SearchBar
          placeholder="Search projects..."
          onSearch={(query) => setSearchQuery(query)}
        />
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map(status => (
            <FilterChip
              key={status}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              isActive={statusFilter === status}
              onClick={() => setStatusFilter(status)}
            />
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {paginatedProjects.length === 0 ? (
        <EmptyState
          icon={<Code size={48} />}
          title="No projects found"
          description="Create your first project to get started"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedProjects.map(project => (
            <div
              key={project.id}
              className={`rounded-lg border backdrop-blur-sm transition-all hover:shadow-lg overflow-hidden bg-gradient-to-br ${getEnvColor(project.environment)}`}
            >
              <div className={`p-4 border-b ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white/50 border-slate-300/50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${themeClasses.textPrimary(theme)}`}>{project.name}</h3>
                    <p className={`${themeClasses.textSecondary(theme)} text-sm mt-1`}>{project.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    project.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
              <div className={`p-4 space-y-3`}>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className={`${themeClasses.textSecondary(theme)} text-xs`}>Environment</p>
                    <p className={`${themeClasses.textPrimary(theme)} font-semibold capitalize`}>{project.environment}</p>
                  </div>
                  <div>
                    <p className={`${themeClasses.textSecondary(theme)} text-xs`}>Code Files</p>
                    <p className={`${themeClasses.textPrimary(theme)} font-semibold`}>{project.code.length}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => initializeWorkspace(project.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
                  >
                    <Code size={14} />
                    Workspace
                  </button>
                  <button
                    onClick={() => openEditModal(project.id)}
                    className={`p-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} rounded-lg transition`}
                    title="Edit project"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition"
                    title="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full space-y-4`}>
            <h2 className={`text-lg font-bold ${themeClasses.textPrimary(theme)}`}>
              {editingId ? 'Edit Project' : 'Create New Project'}
            </h2>
            <input
              type="text"
              placeholder="Project name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
            />
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500 min-h-20 resize-none`}
            />
            <select
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
              className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
            >
              <option value="dev">Development</option>
              <option value="staging">Staging</option>
              <option value="prod">Production</option>
            </select>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                className={`flex-1 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} transition`}
              >
                Cancel
              </button>
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
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
