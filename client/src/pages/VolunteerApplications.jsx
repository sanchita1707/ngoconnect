import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import PageHeader from '../components/PageHeader';
import { FileText, Calendar, Clock, Landmark, Check, AlertCircle, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

const VolunteerApplications = () => {
  const { showToast } = useNotification();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/applications/my');
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve application logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusBadgeStyles = (status) => {
    if (status === 'Pending') return 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/20';
    if (status === 'Accepted') return 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20';
    if (status === 'Rejected') return 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/20';
    if (status === 'Completed') return 'text-blue-500 bg-blue-500/10 dark:bg-blue-500/20';
    return 'text-slate-455 bg-slate-100 dark:bg-slate-800';
  };

  const getFilteredApps = () => {
    if (activeTab === 'All') return applications;
    return applications.filter(app => app.status === activeTab);
  };

  const filtered = getFilteredApps();

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-12">
      
      {/* Consistent Page Header */}
      <PageHeader
        label="Tracking"
        heading="My Applications"
        description="Monitor the verification and attendance state of your volunteering registrations."
      />

      {/* Tabs Menu Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-1.5 scrollbar-none border-b border-slate-150 dark:border-slate-800/80">
        {['All', 'Pending', 'Accepted', 'Rejected', 'Completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-3 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'border-primary text-primary font-black'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List Container */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-white dark:bg-charcoal border border-slate-100 dark:border-slate-850 animate-pulse shimmer"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-charcoal p-10 rounded-3xl border border-slate-150 dark:border-slate-800/80 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
          No applications found under this status.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div key={app._id} className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
              
              {/* Left Column: Details */}
              <div className="space-y-3.5 flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${getStatusBadgeStyles(app.status)}`}>
                    {app.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight truncate">
                  {app.opportunityId?.title}
                </h3>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-bold">
                  <Landmark className="w-3.5 h-3.5 text-slate-400" />
                  <span>by {app.opportunityId?.ngoId?.name || 'NGO Partner'}</span>
                </p>

                {app.message && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 italic p-3 bg-slate-50 dark:bg-charcoal-dark/50 rounded-xl border border-slate-100/50 dark:border-slate-800/30">
                    "{app.message}"
                  </div>
                )}
              </div>

              {/* Right Column: Timeline tracker component */}
              <div className="md:w-60 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/80 pt-4 md:pt-0 md:pl-6 gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Timeline Status
                </span>
                
                <div className="flex flex-col gap-2.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {/* Applied Node */}
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">✓</div>
                    <span className="text-slate-900 dark:text-slate-200">Applied</span>
                  </div>

                  {/* NGO Review Node */}
                  {app.status !== 'Pending' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">✓</div>
                      <span className="text-slate-900 dark:text-slate-200">NGO Reviewed</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-[8px] font-bold">●</div>
                      <span>Under Review</span>
                    </div>
                  )}

                  {/* Outcome Nodes */}
                  {app.status === 'Accepted' && (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450 font-bold">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">✓</div>
                      <span>Slot Confirmed</span>
                    </div>
                  )}
                  {app.status === 'Completed' && (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-450 font-bold">
                      <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">✓</div>
                      <span>Drive Completed</span>
                    </div>
                  )}
                  {app.status === 'Rejected' && (
                    <div className="flex items-center gap-2 text-rose-500 font-bold">
                      <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px] font-bold">✕</div>
                      <span>Slot Rejected</span>
                    </div>
                  )}
                  {app.status === 'Pending' && (
                    <div className="flex items-center gap-2 text-slate-400 font-medium">
                      <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-[8px] font-bold">●</div>
                      <span>Outcome Pending</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VolunteerApplications;
