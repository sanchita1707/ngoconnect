import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { FileText, User, Star, Clock, Heart, Check, X, ShieldAlert } from 'lucide-react';

const NGOApplications = () => {
  const { showToast } = useNotification();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Volunteer Profile Modal details
  const [selectedVol, setSelectedVol] = useState(null);
  const [volProfile, setVolProfile] = useState(null);
  const [volHistory, setVolHistory] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/applications/ngo');
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve NGO applications pipeline.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async (appId, status) => {
    try {
      const res = await API.put(`/applications/${appId}`, { status });
      if (res.data.success) {
        showToast('Application Reviewed', `Volunteer application was successfully ${status.toLowerCase()}!`, 'success');
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Application update failed.', 'error');
    }
  };

  const openVolunteerModal = async (volUser) => {
    setSelectedVol(volUser);
    setLoadingProfile(true);
    try {
      const res = await API.get(`/volunteers/${volUser._id}`);
      if (res.data.success) {
        setVolProfile(res.data.profile);
        setVolHistory(res.data.participations);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Could not retrieve volunteer profile details.', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const pendingApps = applications.filter(a => a.status === 'Pending');
  const historyApps = applications.filter(a => a.status !== 'Pending');

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Applications Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Verify volunteer sign-up requests, evaluate cover letters, and confirm slot bookings.</p>
      </div>

      {/* Grid: Pending vs History */}
      <div className="grid lg:grid-cols-5 gap-8">
        
        {/* Pending pipeline */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="font-bold text-base text-amber-500">Incoming Requests ({pendingApps.length})</h3>
          
          {loading ? (
            <div className="h-32 shimmer rounded-2xl"></div>
          ) : pendingApps.length === 0 ? (
            <div className="bg-white dark:bg-charcoal p-10 rounded-2xl text-center text-slate-400 border border-slate-100 dark:border-slate-800">
              No pending applications listed.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApps.map(app => (
                <div key={app._id} className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {app.volunteerId?.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>

                    <button
                      onClick={() => openVolunteerModal(app.volunteerId)}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      View Profile
                    </button>
                  </div>

                  <div className="bg-slate-50 dark:bg-charcoal-dark/50 p-3.5 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-slate-400 uppercase tracking-widest">Opening Target</p>
                    <p className="font-bold text-slate-700 dark:text-slate-350">{app.opportunityId?.title}</p>
                  </div>

                  {app.message && (
                    <p className="text-xs text-slate-500 italic p-3 bg-slate-50 dark:bg-charcoal-dark/20 rounded-xl">
                      "{app.message}"
                    </p>
                  )}

                  {/* CTAs */}
                  <div className="flex gap-2 justify-end border-t border-slate-50 dark:border-slate-800 pt-3">
                    <button
                      onClick={() => handleAction(app._id, 'Rejected')}
                      className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-bold text-rose-600 flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => handleAction(app._id, 'Accepted')}
                      className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History pipeline */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-base text-slate-400">Review History</h3>
          
          {loading ? (
            <div className="h-40 shimmer rounded-2xl"></div>
          ) : historyApps.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 bg-white dark:bg-charcoal rounded-2xl border border-slate-100">
              No processed history logs found.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {historyApps.map(app => (
                <div key={app._id} className="bg-white dark:bg-charcoal p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs leading-tight text-slate-800 dark:text-slate-200">
                      {app.volunteerId?.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-tight mt-1 truncate max-w-[150px]">for {app.opportunityId?.title}</p>
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                    app.status === 'Accepted' || app.status === 'Completed' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30' 
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Volunteer Profile Review Modal Popup */}
      {selectedVol && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-charcoal max-w-lg w-full p-6 rounded-3xl shadow-2xl relative border border-slate-100 dark:border-slate-800">
            
            <button
              onClick={() => {
                setSelectedVol(null);
                setVolProfile(null);
                setVolHistory([]);
              }}
              className="absolute top-5 right-5 p-1 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            {loadingProfile ? (
              <div className="h-44 w-full shimmer rounded-xl my-4"></div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-lg">
                    {selectedVol.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{selectedVol.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{volProfile?.level || 'Newcomer'}</p>
                  </div>
                </div>

                {/* Info block */}
                <div className="bg-slate-50 dark:bg-charcoal-dark/50 p-4 rounded-2xl text-xs space-y-2 border border-slate-100 dark:border-slate-800/80">
                  <p><strong>Biography:</strong> {volProfile?.bio || 'No bio shared.'}</p>
                  <p><strong>Skills:</strong> {volProfile?.skills?.join(', ') || 'None listed.'}</p>
                  <p><strong>Causes:</strong> {volProfile?.preferredCauses?.join(', ') || 'None listed.'}</p>
                  <p><strong>Past Experience:</strong> {volProfile?.experience || 'None listed.'}</p>
                </div>

                {/* History metrics */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-charcoal-dark rounded-xl">
                    <span className="text-slate-400 block font-semibold">Total Hours</span>
                    <span className="font-extrabold text-sm flex items-center justify-center gap-1 mt-1"><Clock className="w-4 h-4 text-primary" /> {volProfile?.volunteerHours || 0}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-charcoal-dark rounded-xl">
                    <span className="text-slate-400 block font-semibold">Total Impact</span>
                    <span className="font-extrabold text-sm flex items-center justify-center gap-1 mt-1"><Heart className="w-4 h-4 text-rose-500 fill-current" /> {volProfile?.impactScore || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default NGOApplications;
