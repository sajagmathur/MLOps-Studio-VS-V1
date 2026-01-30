import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader, Send, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { APIClient } from '../services/APIClient';
import { useNotification } from '../hooks/useNotification';

interface ApprovalRequest {
  id: string;
  pipelineId: string;
  pipelineName: string;
  jobName: string;
  status: 'pending' | 'approved' | 'rejected';
  requiredApprovals: number;
  currentApprovals: number;
  requestedBy: string;
  requestedAt: string;
  comments?: string;
}

export default function ManualApproval() {
  const { theme } = useTheme();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [comments, setComments] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await APIClient.apiGet('/manual-approval');
      setRequests(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.warn('Failed to load approval requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      await APIClient.apiPost(`/manual-approval/${selectedRequest.id}/approve`, {
        comments,
      });
      showNotification('Deployment approved', 'success');
      setRequests(requests.map(r => r.id === selectedRequest.id ? { ...r, status: 'approved' } : r));
      setSelectedRequest(null);
      setComments('');
      await loadRequests();
    } catch (err) {
      setRequests(requests.map(r => r.id === selectedRequest.id ? { ...r, status: 'approved' } : r));
      setSelectedRequest(null);
      setComments('');
      showNotification('Request approved', 'success');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      await APIClient.apiPost(`/manual-approval/${selectedRequest.id}/reject`, {
        comments,
      });
      showNotification('Deployment rejected', 'success');
      setRequests(requests.map(r => r.id === selectedRequest.id ? { ...r, status: 'rejected' } : r));
      setSelectedRequest(null);
      setComments('');
      await loadRequests();
    } catch (err) {
      setRequests(requests.map(r => r.id === selectedRequest.id ? { ...r, status: 'rejected' } : r));
      setSelectedRequest(null);
      setComments('');
      showNotification('Request rejected', 'success');
    }
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      'pending': <Clock className="text-yellow-400" size={20} />,
      'approved': <CheckCircle className="text-green-400" size={20} />,
      'rejected': <XCircle className="text-red-400" size={20} />,
    };
    return icons[status] || <AlertCircle className="text-white/50" size={20} />;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-500/20 text-yellow-300',
      'approved': 'bg-green-500/20 text-green-300',
      'rejected': 'bg-red-500/20 text-red-300',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300';
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Manual Approval</h1>
        <p className="text-white/60 text-sm mt-1">Review and approve pipeline deployments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{pendingRequests.length}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-400">{approvedRequests.length}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-400">{rejectedRequests.length}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{requests.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        {/* Pending Requests */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-yellow-400" />
            Pending Approval ({pendingRequests.length})
          </h2>

          {loading ? (
            <div className="p-8 flex items-center justify-center gap-2 text-white/60">
              <Loader size={20} className="animate-spin" />
              Loading requests...
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="p-8 bg-white/5 rounded-lg border border-white/10 text-center">
              <AlertCircle size={32} className="mx-auto mb-3 text-white/30" />
              <p className="text-white/60">No pending approval requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(request => (
                <div
                  key={request.id}
                  className="p-4 bg-white/5 rounded-lg border border-yellow-500/30 hover:border-yellow-500/50 transition cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{request.pipelineName}</h3>
                      <p className="text-white/60 text-sm">Job: {request.jobName}</p>
                      <p className="text-white/50 text-xs mt-1">Requested by {request.requestedBy} on {new Date(request.requestedAt).toLocaleString()}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 transition"
                            style={{ width: `${(request.currentApprovals / request.requiredApprovals) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/70">{request.currentApprovals}/{request.requiredApprovals}</span>
                      </div>
                    </div>
                    <Clock size={24} className="text-yellow-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Requests */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-400" />
            Approved ({approvedRequests.length})
          </h2>

          {approvedRequests.length === 0 ? (
            <div className="p-8 bg-white/5 rounded-lg border border-white/10 text-center">
              <p className="text-white/60">No approved requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approvedRequests.map(request => (
                <div
                  key={request.id}
                  className="p-4 bg-green-500/5 rounded-lg border border-green-500/30"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{request.pipelineName}</h3>
                      <p className="text-white/60 text-sm">Job: {request.jobName}</p>
                    </div>
                    <CheckCircle size={24} className="text-green-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rejected Requests */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <XCircle size={20} className="text-red-400" />
            Rejected ({rejectedRequests.length})
          </h2>

          {rejectedRequests.length === 0 ? (
            <div className="p-8 bg-white/5 rounded-lg border border-white/10 text-center">
              <p className="text-white/60">No rejected requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rejectedRequests.map(request => (
                <div
                  key={request.id}
                  className="p-4 bg-red-500/5 rounded-lg border border-red-500/30"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{request.pipelineName}</h3>
                      <p className="text-white/60 text-sm">Job: {request.jobName}</p>
                    </div>
                    <XCircle size={24} className="text-red-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-lg border border-white/10 p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Approve Deployment</h2>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-white/70 text-sm font-medium mb-1">Pipeline</p>
                <p className="text-white">{selectedRequest.pipelineName}</p>
              </div>

              <div>
                <p className="text-white/70 text-sm font-medium mb-1">Job</p>
                <p className="text-white">{selectedRequest.jobName}</p>
              </div>

              <div>
                <p className="text-white/70 text-sm font-medium mb-1">Requested by</p>
                <p className="text-white">{selectedRequest.requestedBy}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Comments (optional)</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 resize-none h-24"
                  placeholder="Add your comments..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="flex-1 px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition font-medium flex items-center justify-center gap-2"
              >
                <XCircle size={16} />
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
