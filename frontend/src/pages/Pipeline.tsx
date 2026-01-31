import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Play, Pause, RotateCcw, ArrowRight, CheckCircle, Clock, AlertCircle, Loader, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobal } from '../contexts/GlobalContext';
import { useNotification } from '../hooks/useNotification';
import { themeClasses } from '../utils/themeClasses';

interface PipelineStage {
  id: string;
  name: string;
  jobId?: string;
  type: 'ingestion' | 'preparation' | 'training' | 'registry' | 'deployment' | 'inferencing' | 'monitoring';
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  logs?: string[];
}

interface PipelineVisualization {
  id: string;
  projectId: string;
  name: string;
  stages: PipelineStage[];
  status: 'created' | 'running' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  executedAt?: string;
  totalDuration?: number;
}

export default function Pipeline() {
  const { theme } = useTheme();
  const global = useGlobal();
  const { showNotification } = useNotification();

  const [pipelines, setPipelines] = useState<PipelineVisualization[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
  });
  const [selectedStages, setSelectedStages] = useState<Set<string>>(new Set());
  const [stageOrder, setStageOrder] = useState<string[]>([]);

  const selectedPipeline = selectedPipelineId ? pipelines.find(p => p.id === selectedPipelineId) : null;

  const stageOptions = [
    { id: 'ingestion', name: 'Data Ingestion', color: 'bg-blue-500' },
    { id: 'preparation', name: 'Data Preparation', color: 'bg-cyan-500' },
    { id: 'training', name: 'Model Training', color: 'bg-purple-500' },
    { id: 'registry', name: 'Model Registry', color: 'bg-pink-500' },
    { id: 'deployment', name: 'Deployment', color: 'bg-orange-500' },
    { id: 'inferencing', name: 'Inferencing', color: 'bg-green-500' },
    { id: 'monitoring', name: 'Monitoring', color: 'bg-red-500' },
  ];

  const getStageColor = (stageType: string) => {
    const stage = stageOptions.find(s => s.id === stageType);
    return stage?.color || 'bg-slate-500';
  };

  const handleCreatePipeline = () => {
    if (!formData.name || !formData.projectId || selectedStages.size === 0) {
      showNotification('All fields and at least one stage required', 'warning');
      return;
    }

    const newPipeline: PipelineVisualization = {
      id: `pipeline-${Date.now()}`,
      projectId: formData.projectId,
      name: formData.name,
      stages: stageOrder.map(stageId => ({
        id: `stage-${Date.now()}-${stageId}`,
        name: stageOptions.find(s => s.id === stageId)?.name || stageId,
        type: stageId as any,
        status: 'pending',
      })),
      status: 'created',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    setPipelines([...pipelines, newPipeline]);
    showNotification('Pipeline created successfully', 'success');
    setShowCreateModal(false);
    setFormData({ name: '', projectId: '' });
    setSelectedStages(new Set());
    setStageOrder([]);
    setSelectedPipelineId(newPipeline.id);
  };

  const handleToggleStage = (stageId: string) => {
    const newSelected = new Set(selectedStages);
    if (newSelected.has(stageId)) {
      newSelected.delete(stageId);
      setStageOrder(stageOrder.filter(s => s !== stageId));
    } else {
      newSelected.add(stageId);
      setStageOrder([...stageOrder, stageId]);
    }
    setSelectedStages(newSelected);
  };

  const handleExecutePipeline = (pipelineId: string) => {
    setPipelines(pipelines.map(p => {
      if (p.id === pipelineId) {
        return {
          ...p,
          status: 'running',
          executedAt: new Date().toISOString(),
          stages: p.stages.map((s, idx) => ({
            ...s,
            status: idx === 0 ? 'running' : 'pending',
            logs: idx === 0 ? [`Starting ${s.name}...`] : [],
          })),
        };
      }
      return p;
    }));

    // Simulate pipeline execution
    let currentStageIndex = 0;
    const interval = setInterval(() => {
      setPipelines(prev => {
        const updated = [...prev];
        const pipelineIdx = updated.findIndex(p => p.id === pipelineId);
        if (pipelineIdx === -1) {
          clearInterval(interval);
          return prev;
        }

        const pipeline = updated[pipelineIdx];

        // Complete current stage
        if (currentStageIndex < pipeline.stages.length) {
          const currentStage = pipeline.stages[currentStageIndex];
          currentStage.status = 'completed';
          currentStage.duration = Math.floor(Math.random() * 3000) + 1000;
          currentStage.logs = [
            ...( currentStage.logs || []),
            `Processing ${currentStage.name}...`,
            `✓ ${currentStage.name} completed in ${currentStage.duration}ms`,
          ];

          // Move to next stage
          if (currentStageIndex < pipeline.stages.length - 1) {
            currentStageIndex++;
            pipeline.stages[currentStageIndex].status = 'running';
            pipeline.stages[currentStageIndex].logs = [`Starting ${pipeline.stages[currentStageIndex].name}...`];
          } else {
            // All stages completed
            clearInterval(interval);
            pipeline.status = 'completed';
            pipeline.progress = 100;
            const totalDuration = pipeline.stages.reduce((sum, s) => sum + (s.duration || 0), 0);
            pipeline.totalDuration = totalDuration;
            pipeline.stages.forEach(s => {
              if (!s.logs) s.logs = [];
              s.logs.push('✓ Stage completed');
            });
            showNotification('Pipeline execution completed successfully', 'success');
            return updated;
          }

          // Update progress
          const completedStages = pipeline.stages.filter(s => s.status === 'completed').length;
          pipeline.progress = Math.round((completedStages / pipeline.stages.length) * 100);
        }

        return updated;
      });
    }, 3000);
  };

  const handleDeletePipeline = (pipelineId: string) => {
    if (confirm('Delete this pipeline?')) {
      setPipelines(pipelines.filter(p => p.id !== pipelineId));
      if (selectedPipelineId === pipelineId) setSelectedPipelineId(null);
      showNotification('Pipeline deleted', 'success');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'running':
        return <Loader className="text-blue-400 animate-spin" size={20} />;
      case 'failed':
        return <AlertCircle className="text-red-400" size={20} />;
      default:
        return <Clock className="text-slate-400" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${themeClasses.textPrimary(theme)}`}>ML Pipelines</h1>
          <p className={`${themeClasses.textSecondary(theme)} mt-1`}>Orchestrate and monitor ML workflows</p>
        </div>
        <button
          onClick={() => {
            setShowCreateModal(true);
            setFormData({ name: '', projectId: '' });
            setSelectedStages(new Set());
            setStageOrder([]);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus size={18} />
          New Pipeline
        </button>
      </div>

      {/* Pipelines Grid */}
      {pipelines.length === 0 ? (
        <div className={`text-center py-12 ${themeClasses.textSecondary(theme)}`}>
          <p>No pipelines created yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pipelines.map(pipeline => (
            <div
              key={pipeline.id}
              onClick={() => setSelectedPipelineId(pipeline.id)}
              className={`rounded-lg border backdrop-blur-sm transition-all cursor-pointer ${
                selectedPipelineId === pipeline.id
                  ? `${theme === 'dark' ? 'bg-blue-900/50 border-blue-500' : 'bg-blue-100 border-blue-500'} border-2`
                  : `${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 border-slate-300'}`
              }`}
            >
              <div className={`p-4 border-b ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-300'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded ${
                      pipeline.status === 'completed' ? 'bg-green-500/20' :
                      pipeline.status === 'running' ? 'bg-blue-500/20' :
                      pipeline.status === 'failed' ? 'bg-red-500/20' :
                      'bg-slate-500/20'
                    }`}>
                      {getStatusIcon(pipeline.status)}
                    </div>
                    <div>
                      <h3 className={`font-semibold text-lg ${themeClasses.textPrimary(theme)}`}>{pipeline.name}</h3>
                      <p className={`text-sm ${themeClasses.textSecondary(theme)}`}>{global.getProject(pipeline.projectId)?.name}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    pipeline.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    pipeline.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {pipeline.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-300'}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                    style={{ width: `${pipeline.progress}%` }}
                  ></div>
                </div>
                <p className={`text-xs ${themeClasses.textSecondary(theme)} mt-1`}>{pipeline.progress}% complete</p>
              </div>

              {/* Pipeline Visualization */}
              <div className="p-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-3">
                  {pipeline.stages.map((stage, idx) => (
                    <div key={stage.id} className="flex items-center gap-2 flex-shrink-0">
                      <div className={`flex flex-col items-center`}>
                        <div className={`w-12 h-12 rounded-lg ${getStageColor(stage.type)} flex items-center justify-center text-white font-semibold text-xs text-center p-1`}>
                          {stage.name.split(' ')[0]}
                        </div>
                        <div className={`mt-1 ${stage.status === 'completed' ? 'text-green-400' : stage.status === 'running' ? 'text-blue-400' : stage.status === 'failed' ? 'text-red-400' : 'text-slate-400'}`}>
                          {getStatusIcon(stage.status)}
                        </div>
                      </div>
                      {idx < pipeline.stages.length - 1 && <ArrowRight className={themeClasses.textSecondary(theme)} />}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  {pipeline.status === 'created' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExecutePipeline(pipeline.id);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
                    >
                      <Play size={14} />
                      Execute Pipeline
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePipeline(pipeline.id);
                    }}
                    className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Pipeline Simulation */}
      {selectedPipeline && (
        <div className={`rounded-lg border backdrop-blur-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'} p-6 mt-6`}>
          <h2 className={`text-2xl font-bold mb-6 ${themeClasses.textPrimary(theme)}`}>Live Pipeline Simulation: {selectedPipeline.name}</h2>

          {/* Pipeline Stages with Detailed Logs */}
          <div className="space-y-4">
            {selectedPipeline.stages.map((stage, idx) => (
              <div key={stage.id} className={`rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} p-4`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded ${getStageColor(stage.type)}`}>
                      {getStatusIcon(stage.status)}
                    </div>
                    <div>
                      <h4 className={`font-semibold ${themeClasses.textPrimary(theme)}`}>{stage.name}</h4>
                      <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>
                        {stage.status === 'completed' && stage.duration
                          ? `Completed in ${stage.duration}ms`
                          : stage.status === 'running'
                          ? 'Processing...'
                          : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                    stage.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    stage.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                    stage.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {stage.status}
                  </span>
                </div>

                {/* Stage Logs */}
                {stage.logs && stage.logs.length > 0 && (
                  <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'} rounded p-3 font-mono text-xs max-h-32 overflow-y-auto`}>
                    {stage.logs.map((log, i) => (
                      <div key={i} className={`${log.includes('✓') ? 'text-green-400' : log.includes('Error') ? 'text-red-400' : themeClasses.textSecondary(theme)}`}>
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          {selectedPipeline.status === 'completed' && (
            <div className={`rounded-lg border ${theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-100/20 border-green-300'} p-4 mt-6`}>
              <h4 className="text-green-400 font-semibold mb-2">Pipeline Completed Successfully! ✓</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className={themeClasses.textSecondary(theme)}>Total Duration</p>
                  <p className="text-green-400 font-semibold">{selectedPipeline.totalDuration}ms</p>
                </div>
                <div>
                  <p className={themeClasses.textSecondary(theme)}>Stages Executed</p>
                  <p className="text-green-400 font-semibold">{selectedPipeline.stages.length}</p>
                </div>
                <div>
                  <p className={themeClasses.textSecondary(theme)}>Status</p>
                  <p className="text-green-400 font-semibold">All Passed</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Pipeline Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm overflow-y-auto">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'} sticky top-0`}>
              <h2 className={`text-lg font-bold ${themeClasses.textPrimary(theme)}`}>Create New Pipeline</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Pipeline Name */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Pipeline Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Production ML Workflow"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
                />
              </div>

              {/* Project Selection */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Project *</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
                >
                  <option value="">Select a project...</option>
                  {global.projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Stage Selection */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${themeClasses.textPrimary(theme)}`}>Pipeline Stages * (Drag to reorder)</label>
                <div className="grid grid-cols-2 gap-3">
                  {stageOptions.map(stage => (
                    <button
                      key={stage.id}
                      onClick={() => handleToggleStage(stage.id)}
                      className={`p-3 rounded-lg border-2 transition text-left ${
                        selectedStages.has(stage.id)
                          ? `${theme === 'dark' ? 'bg-blue-900/50 border-blue-500' : 'bg-blue-100 border-blue-500'}`
                          : `${theme === 'dark' ? 'bg-slate-900 border-slate-700 hover:border-slate-600' : 'bg-slate-100 border-slate-300 hover:border-slate-400'}`
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${selectedStages.has(stage.id) ? 'bg-blue-500' : 'bg-slate-500'}`}></div>
                        <span className={`text-sm ${themeClasses.textPrimary(theme)}`}>{stage.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Order */}
              {stageOrder.length > 0 && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Pipeline Order</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {stageOrder.map((stageId, idx) => (
                      <div key={stageId} className="flex items-center gap-2">
                        <div className={`px-3 py-2 rounded ${getStageColor(stageId)} text-white text-sm font-semibold`}>
                          {stageOptions.find(s => s.id === stageId)?.name}
                        </div>
                        {idx < stageOrder.length - 1 && <ArrowRight size={16} className={themeClasses.textSecondary(theme)} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} transition`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePipeline}
                  disabled={!formData.name || !formData.projectId || selectedStages.size === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition"
                >
                  Create Pipeline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
