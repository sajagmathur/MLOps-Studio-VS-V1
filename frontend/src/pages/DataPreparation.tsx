import React, { useState } from 'react';
import { Plus, Trash2, Play, AlertCircle, Loader, Link, ArrowRight, Check, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobal } from '../contexts/GlobalContext';
import { useNotification } from '../hooks/useNotification';
import { Breadcrumb } from '../components/UIPatterns';
import { CodeTerminal } from '../components/CodeTerminal';
import { themeClasses } from '../utils/themeClasses';

export default function DataPreparation() {
  const { theme } = useTheme();
  const global = useGlobal();
  const { showNotification } = useNotification();

  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    ingestionJobId: '',
    processingConfig: {},
  });
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);

  const selectedJob = selectedJobId ? global.getPreparationJob(selectedJobId) : null;

  const handleCreateJob = () => {
    if (!formData.name.trim() || !formData.projectId || !formData.ingestionJobId) {
      showNotification('Job name, project, and source data are required', 'warning');
      return;
    }

    const newJob = global.createPreparationJob({
      name: formData.name,
      projectId: formData.projectId,
      ingestionJobId: formData.ingestionJobId,
      codeId: selectedCodeId || undefined,
      processingConfig: formData.processingConfig,
      status: 'created',
    });

    showNotification('Data preparation job created', 'success');
    setShowJobModal(false);
    setFormData({ name: '', projectId: '', ingestionJobId: '', processingConfig: {} });
    setSelectedCodeId(null);
  };

  const handleRunJob = (jobId: string) => {
    global.updatePreparationJob(jobId, { status: 'running' });
    
    setTimeout(() => {
      const ingestionJob = global.getIngestionJob(global.getPreparationJob(jobId)?.ingestionJobId || '');
      global.updatePreparationJob(jobId, {
        status: 'completed',
        outputPath: `/data/prepared_${Date.now()}.csv`,
        outputShape: {
          rows: (ingestionJob?.outputShape?.rows || 5000) * 0.95, // 95% after cleaning
          columns: (ingestionJob?.outputShape?.columns || 15) * 0.9, // 90% after encoding
        },
        outputColumns: ['id', 'age_normalized', 'income_normalized', 'credit_score_normalized', 'employment_binary'],
        lastRun: new Date().toISOString(),
      });
      showNotification('Data preparation completed', 'success');
    }, 2000);
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Delete this job?')) {
      global.deletePreparationJob(jobId);
      showNotification('Job deleted', 'success');
    }
  };

  const getProjectCodes = (projectId: string) => {
    const project = global.getProject(projectId);
    return project?.code.filter(c => c.language === 'python') || [];
  };

  const getAvailableIngestionJobs = (projectId: string) => {
    return global.ingestionJobs.filter(j => j.projectId === projectId && j.status === 'completed');
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Data Preparation' }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${themeClasses.textPrimary(theme)}`}>Data Preparation</h1>
          <p className={`${themeClasses.textSecondary(theme)} mt-1`}>Transform and prepare ingested data</p>
        </div>
        <button
          onClick={() => setShowJobModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
        >
          <Plus size={20} />
          New Preparation Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'} rounded-lg border ${theme === 'dark' ? 'border-white/10' : 'border-slate-300'}`}>
          <p className={`${themeClasses.textSecondary(theme)} text-xs font-medium mb-1`}>Total Jobs</p>
          <p className={`text-2xl font-bold ${themeClasses.textPrimary(theme)}`}>{global.preparationJobs.length}</p>
        </div>
        <div className={`p-4 ${theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'} rounded-lg border ${theme === 'dark' ? 'border-green-400/30' : 'border-green-300'}`}>
          <p className={`${themeClasses.textSecondary(theme)} text-xs font-medium mb-1`}>Completed</p>
          <p className="text-2xl font-bold text-green-400">{global.preparationJobs.filter(j => j.status === 'completed').length}</p>
        </div>
        <div className={`p-4 ${theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50'} rounded-lg border ${theme === 'dark' ? 'border-yellow-400/30' : 'border-yellow-300'}`}>
          <p className={`${themeClasses.textSecondary(theme)} text-xs font-medium mb-1`}>Running</p>
          <p className="text-2xl font-bold text-yellow-400">{global.preparationJobs.filter(j => j.status === 'running').length}</p>
        </div>
        <div className={`p-4 ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'} rounded-lg border ${theme === 'dark' ? 'border-blue-400/30' : 'border-blue-300'}`}>
          <p className={`${themeClasses.textSecondary(theme)} text-xs font-medium mb-1`}>Created</p>
          <p className="text-2xl font-bold text-blue-400">{global.preparationJobs.filter(j => j.status === 'created').length}</p>
        </div>
      </div>

      {/* Jobs List */}
      <div className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-300'} rounded-lg border overflow-hidden`}>
        {global.preparationJobs.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle size={48} className={`mx-auto mb-4 ${themeClasses.textSecondary(theme)}`} />
            <p className={`${themeClasses.textSecondary(theme)} mb-4`}>No preparation jobs yet</p>
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
                  <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary(theme)}`}>Source Data</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary(theme)}`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary(theme)}`}>Output</th>
                  <th className={`px-6 py-3 text-right text-xs font-medium ${themeClasses.textSecondary(theme)}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`${theme === 'dark' ? 'divide-white/10' : 'divide-slate-300'} divide-y`}>
                {global.preparationJobs.map(job => {
                  const sourceJob = global.getIngestionJob(job.ingestionJobId);
                  return (
                    <tr key={job.id} className={`hover:${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'} transition cursor-pointer`} onClick={() => setSelectedJobId(job.id)}>
                      <td className={`px-6 py-4 font-medium ${themeClasses.textPrimary(theme)}`}>{job.name}</td>
                      <td className={`px-6 py-4 ${themeClasses.textSecondary(theme)}`}>
                        <div className="flex items-center gap-2">
                          <span>{sourceJob?.name}</span>
                          {sourceJob?.outputPath && <Check size={14} className="text-green-400" />}
                        </div>
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
                            <p>{Math.floor(job.outputShape?.rows || 0).toLocaleString()} rows × {job.outputShape?.columns} cols</p>
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
                          disabled={job.status === 'running' || !sourceJob?.outputPath}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition ${
                            job.status === 'running' || !sourceJob?.outputPath
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

          {/* Source Data Link */}
          <div className={`p-4 ${theme === 'dark' ? 'bg-blue-500/10 border-blue-400/30' : 'bg-blue-50 border-blue-300'} rounded border`}>
            <p className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Link size={16} />
              Source Data (Ingestion Job)
            </p>
            {global.getIngestionJob(selectedJob.ingestionJobId) && (
              <div className={`text-sm ${themeClasses.textSecondary(theme)} space-y-1`}>
                <p>Job: {global.getIngestionJob(selectedJob.ingestionJobId)?.name}</p>
                <p>Status: {global.getIngestionJob(selectedJob.ingestionJobId)?.status}</p>
                <p>Rows Available: {global.getIngestionJob(selectedJob.ingestionJobId)?.outputShape?.rows?.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Processing Configuration */}
          <div className={`p-4 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-100'} rounded border ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}>
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Settings size={16} />
              Processing Configuration
            </p>
            <div className={`text-sm ${themeClasses.textSecondary(theme)} space-y-2`}>
              <div className="flex justify-between">
                <span>Handle Missing Values:</span>
                <span className={themeClasses.textPrimary(theme)}>Mean Imputation</span>
              </div>
              <div className="flex justify-between">
                <span>Feature Scaling:</span>
                <span className={themeClasses.textPrimary(theme)}>Normalization</span>
              </div>
              <div className="flex justify-between">
                <span>Encoding:</span>
                <span className={themeClasses.textPrimary(theme)}>One-Hot</span>
              </div>
            </div>
          </div>

          {/* Output Data */}
          {selectedJob.outputPath && (
            <div className={`p-4 ${theme === 'dark' ? 'bg-green-500/10 border-green-400/30' : 'bg-green-50 border-green-300'} rounded border`}>
              <p className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                <Check size={16} />
                Output Data
              </p>
              <div className={`text-sm ${themeClasses.textSecondary(theme)} space-y-1`}>
                <p>Rows: {Math.floor(selectedJob.outputShape?.rows || 0).toLocaleString()}</p>
                <p>Columns: {selectedJob.outputShape?.columns}</p>
                <p>Path: {selectedJob.outputPath}</p>
                {selectedJob.outputColumns && (
                  <div className="mt-2">
                    <p className="font-semibold text-xs mb-1">Columns:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedJob.outputColumns.slice(0, 5).map((col, i) => (
                        <span key={i} className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'} text-green-400`}>
                          {col}
                        </span>
                      ))}
                      {selectedJob.outputColumns.length > 5 && (
                        <span className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'} text-green-400`}>
                          +{selectedJob.outputColumns.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing Code */}
          {selectedJob.codeId && global.getProject(selectedJob.projectId)?.code && (
            <CodeTerminal
              code={global.getProject(selectedJob.projectId)?.code.find(c => c.id === selectedJob.codeId)?.content}
              language="python"
              title="Preparation Code"
              height="h-40"
            />
          )}
        </div>
      )}

      {/* Create Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-8 w-full max-w-2xl border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'} max-h-[90vh] overflow-y-auto`}>
            <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-6`}>Create Data Preparation Job</h2>

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
                  placeholder="e.g., Clean & Normalize Data"
                />
              </div>

              {/* Project Selection */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Select Project *</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => {
                    setFormData({ ...formData, projectId: e.target.value, ingestionJobId: '' });
                    setSelectedCodeId(null);
                  }}
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

              {/* Source Data (Ingestion Job) */}
              {formData.projectId && (
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Link Ingested Data *</label>
                  <select
                    value={formData.ingestionJobId}
                    onChange={(e) => setFormData({ ...formData, ingestionJobId: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-black'
                    }`}
                  >
                    <option value="">Choose ingestion job...</option>
                    {getAvailableIngestionJobs(formData.projectId).map(job => (
                      <option key={job.id} value={job.id}>
                        {job.name} ({job.outputShape?.rows?.toLocaleString()} rows)
                      </option>
                    ))}
                  </select>
                  {getAvailableIngestionJobs(formData.projectId).length === 0 && (
                    <p className="text-sm text-yellow-400 mt-2">⚠️ No completed ingestion jobs found for this project</p>
                  )}
                </div>
              )}

              {/* Processing Code */}
              {formData.projectId && (
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Select Processing Code</label>
                  <select
                    value={selectedCodeId || ''}
                    onChange={(e) => setSelectedCodeId(e.target.value || null)}
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
                    setFormData({ name: '', projectId: '', ingestionJobId: '', processingConfig: {} });
                    setSelectedCodeId(null);
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
