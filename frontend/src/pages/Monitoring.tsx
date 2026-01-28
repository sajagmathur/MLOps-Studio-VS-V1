import React, { useEffect, useState } from 'react';
import { AlertTriangle, TrendingDown, Activity, CheckCircle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Monitoring: React.FC = () => {
  const [driftMetrics, setDriftMetrics] = useState<any>(null);

  useEffect(() => {
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
    });
  }, []);

  if (!driftMetrics) return <div>Loading monitoring data...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Model Monitoring & Drift Detection</h1>

      {/* Drift Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-lg p-6 border ${driftMetrics.dataDrift.detected ? 'bg-red-600/10 border-red-500' : 'bg-green-600/10 border-green-500'}`}>
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold">Data Drift</h3>
            {driftMetrics.dataDrift.detected ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
          <p className="text-2xl font-bold mb-1">{driftMetrics.dataDrift.score.toFixed(1)}%</p>
          <p className="text-sm text-gray-400 mb-3">Threshold: {driftMetrics.dataDrift.threshold}%</p>
          {driftMetrics.dataDrift.detected && (
            <div>
              <p className="text-xs font-medium mb-2">Affected Features:</p>
              <div className="space-y-1">
                {driftMetrics.dataDrift.features.map((f: string) => (
                  <p key={f} className="text-xs text-gray-400">• {f}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`rounded-lg p-6 border ${driftMetrics.conceptDrift.detected ? 'bg-red-600/10 border-red-500' : 'bg-green-600/10 border-green-500'}`}>
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold">Concept Drift</h3>
            {driftMetrics.conceptDrift.detected ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
          <p className="text-2xl font-bold mb-1">{driftMetrics.conceptDrift.score.toFixed(1)}%</p>
          <p className="text-sm text-gray-400">Threshold: {driftMetrics.conceptDrift.threshold}%</p>
          <p className="text-xs text-gray-500 mt-3">Model still performing as expected</p>
        </div>

        <div className={`rounded-lg p-6 border ${driftMetrics.predictionDrift.detected ? 'bg-red-600/10 border-red-500' : 'bg-green-600/10 border-green-500'}`}>
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold">Prediction Drift</h3>
            {driftMetrics.predictionDrift.detected ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
          <p className="text-2xl font-bold mb-1">{driftMetrics.predictionDrift.score.toFixed(1)}%</p>
          <p className="text-sm text-gray-400">Threshold: {driftMetrics.predictionDrift.threshold}%</p>
          <p className="text-xs text-gray-500 mt-3">Output distribution has shifted</p>
        </div>
      </div>

      {/* Drift Timeline */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Drift Metrics Timeline (24h)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={driftMetrics.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="time" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              formatter={(value: any) => value.toFixed(2) + '%'}
            />
            <Line type="monotone" dataKey="dataDrift" stroke="#ef4444" name="Data Drift" strokeWidth={2} />
            <Line type="monotone" dataKey="conceptDrift" stroke="#f59e0b" name="Concept Drift" strokeWidth={2} />
            <Line type="monotone" dataKey="predictionDrift" stroke="#3b82f6" name="Prediction Drift" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Model Health Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-sm">Inference Latency</p>
                <p className="text-sm text-green-500">42ms ✓</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-sm">Model Accuracy</p>
                <p className="text-sm text-green-500">93.7% ✓</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '93.7%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-sm">API Uptime</p>
                <p className="text-sm text-green-500">99.8% ✓</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.8%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-600/10 border-l-2 border-red-500 rounded">
              <p className="text-sm font-medium">📊 Data drift detected</p>
              <p className="text-xs text-gray-400 mt-1">Retrain model with recent data</p>
            </div>
            <div className="p-3 bg-yellow-600/10 border-l-2 border-yellow-500 rounded">
              <p className="text-sm font-medium">⚠️ High latency observed</p>
              <p className="text-xs text-gray-400 mt-1">Scale inference endpoints</p>
            </div>
            <div className="p-3 bg-blue-600/10 border-l-2 border-blue-500 rounded">
              <p className="text-sm font-medium">✨ New model available</p>
              <p className="text-xs text-gray-400 mt-1">Version 2.2.0 ready for promotion</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
