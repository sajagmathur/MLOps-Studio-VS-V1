import React, { useEffect, useState } from 'react';
import { AlertTriangle, TrendingDown, Activity, CheckCircle, Plus, Trash2, Loader } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface MonitoringJob {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  ksStatistic: number;
  psiScore: number;
  dataPoints: number;
}

const Monitoring: React.FC = () => {
  const { theme } = useTheme();
  const [driftMetrics, setDriftMetrics] = useState<any>(null);
  const [monitoringJobs, setMonitoringJobs] = useState<MonitoringJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobName, setJobName] = useState('');

  useEffect(() => {
    // Initialize monitoring jobs and drift metrics
    setMonitoringJobs([
      {
        id: '1',
        name: 'Production Model',
        status: 'warning',
        ksStatistic: 0.34,
        psiScore: 0.156,
        dataPoints: 50000,
      },
      {
        id: '2',
        name: 'Staging Model',
        status: 'pass',
        ksStatistic: 0.12,
        psiScore: 0.045,
        dataPoints: 25000,
      },
    ]);

    setDriftMetrics({
      dataDrift: {
        detected: true,
        score: 15.3,
        features: ['age', 'income', 'credit_score'],
        threshold: 10,
      },
      conceptDrift: {
        detected: false,
        score: 4.2,
        threshold: 8,
      },
      predictionDrift: {
        detected: true,
        score: 12.1,
        threshold: 10,
      },
      timeline: [
        { time: '00:00', dataDrift: 2.3, conceptDrift: 1.2, predictionDrift: 0.8 },
        { time: '04:00', dataDrift: 3.1, conceptDrift: 1.5, predictionDrift: 1.2 },
        { time: '08:00', dataDrift: 5.2, conceptDrift: 2.3, predictionDrift: 2.1 },
        { time: '12:00', dataDrift: 8.1, conceptDrift: 3.5, predictionDrift: 4.3 },
        { time: '16:00', dataDrift: 12.4, conceptDrift: 4.2, predictionDrift: 8.5 },
        { time: '20:00', dataDrift: 15.3, conceptDrift: 4.2, predictionDrift: 12.1 },
      ],
      ksData: [
        { threshold: 0.1, models: 2 },
        { threshold: 0.2, models: 1 },
        { threshold: 0.3, models: 1 },
        { threshold: 0.4, models: 0 },
      ],
      psiData: [
        { threshold: 0.05, models: 2 },
        { threshold: 0.1, models: 1 },
        { threshold: 0.2, models: 1 },
        { threshold: 0.3, models: 0 },
      ],
    });
    setLoading(false);
  }, []);

  const handleAddJob = () => {
    if (!jobName.trim()) return;
    const newJob: MonitoringJob = {
      id: Date.now().toString(),
      name: jobName,
      status: 'pass',
      ksStatistic: Math.random() * 0.5,
      psiScore: Math.random() * 0.2,
      dataPoints: Math.floor(Math.random() * 100000) + 10000,
    };
    setMonitoringJobs([...monitoringJobs, newJob]);
    setJobName('');
    setShowJobModal(false);
  };

  const handleDeleteJob = (id: string) => {
    setMonitoringJobs(monitoringJobs.filter(j => j.id !== id));
  };

  const getStatusColor = (status: string) => {
    return status === 'fail' ? 'bg-red-600/10 border-red-500 text-red-400' :
           status === 'warning' ? 'bg-yellow-600/10 border-yellow-500 text-yellow-400' :
           'bg-green-600/10 border-green-500 text-green-400';
  };

  const getStatusIcon = (status: string) => {
    return status === 'fail' ? <AlertTriangle size={16} /> :
           status === 'warning' ? <AlertTriangle size={16} /> :
           <CheckCircle size={16} />;
  };

  if (!driftMetrics || loading) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Model Monitoring</h1>
          <p className="text-white/60 text-sm mt-1">Monitor model drift, performance, and job health</p>
        </div>
        <button
          onClick={() => setShowJobModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white font-medium"
        >
          <Plus size={16} />
          New Job
        </button>
      </div>

      {/* Monitoring Jobs Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Monitoring Jobs</p>
          <p className="text-2xl font-bold text-white">{monitoringJobs.length}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Pass</p>
          <p className="text-2xl font-bold text-green-400">{monitoringJobs.filter(j => j.status === 'pass').length}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Warning</p>
          <p className="text-2xl font-bold text-yellow-400">{monitoringJobs.filter(j => j.status === 'warning').length}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Fail</p>
          <p className="text-2xl font-bold text-red-400">{monitoringJobs.filter(j => j.status === 'fail').length}</p>
        </div>
      </div>

      {/* Monitoring Jobs Dashboard */}
      <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Monitoring Jobs</h2>
        </div>
        {monitoringJobs.length === 0 ? (
          <div className="p-8 text-center text-white/60">
            <p>No monitoring jobs. Create one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Job Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">KS Statistic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">PSI Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Data Points</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white/70">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {monitoringJobs.map(job => (
                  <tr key={job.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{job.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                        {job.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/70 text-sm">{job.ksStatistic.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/70 text-sm">{job.psiScore.toFixed(3)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/70 text-sm">{job.dataPoints.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-300 text-xs font-medium transition"
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

      {/* KS and PSI Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Kolmogorov-Smirnov (KS) Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={driftMetrics.ksData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="threshold" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="models" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/5 rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Population Stability Index (PSI)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={driftMetrics.psiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="threshold" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="models" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drift Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-lg p-6 border ${driftMetrics.dataDrift.detected ? 'bg-red-600/10 border-red-500' : 'bg-green-600/10 border-green-500'}`}>
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-white">Data Drift</h3>
            {driftMetrics.dataDrift.detected ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
          <p className="text-2xl font-bold mb-1 text-white">{driftMetrics.dataDrift.score.toFixed(1)}%</p>
          <p className="text-sm text-white/60 mb-3">Threshold: {driftMetrics.dataDrift.threshold}%</p>
          {driftMetrics.dataDrift.detected && (
            <div>
              <p className="text-xs font-medium mb-2 text-white/70">Affected Features:</p>
              <div className="space-y-1">
                {driftMetrics.dataDrift.features.map((f: string) => (
                  <p key={f} className="text-xs text-white/50">• {f}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`rounded-lg p-6 border ${driftMetrics.conceptDrift.detected ? 'bg-red-600/10 border-red-500' : 'bg-green-600/10 border-green-500'}`}>
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-white">Concept Drift</h3>
            {driftMetrics.conceptDrift.detected ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
          <p className="text-2xl font-bold mb-1 text-white">{driftMetrics.conceptDrift.score.toFixed(1)}%</p>
          <p className="text-sm text-white/60">Threshold: {driftMetrics.conceptDrift.threshold}%</p>
          <p className="text-xs text-white/50 mt-3">Model still performing as expected</p>
        </div>

        <div className={`rounded-lg p-6 border ${driftMetrics.predictionDrift.detected ? 'bg-red-600/10 border-red-500' : 'bg-green-600/10 border-green-500'}`}>
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-white">Prediction Drift</h3>
            {driftMetrics.predictionDrift.detected ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
          <p className="text-2xl font-bold mb-1 text-white">{driftMetrics.predictionDrift.score.toFixed(1)}%</p>
          <p className="text-sm text-white/60">Threshold: {driftMetrics.predictionDrift.threshold}%</p>
          <p className="text-xs text-white/50 mt-3">Output distribution has shifted</p>
        </div>
      </div>

      {/* Drift Timeline */}
      <div className="bg-white/5 rounded-lg border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Drift Metrics Timeline (24h)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={driftMetrics.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: any) => value.toFixed(2) + '%'}
            />
            <Line type="monotone" dataKey="dataDrift" stroke="#ef4444" name="Data Drift" strokeWidth={2} />
            <Line type="monotone" dataKey="conceptDrift" stroke="#f59e0b" name="Concept Drift" strokeWidth={2} />
            <Line type="monotone" dataKey="predictionDrift" stroke="#3b82f6" name="Prediction Drift" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Add Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-lg border border-white/10 p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Create Monitoring Job</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Job Name</label>
                <input
                  type="text"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  placeholder="e.g., Production Drift Monitor"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowJobModal(false)}
                  className="flex-1 px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddJob}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition font-medium"
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
};

export default Monitoring;
