import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Play, Upload, AlertCircle, Loader, Eye, DownloadCloud, FileJson } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { APIClient } from '../services/APIClient';
import { useNotification } from '../hooks/useNotification';

interface InferencingJob {
  id: string;
  name: string;
  modelVersion: string;
  status: 'active' | 'inactive';
  totalInferences: number;
  successRate: number;
  avgLatency: number;
  createdAt?: string;
}

const mockInferenceData = [
  { time: '00:00', inferences: 120, avgLatency: 45 },
  { time: '04:00', inferences: 150, avgLatency: 52 },
  { time: '08:00', inferences: 280, avgLatency: 48 },
  { time: '12:00', inferences: 450, avgLatency: 51 },
  { time: '16:00', inferences: 380, avgLatency: 49 },
  { time: '20:00', inferences: 220, avgLatency: 47 },
];

export default function Inferencing() {
  const { theme } = useTheme();
  const [jobs, setJobs] = useState<InferencingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<InferencingJob | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    modelVersion: '',
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await APIClient.apiGet('/inferencing');
      setJobs(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.warn('Failed to load inferencing jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.modelVersion.trim()) {
      showNotification('Name and model version are required', 'warning');
      return;
    }

    try {
      await APIClient.apiPost('/inferencing', formData);
      showNotification('Inferencing job created successfully', 'success');
      setShowModal(false);
      setFormData({ name: '', modelVersion: '' });
      await loadJobs();
    } catch (err) {
      const newJob: InferencingJob = {
        id: Date.now().toString(),
        ...formData,
        status: 'active',
        totalInferences: 0,
        successRate: 99.8,
        avgLatency: 50,
        createdAt: new Date().toISOString(),
      };
      setJobs([...jobs, newJob]);
      setShowModal(false);
      showNotification('Inferencing job created locally', 'success');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await APIClient.apiDelete(`/inferencing/${id}`);
      showNotification('Inferencing job deleted', 'success');
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err) {
      setJobs(jobs.filter(j => j.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Model Inferencing</h1>
          <p className="text-white/60 text-sm mt-1">Monitor inference activity and scoring results</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', modelVersion: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white font-medium"
        >
          <Plus size={16} />
          New Job
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Active Jobs</p>
          <p className="text-2xl font-bold text-white">{jobs.filter(j => j.status === 'active').length}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Total Inferences</p>
          <p className="text-2xl font-bold text-white">{jobs.reduce((sum, j) => sum + j.totalInferences, 0).toLocaleString()}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Avg Success Rate</p>
          <p className="text-2xl font-bold text-green-400">
            {jobs.length > 0 ? (jobs.reduce((sum, j) => sum + j.successRate, 0) / jobs.length).toFixed(1) : 0}%
          </p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Avg Latency</p>
          <p className="text-2xl font-bold text-white">
            {jobs.length > 0 ? (jobs.reduce((sum, j) => sum + j.avgLatency, 0) / jobs.length).toFixed(0) : 0}ms
          </p>
        </div>
      </div>

      {/* Inference Activity Chart */}
      {jobs.length > 0 && (
        <div className="bg-white/5 rounded-lg border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Inference Activity (24h)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockInferenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="inferences" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Jobs List */}
      <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-2 text-white/60">
            <Loader size={20} className="animate-spin" />
            Loading jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center">
            <Eye size={32} className="mx-auto mb-3 text-white/30" />
            <p className="text-white/60">No inferencing jobs yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white text-sm font-medium"
            >
              Create your first job
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Model Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Total Inferences</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Success Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Avg Latency</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white/70">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{job.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/70 text-sm">{job.modelVersion}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/70 text-sm">{job.totalInferences.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/70 text-sm">{job.successRate.toFixed(1)}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/70 text-sm">{job.avgLatency}ms</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded text-blue-300 text-xs font-medium transition"
                        title="View details"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-300 text-xs font-medium transition"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-lg border border-white/10 p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Create Inferencing Job</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Job Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  placeholder="e.g., Sales Prediction API"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Model Version</label>
                <input
                  type="text"
                  value={formData.modelVersion}
                  onChange={(e) => setFormData({ ...formData, modelVersion: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  placeholder="e.g., 2.1.0"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition font-medium"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-lg border border-white/10 p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{selectedJob.name}</h2>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 hover:bg-white/10 rounded transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-white/70 text-xs font-medium mb-1">Model Version</p>
                <p className="text-white">{selectedJob.modelVersion}</p>
              </div>
              <div>
                <p className="text-white/70 text-xs font-medium mb-1">Status</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${selectedJob.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                  {selectedJob.status}
                </span>
              </div>
              <div>
                <p className="text-white/70 text-xs font-medium mb-1">Total Inferences</p>
                <p className="text-white">{selectedJob.totalInferences.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-white/70 text-xs font-medium mb-1">Avg Latency</p>
                <p className="text-white">{selectedJob.avgLatency}ms</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedJob(null)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition font-medium"
              >
                Close
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition font-medium flex items-center justify-center gap-2">
                <DownloadCloud size={16} />
                Download Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
