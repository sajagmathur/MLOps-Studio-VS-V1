import React, { useState } from 'react';
import { Plus, Trash2, Upload, AlertCircle, Loader, Package, TrendingUp, Star, Check, Zap, Download } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobal } from '../contexts/GlobalContext';
import { useNotification } from '../hooks/useNotification';
import { Breadcrumb } from '../components/UIPatterns';
import { CodeTerminal } from '../components/CodeTerminal';
import { themeClasses } from '../utils/themeClasses';

export default function ModelRegistry() {
  const { theme } = useTheme();
  const global = useGlobal();
  const { showNotification } = useNotification();

  const [showModal, setShowModal] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    version: '1.0.0',
    projectId: '',
    modelType: 'classification' as const,
    stage: 'dev' as const,
  });
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; path: string; size: number; type: string } | null>(null);

  const selectedModel = selectedModelId ? global.getRegistryModel(selectedModelId) : null;

  const handleCreateModel = () => {
    if (!formData.name.trim() || !formData.projectId) {
      showNotification('Model name and project are required', 'warning');
      return;
    }

    const newModel = global.createRegistryModel({
      name: formData.name,
      version: formData.version,
      projectId: formData.projectId,
      codeId: selectedCodeId || undefined,
      modelType: formData.modelType,
      stage: formData.stage,
      status: 'active',
      metrics: {
        accuracy: Math.random() * 0.4 + 0.8,
        precision: Math.random() * 0.4 + 0.8,
        recall: Math.random() * 0.4 + 0.8,
      },
      uploadedFile: uploadedFile || undefined,
    });

    showNotification('Model registered successfully', 'success');
    setShowModal(false);
    setFormData({ name: '', version: '1.0.0', projectId: '', modelType: 'classification', stage: 'dev' });
    setSelectedCodeId(null);
    setUploadedFile(null);
  };

  const handlePromoteModel = (modelId: string, newStage: 'staging' | 'production') => {
    global.updateRegistryModel(modelId, { stage: newStage });
    showNotification(`Model promoted to ${newStage}`, 'success');
  };

  const handleDeleteModel = (modelId: string) => {
    if (confirm('Delete this model?')) {
      global.deleteRegistryModel(modelId);
      showNotification('Model deleted', 'success');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        path: `/models/${file.name}`,
        size: file.size,
        type: file.type,
      });
      showNotification(`Model uploaded: ${file.name}`, 'success');
    }
  };

  const modelTypes = [
    { value: 'classification', label: 'Classification' },
    { value: 'regression', label: 'Regression' },
    { value: 'clustering', label: 'Clustering' },
    { value: 'nlp', label: 'NLP' },
    { value: 'custom', label: 'Custom' },
  ];

  const getProjectCodes = (projectId: string) => {
    const project = global.getProject(projectId);
    return project?.code.filter(c => c.language === 'python') || [];
  };

  const stageColors = {
    dev: 'from-blue-600/20 to-blue-400/10 border-blue-400/30',
    staging: 'from-yellow-600/20 to-yellow-400/10 border-yellow-400/30',
    production: 'from-red-600/20 to-red-400/10 border-red-400/30',
  };

  const stageTextColors = {
    dev: 'text-blue-400',
    staging: 'text-yellow-400',
    production: 'text-red-400',
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Model Registry' }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${themeClasses.textPrimary(theme)}`}>Model Registry</h1>
          <p className={`${themeClasses.textSecondary(theme)} mt-1`}>Browse, manage, and promote ML models</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
        >
          <Plus size={20} />
          Register Model
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'} rounded-lg border ${theme === 'dark' ? 'border-white/10' : 'border-slate-300'}`}>
          <p className={`${themeClasses.textSecondary(theme)} text-xs font-medium mb-1`}>Total Models</p>
          <p className={`text-2xl font-bold ${themeClasses.textPrimary(theme)}`}>{global.registryModels.length}</p>
        </div>
        <div className={`p-4 ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'} rounded-lg border ${theme === 'dark' ? 'border-blue-400/30' : 'border-blue-300'}`}>
          <p className={`${themeClasses.textSecondary(theme)} text-xs font-medium mb-1`}>Dev</p>
          <p className="text-2xl font-bold text-blue-400">{global.registryModels.filter(m => m.stage === 'dev').length}</p>
        </div>
        <div className={`p-4 ${theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50'} rounded-lg border ${theme === 'dark' ? 'border-yellow-400/30' : 'border-yellow-300'}`}>
          <p className={`${themeClasses.textSecondary(theme)} text-xs font-medium mb-1`}>Staging</p>
          <p className="text-2xl font-bold text-yellow-400">{global.registryModels.filter(m => m.stage === 'staging').length}</p>
        </div>
        <div className={`p-4 ${theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'} rounded-lg border ${theme === 'dark' ? 'border-red-400/30' : 'border-red-300'}`}>
          <p className={`${themeClasses.textSecondary(theme)} text-xs font-medium mb-1`}>Production</p>
          <p className="text-2xl font-bold text-red-400">{global.registryModels.filter(m => m.stage === 'production').length}</p>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {global.registryModels.length === 0 ? (
          <div className={`col-span-full p-12 text-center ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'} rounded-lg border ${theme === 'dark' ? 'border-white/10' : 'border-slate-300'}`}>
            <Package size={48} className={`mx-auto mb-4 ${themeClasses.textSecondary(theme)}`} />
            <p className={`${themeClasses.textSecondary(theme)} mb-4`}>No models registered yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              Register your first model
            </button>
          </div>
        ) : (
          global.registryModels.map(model => (
            <div
              key={model.id}
              onClick={() => setSelectedModelId(model.id)}
              className={`p-6 bg-gradient-to-br ${stageColors[model.stage]} rounded-lg border cursor-pointer hover:border-white/50 transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${themeClasses.textPrimary(theme)}`}>{model.name}</h3>
                  <p className={`text-sm ${stageTextColors[model.stage]}`}>{model.stage.toUpperCase()}</p>
                </div>
                <div className="flex gap-2">
                  {model.stage !== 'production' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePromoteModel(model.id, model.stage === 'dev' ? 'staging' : 'production');
                      }}
                      className="p-2 hover:bg-blue-500/20 rounded-lg transition text-blue-400"
                      title="Promote model"
                    >
                      <TrendingUp size={16} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteModel(model.id);
                    }}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className={themeClasses.textSecondary(theme)}>Version</span>
                  <span className={themeClasses.textPrimary(theme)}>{model.version}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={themeClasses.textSecondary(theme)}>Type</span>
                  <span className={themeClasses.textPrimary(theme)}>{model.modelType}</span>
                </div>
              </div>

              {/* Metrics */}
              {model.metrics && (
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className={themeClasses.textSecondary(theme)}>Accuracy</span>
                    <span className={`font-semibold ${model.metrics.accuracy > 0.85 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {(model.metrics.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={themeClasses.textSecondary(theme)}>Precision</span>
                    <span className={`font-semibold ${model.metrics.precision > 0.85 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {(model.metrics.precision * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={themeClasses.textSecondary(theme)}>Recall</span>
                    <span className={`font-semibold ${model.metrics.recall > 0.85 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {(model.metrics.recall * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Model Details */}
      {selectedModel && (
        <div className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-300'} rounded-lg border p-6 space-y-6`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)}`}>{selectedModel.name}</h2>
            <button
              onClick={() => setSelectedModelId(null)}
              className={`px-4 py-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} rounded-lg transition`}
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}>
              <p className={`text-xs ${themeClasses.textSecondary(theme)} mb-1`}>VERSION</p>
              <p className={`text-lg font-bold ${themeClasses.textPrimary(theme)}`}>{selectedModel.version}</p>
            </div>
            <div className={`p-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}>
              <p className={`text-xs ${themeClasses.textSecondary(theme)} mb-1`}>MODEL TYPE</p>
              <p className={`text-lg font-bold ${themeClasses.textPrimary(theme)}`}>{selectedModel.modelType}</p>
            </div>
            <div className={`p-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}>
              <p className={`text-xs ${themeClasses.textSecondary(theme)} mb-1`}>STAGE</p>
              <p className={`text-lg font-bold ${stageTextColors[selectedModel.stage]}`}>{selectedModel.stage.toUpperCase()}</p>
            </div>
          </div>

          {/* Model File */}
          {selectedModel.uploadedFile && (
            <div className={`p-4 ${theme === 'dark' ? 'bg-green-500/10 border-green-400/30' : 'bg-green-50 border-green-300'} rounded border`}>
              <p className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                <Check size={16} />
                Model File
              </p>
              <div className={`text-sm ${themeClasses.textSecondary(theme)} space-y-1`}>
                <p>File: {selectedModel.uploadedFile.name}</p>
                <p>Size: {(selectedModel.uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <p>Path: {selectedModel.uploadedFile.path}</p>
              </div>
            </div>
          )}

          {/* Registration Code */}
          {selectedModel.codeId && global.getProject(selectedModel.projectId)?.code && (
            <CodeTerminal
              code={global.getProject(selectedModel.projectId)?.code.find(c => c.id === selectedModel.codeId)?.content}
              language="python"
              title="Model Registration Code"
              height="h-40"
            />
          )}

          {/* Promotion Workflow */}
          <div className={`p-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}>
            <p className="text-sm font-semibold mb-3">Promotion Workflow</p>
            <div className="flex items-center justify-between">
              <div className={`flex-1 p-3 rounded-lg text-center ${selectedModel.stage === 'dev' ? 'bg-blue-500/20 border-2 border-blue-400' : 'bg-slate-700/50 border border-slate-600'}`}>
                <p className="text-xs font-medium">Dev</p>
              </div>
              <div className={`px-3 ${themeClasses.textSecondary(theme)}`}>→</div>
              <div className={`flex-1 p-3 rounded-lg text-center ${selectedModel.stage === 'staging' ? 'bg-yellow-500/20 border-2 border-yellow-400' : 'bg-slate-700/50 border border-slate-600'}`}>
                <p className="text-xs font-medium">Staging</p>
              </div>
              <div className={`px-3 ${themeClasses.textSecondary(theme)}`}>→</div>
              <div className={`flex-1 p-3 rounded-lg text-center ${selectedModel.stage === 'production' ? 'bg-red-500/20 border-2 border-red-400' : 'bg-slate-700/50 border border-slate-600'}`}>
                <p className="text-xs font-medium">Production</p>
              </div>
            </div>
            {selectedModel.stage !== 'production' && (
              <button
                onClick={() => handlePromoteModel(selectedModel.id, selectedModel.stage === 'dev' ? 'staging' : 'production')}
                className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
              >
                <Zap size={16} />
                Promote to {selectedModel.stage === 'dev' ? 'Staging' : 'Production'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create Model Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-8 w-full max-w-2xl border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'} max-h-[90vh] overflow-y-auto`}>
            <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-6`}>Register New Model</h2>

            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Model Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-black'
                  }`}
                  placeholder="e.g., Customer Churn Predictor"
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

              <div className="grid grid-cols-2 gap-4">
                {/* Version */}
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-black'
                    }`}
                    placeholder="1.0.0"
                  />
                </div>

                {/* Model Type */}
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Model Type</label>
                  <select
                    value={formData.modelType}
                    onChange={(e) => setFormData({ ...formData, modelType: e.target.value as any })}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-black'
                    }`}
                  >
                    {modelTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Model File Upload */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Upload Model File</label>
                <label className={`border-2 border-dashed ${theme === 'dark' ? 'border-slate-700 hover:border-blue-500' : 'border-slate-300 hover:border-blue-500'} rounded-lg p-6 cursor-pointer transition-colors text-center`}>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pkl,.joblib,.h5,.pth,.onnx"
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
                      <p>Click to upload model file</p>
                      <p className="text-xs mt-1">PKL, JobLib, H5, PyTorch, ONNX</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Registration Code */}
              {formData.projectId && (
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Select Registration Code</label>
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
                    setShowModal(false);
                    setFormData({ name: '', version: '1.0.0', projectId: '', modelType: 'classification', stage: 'dev' });
                    setSelectedCodeId(null);
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
                  onClick={handleCreateModel}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Register Model
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
