import React, { useEffect, useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    // Mock data
    setMetrics({
      activeModels: 12,
      successfulDeployments: 156,
      failedDeployments: 3,
      avgInferenceTime: 45.2,
      dataPoints: [
        { time: '00:00', latency: 42, accuracy: 92.5, throughput: 1200 },
        { time: '04:00', latency: 45, accuracy: 91.8, throughput: 1150 },
        { time: '08:00', latency: 38, accuracy: 93.1, throughput: 1350 },
        { time: '12:00', latency: 52, accuracy: 90.5, throughput: 980 },
        { time: '16:00', latency: 48, accuracy: 92.3, throughput: 1420 },
        { time: '20:00', latency: 41, accuracy: 93.7, throughput: 1280 },
      ],
    });
  }, []);

  if (!metrics) return <div className="text-center py-8">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI Cards */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Models</p>
              <p className="text-2xl font-bold mt-2">{metrics.activeModels}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Successful Deployments</p>
              <p className="text-2xl font-bold mt-2">{metrics.successfulDeployments}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Failed Deployments</p>
              <p className="text-2xl font-bold mt-2">{metrics.failedDeployments}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Inference Time</p>
              <p className="text-2xl font-bold mt-2">{metrics.avgInferenceTime}ms</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Inference Latency (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="time" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Legend />
              <Line type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} name="Latency (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Accuracy Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Model Accuracy (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={metrics.dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="time" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Area type="monotone" dataKey="accuracy" fill="#10b981" stroke="#059669" name="Accuracy (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Throughput */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Request Throughput (24h)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metrics.dataPoints}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="time" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
            <Bar dataKey="throughput" fill="#f59e0b" name="Requests/sec" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Alerts */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-700/50 rounded border-l-4 border-yellow-500">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Data Drift Detected</p>
              <p className="text-sm text-gray-400">Feature 'user_age' distribution changed by 8.3% in production</p>
              <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-700/50 rounded border-l-4 border-green-500">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Model v2.1.0 Promoted to Production</p>
              <p className="text-sm text-gray-400">Accuracy: 94.2%, Latency: 42ms, Approved by 2 reviewers</p>
              <p className="text-xs text-gray-500 mt-1">15 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
