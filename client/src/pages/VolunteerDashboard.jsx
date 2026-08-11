import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import API from '../services/api';
import { 
  Award, Clock, CheckCircle, FileText, Heart, 
  ChevronRight, Calendar, AlertCircle, ArrowRight, ShieldCheck, Star, Sparkles
} from 'lucide-react';

const VolunteerDashboard = () => {
  const { user, profile } = useAuth();
  const { showToast } = useNotification();

  const [apps, setApps] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [urgents, setUrgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch applications
      const appsRes = await API.get('/applications/my');
      if (appsRes.data.success) {
        setApps(appsRes.data.applications);
        
        // Filter upcoming accepted opportunities
        const accepted = appsRes.data.applications.filter(
          a => a.status === 'Accepted' && new Date(a.opportunityId?.date) >= new Date()
        );
        setUpcoming(accepted.slice(0, 3));
      }

      // Fetch urgent opportunities
      const oppRes = await API.get('/opportunities?urgency=Critical&status=Open');
      if (oppRes.data.success && oppRes.data.opportunities.length > 0) {
        setUrgents(oppRes.data.opportunities.slice(0, 3));
      } else {
        const oppResNormal = await API.get('/opportunities?status=Open');
        if (oppResNormal.data.success) {
          setUrgents(oppResNormal.data.opportunities.slice(0, 3));
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve dashboard summaries.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Level thresholds helper
  const getLevelProgress = (xp) => {
    if (xp >= 8000) return { max: 10000, current: xp - 8000, percentage: 100 };
    if (xp >= 4000) return { max: 8000, current: xp, percentage: Math.round((xp / 8000) * 100) };
    if (xp >= 2000) return { max: 4000, current: xp, percentage: Math.round((xp / 4000) * 100) };
    if (xp >= 1000) return { max: 2000, current: xp, percentage: Math.round((xp / 2000) * 100) };
    if (xp >= 500) return { max: 1000, current: xp, percentage: Math.round((xp / 1000) * 100) };
    return { max: 500, current: xp, percentage: Math.round((xp / 500) * 100) };
  };

  const levelProgress = getLevelProgress(profile?.xp || 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary dark:bg-charcoal-dark">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 max-w-7xl mx-auto pb-12">
      
      {/* Greetings */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Welcome back, {user?.name || 'Helper'} 👋
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Ready to create a lasting community difference today?</p>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{apps.length}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Applications</p>
          </div>
        </div>

        <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-550 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
              {apps.filter(a => a.status === 'Accepted' || a.status === 'Completed').length}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Accepted slots</p>
          </div>
        </div>

        <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{profile?.volunteerHours || 0}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Service Hours</p>
          </div>
        </div>

        <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{profile?.impactScore || 0}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Impact Score</p>
          </div>
        </div>

      </div>

      {/* Gamification Level Section */}
      <div className="bg-white dark:bg-charcoal p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Milestone Tier</span>
          <h3 className="text-lg font-extrabold text-amber-600 dark:text-amber-500 flex items-center gap-1.5">
            <Award className="w-5 h-5 fill-current text-amber-500" />
            {profile?.level || 'Newcomer'}
          </h3>
          
          <div className="pt-2 flex items-center gap-4">
            <div className="flex-1 bg-slate-100 dark:bg-charcoal-dark h-2.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${levelProgress.percentage}%` }}></div>
            </div>
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              {profile?.xp || 0} / {levelProgress.max} XP
            </span>
          </div>
        </div>

        {/* Badge cabinet summary */}
        {profile?.badges && profile.badges.length > 0 && (
          <div className="border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-8 flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recent Badges</span>
            <div className="flex gap-2">
              {profile.badges.slice(0, 3).map((badge) => (
                <div
                  key={badge._id}
                  className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-650 shadow-sm hover:scale-105 transition-transform"
                  title={badge.name}
                >
                  <Award className="w-5 h-5 fill-current text-amber-500" />
                </div>
              ))}
              {profile.badges.length > 3 && (
                <Link
                  to="/volunteer/certificates"
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-xs font-bold"
                >
                  +{profile.badges.length - 3}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main layout grids */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Columns: Schedules & Matches */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Upcoming Schedule */}
          <div className="bg-white dark:bg-charcoal p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/80 pb-2">
              <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
                <Calendar className="w-5 h-5 text-primary" /> 
                <span>My Upcoming Schedule</span>
              </h3>
              <Link to="/volunteer/calendar" className="text-xs text-primary font-bold hover:underline flex items-center">
                Full Calendar <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">
                No upcoming scheduled activities. Start exploring new opportunities!
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming.map(app => (
                  <div key={app._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-dark/50 flex items-center justify-between gap-4 border border-slate-100/50 dark:border-slate-800/40">
                    <div className="min-w-0">
                      <p className="font-bold text-sm leading-tight text-slate-800 dark:text-slate-200 truncate">
                        {app.opportunityId?.title}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <span>{new Date(app.opportunityId?.date).toLocaleDateString()}</span>
                        <span>&#8226;</span>
                        <span>{app.opportunityId?.startTime}</span>
                      </p>
                    </div>
                    <Link
                      to={`/opportunities/${app.opportunityId?._id}`}
                      className="px-3.5 py-1.5 bg-white border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary text-primary text-xs font-bold rounded-lg transition-colors flex-shrink-0"
                    >
                      View Detail
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Urgent / Best Matches */}
          <div className="bg-white dark:bg-charcoal p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/80 pb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 fill-current" />
                <span>Recommended Campaigns</span>
              </h3>
              <Link to="/opportunities" className="text-xs text-primary font-bold hover:underline">
                Explore All &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {urgents.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">No matching openings currently.</p>
              ) : (
                urgents.map(opp => (
                  <div key={opp._id} className="p-4 rounded-2xl border border-slate-105 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="text-[8px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">
                        {opp.category}
                      </span>
                      <p className="font-bold text-xs sm:text-sm mt-1.5 text-slate-800 dark:text-slate-200 truncate">{opp.title}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5 truncate">by {opp.ngoId?.name} | {opp.city}</p>
                    </div>
                    <Link
                      to={`/opportunities/${opp._id}`}
                      className="px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-primary-dark transition-all flex-shrink-0"
                    >
                      Apply
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Bio summary card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-charcoal p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center flex flex-col items-center">
            
            {/* User Avatar */}
            <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary text-primary flex items-center justify-center font-bold text-xl uppercase overflow-hidden shadow-md">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.substring(0, 2) || 'US'
              )}
            </div>

            <h3 className="font-bold text-base mt-4 text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Verified Community Volunteer</p>

            <p className="text-xs text-slate-500 dark:text-slate-450 mt-4 leading-relaxed line-clamp-3">
              {profile?.bio || 'You haven\'t added a biography yet. Go to profile settings to complete your profile.'}
            </p>

            {/* Completion meter */}
            <div className="w-full mt-6 bg-slate-50 dark:bg-charcoal-dark/50 p-4 rounded-2xl text-left border border-slate-100 dark:border-slate-800/80">
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="text-slate-400">Profile Completion</span>
                <span className="text-slate-700 dark:text-slate-300">{profile?.profileCompletion || 0}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${profile?.profileCompletion || 0}%` }}></div>
              </div>
            </div>

            <Link
              to="/volunteer/profile"
              className="w-full py-2.5 mt-6 border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary text-primary rounded-xl text-xs font-bold text-center transition-all"
            >
              Update Profile Details
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default VolunteerDashboard;
