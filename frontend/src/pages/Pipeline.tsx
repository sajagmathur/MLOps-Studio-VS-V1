import React, { useState } from 'react';
import { Plus, Lock, Unlock, Play, Save, Trash2, Edit2, CheckCircle, Clock, AlertCircle, Code, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import { Breadcrumb } from '../components/UIPatterns';

interface PipelineNode {
  id: string;
  name: string;
  type: 'input' | 'process' | 'monitor' | 'output';
  locked: boolean;
  x: number;
  y: number;
}

interface Pipeline {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'submitted' | 'running' | 'completed' | 'failed';
  locked: boolean;
  nodes: PipelineNode[];
  createdAt: string;
  lastRun?: string;
  githubYaml?: string;
  approvals?: number;
  requiredApprovals?: number;
}

interface PipelineRun {
  id: string;
  pipelineId: string;
  pipelineName: string;
  status: 'completed' | 'running' | 'failed' | 'pending_approval';
  branch: string;
  commit: string;
  timestamp: string;
  duration: string;
  approvals?: number;
  required?: number;
  error?: string;
}

const Pipeline: React.FC = () => {
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  const [view, setView] = useState<'pipelines' | 'builder' | 'runs'>('pipelines');
  const [pipelines, setPipelines] = useState<Pipeline[]>([
    {
      id: '1',
      name: 'ML Training Pipeline',
      description: 'End-to-end training pipeline with validation',
      status: 'submitted',
      locked: true,
      createdAt: '2 days ago',
      lastRun: '1 hour ago',
      nodes: [
        { id: '1', name: 'Data Ingestion', type: 'input', locked: false, x: 50, y: 200 },
        { id: '2', name: 'Data Preparation', type: 'process', locked: false, x: 250, y: 200 },
        { id: '3', name: 'Feature Store', type: 'process', locked: false, x: 450, y: 200 },
        { id: '4', name: 'Model Registry', type: 'process', locked: true, x: 650, y: 200 },
        { id: '5', name: 'Model Deployment', type: 'process', locked: false, x: 850, y: 200 },
        { id: '6', name: 'Model Inference', type: 'process', locked: false, x: 1050, y: 200 },
        { id: '7', name: 'Model Monitoring', type: 'monitor', locked: false, x: 1250, y: 200 },
        { id: '8', name: 'CI/CD Enforcement', type: 'output', locked: true, x: 1450, y: 200 },
      ],
      githubYaml: `name: ML Training Pipeline
on:
  push:
    branches: [main]
jobs:
  train:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Data Ingestion
        run: python scripts/ingest-data.py
      - name: Data Preparation
        run: python scripts/prepare-data.py
      - name: Model Training
        run: python scripts/train-model.py
      - name: Model Registry Push
        run: python scripts/register-model.py`,
    },
    {
      id: '2',
      name: 'Data Quality Pipeline',
      description: 'Monitors data quality and drift',
      status: 'draft',
      locked: false,
      createdAt: '5 hours ago',
      nodes: [
        { id: '1', name: 'Data Ingestion', type: 'input', locked: false, x: 50, y: 200 },
        { id: '2', name: 'Quality Checks', type: 'process', locked: false, x: 250, y: 200 },
        { id: '3', name: 'Drift Detection', type: 'monitor', locked: false, x: 450, y: 200 },
      ],
    },
  ]);

  const [runs, setRuns] = useState<PipelineRun[]>([
    {
      id: '1',
      pipelineId: '1',
      pipelineName: 'ML Training Pipeline',
      status: 'completed',
      branch: 'main',
      commit: 'a3f8c2e',
      timestamp: '5 mins ago',
      duration: '2m 34s',
      approvals: 2,
    },
    {
      id: '2',
      pipelineId: '1',
      pipelineName: 'ML Training Pipeline',
      status: 'pending_approval',
      branch: 'main',
      commit: 'f2e9d1c',
      timestamp: '15 mins ago',
      duration: '5m 12s',
      approvals: 1,
      required: 2,
    },
    {
      id: '3',
      pipelineId: '2',
      pipelineName: 'Data Quality Pipeline',
      status: 'running',
      branch: 'develop',
      commit: 'b1e4a3f',
      timestamp: '2 hours ago',
      duration: '3m 45s',
      approvals: 0,
    },
  ]);

  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showYamlModal, setShowYamlModal] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [newPipelineDesc, setNewPipelineDesc] = useState('');
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [nodes, setNodes] = useState<PipelineNode[]>([]);

  const toggleNodeLock = (nodeId: string) => {
    setNodes(nodes.map(n => 
      n.id === nodeId ? { ...n, locked: !n.locked } : n
    ));
  };

  const getNodeColor = (type: string, locked: boolean) => {
    if (locked) return 'bg-red-600/20 border-red-500';
    const colors: Record<string, string> = {
      input: 'bg-blue-600/20 border-blue-500',
      process: 'bg-green-600/20 border-green-500',
      monitor: 'bg-yellow-600/20 border-yellow-500',
      output: 'bg-purple-600/20 border-purple-500',
    };
    return colors[type] || 'bg-gray-600/20 border-gray-500';
  };

  const handleCreatePipeline = () => {
    if (!newPipelineName.trim()) {
      showNotification('Please enter a pipeline name', 'error');
      return;
    }

    const newPipeline: Pipeline = {
      id: Date.now().toString(),
      name: newPipelineName,
      description: newPipelineDesc,
      status: 'draft',
      locked: false,
      nodes: [],
      createdAt: 'just now',
    };

    setPipelines([...pipelines, newPipeline]);
    setSelectedPipeline(newPipeline);
    setEditingPipeline(newPipeline);
    setNodes([]);
    setView('builder');
    setShowCreateModal(false);
    setNewPipelineName('');
    setNewPipelineDesc('');
    showNotification('Pipeline created successfully', 'success');
  };

  const handleEditPipeline = (pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
    setEditingPipeline(pipeline);
    setNodes(pipeline.nodes);
    setView('builder');
  };

  const handleSubmitPipeline = () => {
    if (!editingPipeline) return;

    const updatedPipeline: Pipeline = {
      ...editingPipeline,
      nodes,
      status: 'submitted',
      locked: true,
      githubYaml: `name: ${editingPipeline.name}
on:
  push:
    branches: [main]
jobs:
  pipeline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      ${nodes.map((n, i) => `- name: ${n.name}\n        run: python scripts/${n.name.toLowerCase().replace(/ /g, '-')}.py`).join('\n      ')}`,
    };

    setPipelines(pipelines.map(p => p.id === updatedPipeline.id ? updatedPipeline : p));
    setView('pipelines');
    showNotification('Pipeline submitted and locked successfully', 'success');
  };

  const handleSaveDraft = () => {
    if (!editingPipeline) return;

    const updatedPipeline: Pipeline = {
      ...editingPipeline,
      nodes,
    };

    setPipelines(pipelines.map(p => p.id === updatedPipeline.id ? updatedPipeline : p));
    showNotification('Pipeline draft saved', 'success');
  };

  const handleDeletePipeline = (id: string) => {
    setPipelines(pipelines.filter(p => p.id !== id));
    showNotification('Pipeline deleted', 'success');
  };

  const handleRunPipeline = (id: string) => {
    const pipeline = pipelines.find(p => p.id === id);
    if (!pipeline) return;

    const newRun: PipelineRun = {
      id: Date.now().toString(),
      pipelineId: id,
      pipelineName: pipeline.name,
      status: 'running',
      branch: 'main',
      commit: 'abc123',
      timestamp: 'just now',
      duration: '0s',
      approvals: 0,
    };

    setRuns([newRun, ...runs]);
    showNotification(`Pipeline "${pipeline.name}" started`, 'success');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'pending_approval':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600/10 border-green-500 text-green-400';
      case 'running':
        return 'bg-blue-600/10 border-blue-500 text-blue-400';
      case 'failed':
        return 'bg-red-600/10 border-red-500 text-red-400';
      case 'pending_approval':
        return 'bg-yellow-600/10 border-yellow-500 text-yellow-400';
      case 'draft':
        return 'bg-gray-600/10 border-gray-500 text-gray-400';
      case 'submitted':
        return 'bg-purple-600/10 border-purple-500 text-purple-400';
      default:
        return 'bg-gray-600/10 border-gray-500 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Pipelines' },
          ...(view === 'builder' && selectedPipeline ? [{ label: selectedPipeline.name }] : [])
        ]} 
      />

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-700 pb-4">
        <button
          onClick={() => setView('pipelines')}
          className={`px-4 py-2 font-semibold transition ${
            view === 'pipelines'
              ? 'text-blue-400 border-b-2 border-blue-400 pb-2'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Pipelines
        </button>
        <button
          onClick={() => setView('runs')}
          className={`px-4 py-2 font-semibold transition ${
            view === 'runs'
              ? 'text-blue-400 border-b-2 border-blue-400 pb-2'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Runs
        </button>
      </div>

      {/* Pipelines View */}
      {view === 'pipelines' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Pipelines</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              New Pipeline
            </button>
          </div>

          {/* Pipelines List */}
          <div className="grid gap-4">
            {pipelines.map(pipeline => (
              <div
                key={pipeline.id}
                className={`border-l-4 rounded-lg p-5 cursor-pointer hover:bg-gray-700/50 transition ${getStatusColor(pipeline.status)} border`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{pipeline.name}</h3>
                      {pipeline.locked && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-600/20 border border-red-500 rounded text-xs text-red-400">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                        {pipeline.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{pipeline.description}</p>
                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                      <span>Created {pipeline.createdAt}</span>
                      {pipeline.lastRun && <span>Last run {pipeline.lastRun}</span>}
                      <span>{pipeline.nodes.length} nodes</span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {!pipeline.locked && (
                      <>
                        <button
                          onClick={() => handleEditPipeline(pipeline)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                          title="Edit pipeline"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePipeline(pipeline.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                          title="Delete pipeline"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {pipeline.locked && (
                      <button
                        onClick={() => handleRunPipeline(pipeline.id)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg transition"
                        title="Run pipeline"
                      >
                        <Play className="w-4 h-4" />
                        Run
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedPipeline(pipeline);
                        setShowYamlModal(true);
                      }}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                      title="View GitHub Actions YAML"
                    >
                      <Code className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Builder View */}
      {view === 'builder' && editingPipeline && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{editingPipeline.name}</h1>
              <p className="text-gray-400 mt-1">{editingPipeline.description}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setView('pipelines')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDraft}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              {!editingPipeline.locked && (
                <button
                  onClick={handleSubmitPipeline}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  Submit & Lock
                </button>
              )}
            </div>
          </div>

          {/* Canvas */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 overflow-x-auto">
            <div className="relative inline-block" style={{ minWidth: '1600px', minHeight: '400px' }}>
              {/* Connection Lines */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ top: 0, left: 0 }}
              >
                {nodes.slice(0, -1).map((node, idx) => {
                  const nextNode = nodes[idx + 1];
                  return (
                    <line
                      key={`line-${node.id}`}
                      x1={node.x + 80}
                      y1={node.y + 40}
                      x2={nextNode.x}
                      y2={nextNode.y + 40}
                      stroke="#4b5563"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>

              {/* Nodes */}
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={`absolute flex flex-col items-center justify-center w-32 h-20 border-2 rounded-lg transition cursor-pointer hover:shadow-lg ${getNodeColor(node.type, node.locked)}`}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                >
                  <div className="text-center px-2">
                    <p className="text-sm font-semibold">{node.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{node.type}</p>
                  </div>
                  {node.locked && (
                    <button
                      onClick={() => toggleNodeLock(node.id)}
                      className="absolute bottom-1 right-1 p-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                      title="Click to unlock"
                    >
                      <Lock className="w-3 h-3" />
                    </button>
                  )}
                  {!node.locked && (
                    <button
                      onClick={() => toggleNodeLock(node.id)}
                      className="absolute bottom-1 right-1 p-1 bg-gray-600 hover:bg-gray-500 rounded text-xs"
                      title="Click to lock"
                    >
                      <Unlock className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Runs View */}
      {view === 'runs' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Pipeline Runs</h1>
          <div className="space-y-3">
            {runs.map(run => (
              <div
                key={run.id}
                className={`border rounded-lg p-4 ${getStatusColor(run.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(run.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{run.pipelineName}</h3>
                        {run.status === 'pending_approval' && (
                          <span className="text-xs">
                            ({run.approvals}/{run.required} approvals)
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm text-gray-400 mt-1">
                        <span>Branch: {run.branch}</span>
                        <span>Commit: {run.commit}</span>
                        <span>Duration: {run.duration}</span>
                        <span>{run.timestamp}</span>
                      </div>
                      {run.error && (
                        <p className="text-sm text-red-400 mt-2">Error: {run.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Pipeline Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Create New Pipeline</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pipeline Name</label>
                <input
                  type="text"
                  value={newPipelineName}
                  onChange={(e) => setNewPipelineName(e.target.value)}
                  placeholder="e.g., ML Training Pipeline"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newPipelineDesc}
                  onChange={(e) => setNewPipelineDesc(e.target.value)}
                  placeholder="Describe the pipeline's purpose..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePipeline}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Actions YAML Modal */}
      {showYamlModal && selectedPipeline && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl border border-gray-700 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">GitHub Actions YAML</h2>
              <button
                onClick={() => setShowYamlModal(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <pre className="bg-gray-900 border border-gray-700 rounded p-4 text-sm text-gray-300 overflow-x-auto">
              {selectedPipeline.githubYaml || 'No YAML generated yet. Submit pipeline to generate.'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pipeline;
