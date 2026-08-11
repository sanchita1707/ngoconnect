import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Users, Clock, Heart, Award, CheckCircle, ShieldAlert, Sparkles, Send } from 'lucide-react';

const NGOVolunteers = () => {
  const { showToast } = useNotification();
  
  const [applications, setApplications] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verification modal states
  const [verifyingApp, setVerifyingApp] = useState(null);
  const [hours, setHours] = useState(4);
  const [feedback, setFeedback] = useState('');
  const [peopleImpacted, setPeopleImpacted] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const fetchVolunteersData = async () => {
    setLoading(true);
    try {
      // Get all applications for this NGO
      const appRes = await API.get('/applications/ngo');
      if (appRes.data.success) {
        // Filter out applications that are 'Accepted' so they can be verified/completed
        setApplications(appRes.data.applications.filter(a => a.status === 'Accepted'));
      }

      // Get participation history
      const partRes = await API.get('/participation/ngo');
      if (partRes.data.success) {
        setParticipations(partRes.data.participations);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve volunteers list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteersData();
  }, []);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post('/participation', {
        volunteerId: verifyingApp.volunteerId._id,
        opportunityId: verifyingApp.opportunityId._id,
        hours: Number(hours),
        feedback,
        peopleImpacted: Number(peopleImpacted)
      });

      if (res.data.success) {
        showToast('Verified!', 'Volunteer participation successfully verified. Stats updated!', 'success');
        setVerifyingApp(null);
        setFeedback('');
        setHours(4);
        setPeopleImpacted(5);
        fetchVolunteersData(); // reload
      }
    } catch (err) {
      console.error(err);
      showToast('Error', err.response?.data?.message || 'Verification failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Volunteer Verification</h1>
        <p className="text-sm text-slate-500 mt-1">Verify hours worked and people impacted, logs feedback, and issues certificates.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        
        {/* Verification Checkin Form */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="font-bold text-base text-primary">Pending Check-in ({applications.length})</h3>
          
          {loading ? (
            <div className="h-32 shimmer rounded-2xl"></div>
          ) : applications.length === 0 ? (
            <div className="bg-white dark:bg-charcoal p-10 rounded-2xl text-center text-slate-400 border border-slate-100 dark:border-slate-800">
              No volunteers currently pending check-in.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => (
                <div key={app._id} className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-center sm:text-left">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {app.volunteerId?.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{app.opportunityId?.title}</p>
                    {app.volunteerProfile?.skills && (
                      <div className="flex flex-wrap gap-1 mt-2 justify-center sm:justify-start">
                        {app.volunteerProfile.skills.slice(0, 3).map(s => (
                          <span key={s} className="text-[9px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setVerifyingApp(app)}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Log & Verify</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History of logged hours */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-base text-slate-400">Verified History</h3>
          
          {loading ? (
            <div className="h-40 shimmer rounded-2xl"></div>
          ) : participations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 bg-white dark:bg-charcoal rounded-2xl border border-slate-100">
              No historical verification records found.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {participations.map(part => (
                <div key={part._id} className="bg-white dark:bg-charcoal p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs leading-tight text-slate-800 dark:text-slate-200">
                      {part.volunteerId?.name}
                    </h4>
                    <p className="text-[9px] text-slate-450 mt-1">{part.opportunityId?.title}</p>
                  </div>
                  <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                    +{part.hours} hrs
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Log & Verify Hours Modal Popup */}
      {verifyingApp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-charcoal max-w-md w-full p-6 rounded-3xl shadow-2xl relative border border-slate-100 dark:border-slate-800">
            
            <button
              onClick={() => setVerifyingApp(null)}
              className="absolute top-5 right-5 p-1 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <CheckCircle className="w-5 h-5 text-slate-400" />
            </button>

            <h3 className="font-bold text-base mb-1">Verify Participation</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter service metrics for <strong>{verifyingApp.volunteerId?.name}</strong> on opportunity: "{verifyingApp.opportunityId?.title}".
            </p>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Service Hours</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={hours}
                    onChange={(e) => setHours(Math.max(1, Number(e.target.value)))}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">People Impacted</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={peopleImpacted}
                    onChange={(e) => setPeopleImpacted(Math.max(0, Number(e.target.value)))}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Performance Feedback Note</label>
                <textarea
                  required
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                  placeholder="e.g. Excellent communication skills, highly punctual and cooperative..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyingApp(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Verifying...' : 'Verify Participation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default NGOVolunteers;
