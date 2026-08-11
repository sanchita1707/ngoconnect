import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Clipboard, ShieldCheck, Check, X, AlertTriangle } from 'lucide-react';

const AdminNGOs = () => {
  const { showToast } = useNotification();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingNGOs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/ngos/pending');
      if (res.data.success) {
        setNgos(res.data.ngos);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve pending NGO registrations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingNGOs();
  }, []);

  const handleVerify = async (ngoId, status) => {
    try {
      const res = await API.put(`/admin/ngos/${ngoId}/verify`, { status });
      if (res.data.success) {
        showToast('NGO Audited', `Organization status set to ${status}.`, 'success');
        setNgos(prev => prev.filter(n => n._id !== ngoId));
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to process NGO verification.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">NGO Audits Queue</h1>
        <p className="text-sm text-slate-500 mt-1">Audit credentials, registration numbers, and verify organizations.</p>
      </div>

      {/* List */}
      {loading ? (
        <div className="h-32 shimmer rounded-2xl"></div>
      ) : ngos.length === 0 ? (
        <div className="bg-white dark:bg-charcoal p-10 rounded-2xl border border-slate-150 text-center text-slate-400 text-xs italic">
          Verification queue empty. All NGO credentials verified.
        </div>
      ) : (
        <div className="space-y-4">
          {ngos.map(ngo => (
            <div key={ngo._id} className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {ngo.organizationName}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Reg No: <strong>{ngo.registrationNumber}</strong> | Founded: {ngo.foundedYear}</p>
                </div>
                <span className="text-[9px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                  Pending Audit
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-charcoal-dark/50 p-4 rounded-xl text-xs space-y-2 leading-relaxed text-slate-600 dark:text-slate-400">
                <p><strong>Causes:</strong> {ngo.causes?.join(', ')}</p>
                <p><strong>Description:</strong> {ngo.description}</p>
                <p><strong>Address Venue:</strong> {ngo.address}, {ngo.city}, {ngo.state}</p>
                {ngo.website && <p><strong>Web link:</strong> <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{ngo.website}</a></p>}
              </div>

              {/* CTAs */}
              <div className="flex gap-2 justify-end border-t border-slate-50 dark:border-slate-850 pt-3">
                <button
                  onClick={() => handleVerify(ngo._id, 'Rejected')}
                  className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-rose-600 flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
                <button
                  onClick={() => handleVerify(ngo._id, 'Verified')}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Verify NGO
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminNGOs;
