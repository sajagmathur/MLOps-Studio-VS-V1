import React, { useState, useEffect } from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import { themeClasses } from '../utils/themeClasses';

interface PendingApproval {
  id: string;
  pipelineId: string;
  pipelineName: string;
  jobId: string;
  jobName: string;
  approvalStepIndex: number;
  pipelineJobs: any[];
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approverNotes?: string;
}

interface ApprovalHistory {
  id: string;
  pipelineId: string;
  pipelineName: string;
  jobName: string;
  status: 'approved' | 'rejected';
  requestedAt: string;
  decidedAt: string;
}

const ManualApprovals: React.FC = () => {
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);

  // Load approvals from localStorage
  useEffect(() => {
    const loadApprovals = () => {
      try {
        const pending = localStorage.getItem('pending-pipeline-approvals');
        if (pending) {
          setPendingApprovals(JSON.parse(pending));
        }

        const history = localStorage.getItem('approval-history');
        if (history) {
          setApprovalHistory(JSON.parse(history));
        }
      } catch (err) {
        console.error('[ManualApprovals] Failed to load approvals:', err);
      }
    };

    loadApprovals();

    // Poll for changes
    const interval = setInterval(loadApprovals, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = (approval: PendingApproval) => {
    console.log('[ManualApprovals] Approving:', approval.id);
    
    // Remove from pending approvals
    const updatedPending = pendingApprovals.filter(a => a.id !== approval.id);
    setPendingApprovals(updatedPending);
    localStorage.setItem('pending-pipeline-approvals', JSON.stringify(updatedPending));
    
    // Add to approval history
    const historyEntry: ApprovalHistory = {
      id: approval.id,
      pipelineId: approval.pipelineId,
      pipelineName: approval.pipelineName,
      jobName: approval.jobName,
      status: 'approved',
      requestedAt: approval.requestedAt,
      decidedAt: new Date().toISOString(),
    };
    
    const updatedHistory = [...approvalHistory, historyEntry];
    setApprovalHistory(updatedHistory);
    localStorage.setItem('approval-history', JSON.stringify(updatedHistory));
    
    console.log('[ManualApprovals] Moved approval to history:', approval.id);
    showNotification('✓ Approval granted! Pipeline will resume...', 'success');
  };

  const handleReject = (approval: PendingApproval) => {
    console.log('[ManualApprovals] Rejecting:', approval.id);
    
    // Remove from pending approvals
    const updatedPending = pendingApprovals.filter(a => a.id !== approval.id);
    setPendingApprovals(updatedPending);
    localStorage.setItem('pending-pipeline-approvals', JSON.stringify(updatedPending));
    
    // Add to approval history
    const historyEntry: ApprovalHistory = {
      id: approval.id,
      pipelineId: approval.pipelineId,
      pipelineName: approval.pipelineName,
      jobName: approval.jobName,
      status: 'rejected',
      requestedAt: approval.requestedAt,
      decidedAt: new Date().toISOString(),
    };
    
    const updatedHistory = [...approvalHistory, historyEntry];
    setApprovalHistory(updatedHistory);
    localStorage.setItem('approval-history', JSON.stringify(updatedHistory));
    
    console.log('[ManualApprovals] Moved approval to history:', approval.id);
    showNotification('✗ Approval rejected. Pipeline will be marked as failed.', 'error');
  };

  const handleClearPendingApprovals = () => {
    if (window.confirm('Are you sure you want to clear all pending approvals? This cannot be undone.')) {
      setPendingApprovals([]);
      localStorage.setItem('pending-pipeline-approvals', JSON.stringify([]));
      showNotification('All pending approvals cleared', 'info');
    }
  };

  const handleDeleteHistory = (recordId: string) => {
    if (window.confirm('Delete this approval record?')) {
      const updated = approvalHistory.filter(r => r.id !== recordId);
      setApprovalHistory(updated);
      localStorage.setItem('approval-history', JSON.stringify(updated));
      showNotification('Approval record deleted', 'success');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-4xl font-bold ${themeClasses.textPrimary(theme)} mb-2`}>Manual Approvals</h1>
        <p className={themeClasses.textSecondary(theme)}>Manage pipeline approval requests and history</p>
      </div>

      {/* Pending Approvals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)}`}>⏸ Awaiting Approval ({pendingApprovals.length})</h2>
          {pendingApprovals.length > 0 && (
            <button
              onClick={handleClearPendingApprovals}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition text-sm font-semibold"
            >
              Clear All
            </button>
          )}
        </div>
        
        {pendingApprovals.length === 0 ? (
          <div className={`p-8 rounded-lg text-center ${themeClasses.card(theme)}`}>
            <p className={themeClasses.textSecondary(theme)}>No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map(approval => (
              <div
                key={approval.id}
                className={`p-4 rounded-lg border-2 ${
                  theme === 'dark'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-yellow-50 border-yellow-300'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-yellow-400" />
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold ${themeClasses.textPrimary(theme)}`}>
                        {approval.pipelineName}
                      </p>
                      <p className={`text-sm ${themeClasses.textSecondary(theme)}`}>
                        Step: <strong>{approval.jobName}</strong>
                      </p>
                      <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>
                        Requested: {new Date(approval.requestedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(approval)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReject(approval)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval History */}
      <div className="space-y-4">
        <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)}`}>📋 Approval History ({approvalHistory.length})</h2>
        
        {approvalHistory.length === 0 ? (
          <div className={`p-8 rounded-lg text-center ${themeClasses.card(theme)}`}>
            <p className={themeClasses.textSecondary(theme)}>No approval history</p>
          </div>
        ) : (
          <div className="space-y-2">
            {approvalHistory.map(record => (
              <div
                key={record.id}
                className={`p-4 rounded-lg border flex items-center justify-between ${
                  record.status === 'approved'
                    ? theme === 'dark'
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-green-50 border-green-300'
                    : theme === 'dark'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-bold px-2 py-1 rounded ${
                      record.status === 'approved' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                    }`}>
                      {record.status === 'approved' ? '✓ APPROVED (1)' : '✗ REJECTED (0)'}
                    </span>
                  </div>
                  <p className={`font-medium ${themeClasses.textPrimary(theme)}`}>
                    {record.pipelineName}
                  </p>
                  <p className={`text-sm ${themeClasses.textSecondary(theme)}`}>
                    Step: <strong>{record.jobName}</strong>
                  </p>
                  <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>
                    Decided: {new Date(record.decidedAt).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteHistory(record.id)}
                  className="ml-4 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition flex-shrink-0 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualApprovals;
