import React, { useState } from 'react';
import { Plus, Trash2, Play, Upload, Database, FileUp, Cloud, Network, Folder, Download, Check, AlertCircle, Loader } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobal } from '../contexts/GlobalContext';
import { useNotification } from '../hooks/useNotification';
import { Breadcrumb } from '../components/UIPatterns';
import { CodeTerminal } from '../components/CodeTerminal';
import { themeClasses } from '../utils/themeClasses';

export default function DataIngestion() {
  const { theme } = useTheme();
  const global = useGlobal();
  const { showNotification } = useNotification();

  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    dataSource: 'csv' as const,
    sourceConfig: {},
  });
  const [selectedProjectCodeId, setSelectedProjectCodeId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{name: string; path: string; size: number; type: string} | null>(null);

  const selectedJob = selectedJobId ? global.getIngestionJob(selectedJobId) : null;

  const handleCreateJob = () => {
    if (!formData.name.trim() || !formData.projectId) {
      showNotification('Job name and project are required', 'warning');
      return;
    }

    const newJob = global.createIngestionJob({
      name: formData.name,
      projectId: formData.projectId,
      dataSource: formData.dataSource,
      codeId: selectedProjectCodeId || undefined,
      sourceConfig: formData.sourceConfig,
      status: 'created',
    });

    showNotification('Data ingestion job created', 'success');
    setShowJobModal(false);
    setFormData({ name: '', projectId: '', dataSource: 'csv', sourceConfig: {} });
    setSelectedProjectCodeId(null);
    setUploadedFile(null);
  };

  const handleRunJob = (jobId: string) => {
    global.updateIngestionJob(jobId, { status: 'running' });
    
    // Simulate job execution
    setTimeout(() => {
      global.updateIngestionJob(jobId, {
        status: 'completed',
        outputPath: `/data/ingested_${Date.now()}.csv`,
        outputShape: { rows: 5000, columns: 15 },
        outputColumns: ['id', 'age', 'income', 'credit_score', 'employment_years', 'savings', 'debt', 'loan_status'],
        lastRun: new Date().toISOString(),
      });
      showNotification('Data ingestion completed', 'success');
    }, 2000);
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Delete this job?')) {
      global.deleteIngestionJob(jobId);
      showNotification('Job deleted', 'success');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        path: `/uploads/${file.name}`,
        size: file.size,
        type: file.type,
      });
      showNotification(`File uploaded: ${file.name}`, 'success');
    }
  };

  const sourceOptions = [
    { value: 'csv' as const, label: 'CSV File', icon: FileUp },
    { value: 'database' as const, label: 'Database', icon: Database },
    { value: 'api' as const, label: 'API', icon: Network },
    { value: 'cloud' as const, label: 'Cloud Storage', icon: Cloud },
    { value: 'desktop' as const, label: 'Desktop Upload', icon: Folder },
  ];

  const getProjectCodes = (projectId: string) => {
    const project = global.getProject(projectId);
    return project?.code || [];
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Data Ingestion' }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${themeClasses.textPrimary(theme)}`}>Data Ingestion</h1>
          <p className={`${themeClasses.textSecondary(theme)} mt-1`}>Create and manage data ingestion jobs</p>
        </div>
        <button
          onClick={() => setShowJobModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
        >
          <Plus size={20} />
          New Ingestion Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'} rounded-lg border ${theme === 'dark' ? 'border-white/10' : 'border-slate-300'}`}>
          <p className={`${themeClasses.textSecondary(theme)} text-xs font-medium mb-1`}>Total Jobs</p>
          <p className={`text-2xl font-bold ${themeClasses.textPrimary(theme)}`}>{global.ingestionJobs.length}</p>
        </div>
        <div className={`p-4 ${theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'} rounded-lg border ${theme === 'dark' ? 'border-green-400/30' : 'border-green-300'}`}>
          <p className={`${themeClasses.textSecondary(theme)} text-xs font-medium mb-1`}>Completed</p>
          <p className="text-2xl font-bold text-green-400">{global.ingestionJobs.filter(j => j.status === 'completed').length}</p>
        </div>
        <div className={`p-4 ${theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50'} rounded-lg border ${theme === 'dark' ? 'border-yellow-400/30' : 'border-yellow-300'}`}>
          <p className={`${themeClasses.textSecondary(theme)} text-xs font-medium mb-1`}>Running</p>
          <p className="text-2xl font-bold text-yellow-400">{global.ingestionJobs.filter(j => j.status === 'running').length}</p>
        </div>
        <div className={`p-4 ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'} rounded-lg border ${theme === 'dark' ? 'border-blue-400/30' : 'border-blue-300'}`}>
          <p className={`${themeClasses.textSecondary(theme)} text-xs font-medium mb-1`}>Created</p>
          <p className="text-2xl font-bold text-blue-400">{global.ingestionJobs.filter(j => j.status === 'created').length}</p>
        </div>
      </div>

      {/* Jobs List */}
      <div className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-300'} rounded-lg border overflow-hidden`}>
        {global.ingestionJobs.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle size={48} className={`mx-auto mb-4 ${themeClasses.textSecondary(theme)}`} />
            <p className={`${themeClasses.textSecondary(theme)} mb-4`}>No ingestion jobs yet</p>
            <button
              onClick={() => setShowJobModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              Create your first job
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-200 border-slate-300'} border-b`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary(theme)}`}>Name</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary(theme)}`}>Project</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary(theme)}`}>Source</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary(theme)}`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary(theme)}`}>Output</th>
                  <th className={`px-6 py-3 text-right text-xs font-medium ${themeClasses.textSecondary(theme)}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`${theme === 'dark' ? 'divide-white/10' : 'divide-slate-300'} divide-y`}>
                {global.ingestionJobs.map(job => {
                  const project = global.getProject(job.projectId);
                  return (
                    <tr key={job.id} className={`hover:${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'} transition cursor-pointer`} onClick={() => setSelectedJobId(job.id)}>
                      <td className={`px-6 py-4 font-medium ${themeClasses.textPrimary(theme)}`}>{job.name}</td>
                      <td className={`px-6 py-4 ${themeClasses.textSecondary(theme)}`}>{project?.name || 'Unknown'}</td>
                      <td className={`px-6 py-4 ${themeClasses.textSecondary(theme)}`}>
                        {sourceOptions.find(s => s.value === job.dataSource)?.label}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          job.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                          job.status === 'running' ? 'bg-yellow-500/20 text-yellow-300 flex items-center gap-1' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {job.status === 'running' && <Loader size={12} className="animate-spin" />}
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </td>
                      <td className={`px-6 py-4 ${themeClasses.textSecondary(theme)} text-sm`}>
                        {job.outputPath ? (
                          <div>
                            <p>{job.outputShape?.rows?.toLocaleString()} rows × {job.outputShape?.columns} cols</p>
                            <p className="text-xs">{job.outputPath}</p>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRunJob(job.id);
                          }}
                          disabled={job.status === 'running'}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition ${
                            job.status === 'running'
                              ? 'opacity-50 cursor-not-allowed bg-gray-500/20 text-gray-300'
                              : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'
                          }`}
                        >
                          <Play size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJob(job.id);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-300 text-xs font-medium transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Job Details */}
      {selectedJob && (
        <div className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-300'} rounded-lg border p-6 space-y-6`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold ${themeClasses.textPrimary(theme)}`}>{selectedJob.name}</h2>
            <button
              onClick={() => setSelectedJobId(null)}
              className={`px-4 py-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} rounded-lg transition`}
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={`text-sm font-medium ${themeClasses.textSecondary(theme)} mb-1`}>Project</p>
              <p className={themeClasses.textPrimary(theme)}>{global.getProject(selectedJob.projectId)?.name}</p>
            </div>
            <div>
              <p className={`text-sm font-medium ${themeClasses.textSecondary(theme)} mb-1`}>Data Source</p>
              <p className={themeClasses.textPrimary(theme)}>{selectedJob.dataSource}</p>
            </div>
            <div>
              <p className={`text-sm font-medium ${themeClasses.textSecondary(theme)} mb-1`}>Status</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                selectedJob.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                selectedJob.status === 'running' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-blue-500/20 text-blue-300'
              }`}>
                {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
              </span>
            </div>
            {selectedJob.lastRun && (
              <div>
                <p className={`text-sm font-medium ${themeClasses.textSecondary(theme)} mb-1`}>Last Run</p>
                <p className={themeClasses.textPrimary(theme)}>{new Date(selectedJob.lastRun).toLocaleString()}</p>
              </div>
            )}
          </div>

          {selectedJob.outputPath && (
            <div className={`p-4 ${theme === 'dark' ? 'bg-green-500/10 border-green-400/30' : 'bg-green-50 border-green-300'} rounded border`}>
              <p className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                <Check size={16} />
                Output Available
              </p>
              <div className={`text-sm ${themeClasses.textSecondary(theme)} space-y-1`}>
                <p>Rows: {selectedJob.outputShape?.rows?.toLocaleString()}</p>
                <p>Columns: {selectedJob.outputShape?.columns}</p>
                <p>Path: {selectedJob.outputPath}</p>
              </div>
            </div>
          )}

          {selectedJob.codeId && global.getProject(selectedJob.projectId)?.code && (
            <CodeTerminal
              code={global.getProject(selectedJob.projectId)?.code.find(c => c.id === selectedJob.codeId)?.content}
              language="python"
              title="Ingestion Code"
              height="h-40"
            />
          )}
        </div>
      )}

      {/* Create Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-8 w-full max-w-2xl border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'} max-h-[90vh] overflow-y-auto`}>
            <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-6`}>Create Data Ingestion Job</h2>

            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Job Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-black'
                  }`}
                  placeholder="e.g., Production Data Sync"
                />
              </div>

              {/* Project Selection */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Select Project *</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-black'
                  }`}
                >
                  <option value="">Choose a project...</option>
                  {global.projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Data Source */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-3`}>Data Source *</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {sourceOptions.map(source => {
                    const Icon = source.icon;
                    return (
                      <button
                        key={source.value}
                        onClick={() => {
                          setFormData({ ...formData, dataSource: source.value });
                          setUploadedFile(null);
                        }}
                        className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 text-xs font-medium ${
                          formData.dataSource === source.value
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                            : theme === 'dark'
                            ? 'border-slate-700 hover:border-slate-600 text-slate-400'
                            : 'border-slate-300 hover:border-slate-400 text-slate-600'
                        }`}
                      >
                        <Icon size={20} />
                        {source.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* File Upload for Desktop */}
              {formData.dataSource === 'desktop' && (
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Upload File</label>
                  <label className={`border-2 border-dashed ${theme === 'dark' ? 'border-slate-700 hover:border-blue-500' : 'border-slate-300 hover:border-blue-500'} rounded-lg p-6 cursor-pointer transition-colors text-center`}>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".csv,.xlsx,.json,.parquet"
                    />
                    {uploadedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <Check size={20} className="text-green-400" />
                        <div className="text-left">
                          <p className="font-medium text-green-400">{uploadedFile.name}</p>
                          <p className={`text-sm ${themeClasses.textSecondary(theme)}`}>
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className={themeClasses.textSecondary(theme)}>
                        <Upload size={24} className="mx-auto mb-2" />
                        <p>Click to upload or drag and drop</p>
                        <p className="text-xs mt-1">CSV, XLSX, JSON, Parquet</p>
                      </div>
                    )}
                  </label>
                </div>
              )}

              {/* Code Selection */}
              {formData.projectId && (
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Select Code (Optional)</label>
                  <select
                    value={selectedProjectCodeId || ''}
                    onChange={(e) => setSelectedProjectCodeId(e.target.value || null)}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-black'
                    }`}
                  >
                    <option value="">No code selected</option>
                    {getProjectCodes(formData.projectId).map(code => (
                      <option key={code.id} value={code.id}>{code.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-slate-700">
                <button
                  onClick={() => {
                    setShowJobModal(false);
                    setFormData({ name: '', projectId: '', dataSource: 'csv', sourceConfig: {} });
                    setSelectedProjectCodeId(null);
                    setUploadedFile(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-700 hover:bg-slate-600'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateJob}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Create Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
