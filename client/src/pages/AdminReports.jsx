import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Flag, ShieldCheck, Check, X, AlertTriangle } from 'lucide-react';

const AdminReports = () => {
  const { showToast } = useNotification();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/reports');
      if (res.data.success) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve moderation reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (repId) => {
    try {
      const res = await API.put(`/admin/reports/${repId}/resolve`);
      if (res.data.success) {
        showToast('Resolved', 'Moderation ticket marked as resolved.', 'success');
        setReports(prev => 
          prev.map(r => r._id === repId ? { ...r, status: 'Resolved' } : r)
        );
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to resolve report.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Reports & Moderation</h1>
        <p className="text-sm text-slate-500 mt-1">Review flagged accounts, inappropriate comments, or misleading details.</p>
      </div>

      {/* List */}
      {loading ? (
        <div className="h-32 shimmer rounded-2xl"></div>
      ) : reports.length === 0 ? (
        <div className="bg-white dark:bg-charcoal p-10 rounded-2xl border border-slate-150 text-center text-slate-400 text-xs italic">
          No moderation reports logged. Platform safe!
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(rep => (
            <div key={rep._id} className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex justify-between items-center gap-4">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                  rep.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {rep.status}
                </span>
                <span className="text-[10px] text-slate-400">
                  Flagged by: {rep.reporterId?.name || 'User'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-charcoal-dark/50 p-4 rounded-xl text-xs space-y-1 text-slate-700 dark:text-slate-350">
                <p><strong>Reason:</strong> <span className="text-rose-600 font-bold">{rep.reason}</span></p>
                <p><strong>Explanation:</strong> {rep.description}</p>
                {rep.reportedUser && <p><strong>Reported User:</strong> {rep.reportedUser.name} ({rep.reportedUser.role})</p>}
                {rep.opportunityId && <p><strong>Linked Campaign:</strong> {rep.opportunityId.title}</p>}
              </div>

              {rep.status !== 'Resolved' && (
                <button
                  onClick={() => handleResolve(rep._id)}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center gap-1.5 ml-auto shadow-sm"
                >
                  <Check className="w-4 h-4" /> Mark Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminReports;
