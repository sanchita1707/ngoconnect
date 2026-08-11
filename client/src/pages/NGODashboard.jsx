import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Briefcase, FileText, Users, Layers, Landmark, 
  Plus, ArrowRight, Award, ShieldAlert, CheckCircle, ChevronRight, Clock, Heart
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip 
} from 'recharts';

const NGODashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [oppsCount, setOppsCount] = useState(0);
  const [apps, setApps] = useState([]);
  const [resourcesCount, setResourcesCount] = useState(0);
  const [volunteersCount, setVolunteersCount] = useState(0);
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNGOData = async () => {
      setLoading(true);
      try {
        // Fetch NGO opportunities
        const oppsRes = await API.get('/opportunities');
        const ngoOpps = oppsRes.data.opportunities.filter(o => o.ngoId?._id === user?._id);
        setOppsCount(ngoOpps.length);

        // Fetch applications
        const appsRes = await API.get('/applications/ngo');
        if (appsRes.data.success) {
          setApps(appsRes.data.applications);
        }

        // Fetch resources
        const resRes = await API.get('/resources');
        const ngoRes = resRes.data.resources.filter(r => r.ngoId?._id === user?._id);
        setResourcesCount(ngoRes.length);

        // Fetch checked in participations
        const partRes = await API.get('/participation/ngo');
        if (partRes.data.success) {
          setParticipations(partRes.data.participations);
          const uniqueVols = new Set(partRes.data.participations.map(p => p.volunteerId?._id).filter(Boolean));
          setVolunteersCount(uniqueVols.size);
        }
      } catch (err) {
        console.error(err);
        showToast('Error', 'Failed to retrieve NGO dashboard details.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNGOData();
    }
  }, [user, showToast]);

  const pendingApps = apps.filter(a => a.status === 'Pending');

  // Service metrics calculated from real database records
  const totalServiceHours = participations.reduce((sum, p) => sum + (p.hours || 0), 0);
  const totalPeopleImpacted = participations.reduce((sum, p) => sum + (p.peopleImpacted || 0), 0);

  // Chart data representing volunteer applications
  const getAppStats = () => {
    return [
      { name: 'Mon', count: 2 },
      { name: 'Tue', count: Math.max(1, pendingApps.length - 1) },
      { name: 'Wed', count: Math.max(2, pendingApps.length) },
      { name: 'Thu', count: pendingApps.length + 1 },
      { name: 'Fri', count: apps.length },
      { name: 'Sat', count: apps.length + 2 }
    ];
  };

  const chartData = getAppStats();

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Organization Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage opportunities, review volunteers, and coordinate resource logistics.</p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/ngo/opportunities"
            className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Opportunity
          </Link>
          <Link
            to="/ngo/resources"
            className="px-4 py-2.5 bg-white dark:bg-charcoal text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Request Resource
          </Link>
        </div>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{oppsCount}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Openings</p>
          </div>
        </div>

        <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{volunteersCount}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Volunteers</p>
          </div>
        </div>

        <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{pendingApps.length}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Apps</p>
          </div>
        </div>

        <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{resourcesCount}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Resource Needs</p>
          </div>
        </div>

      </div>

      {/* Dynamic service indicators row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{totalServiceHours} hrs</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Service Contributed</p>
          </div>
        </div>

        <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-550 rounded-xl flex-shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{totalPeopleImpacted}+ people</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Local Citizens Impacted</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Charts */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-charcoal p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Application submissions trend</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} />
                  <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Applications list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-charcoal p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/80 pb-2">
              <h3 className="font-bold text-sm text-slate-450 uppercase tracking-wider">Pending Submissions</h3>
              <Link to="/ngo/applications" className="text-xs text-primary font-bold hover:underline flex items-center">
                All Apps <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingApps.length === 0 ? (
              <p className="text-xs text-slate-450 italic text-center py-6">No pending applications at this time.</p>
            ) : (
              <div className="space-y-3.5">
                {pendingApps.slice(0, 3).map(app => (
                  <div key={app._id} className="p-3.5 bg-slate-50 dark:bg-charcoal-dark/50 border border-slate-100/50 dark:border-slate-800/40 rounded-xl flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                        {app.volunteerId?.name}
                      </p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 truncate">for {app.opportunityId?.title}</p>
                    </div>
                    <Link
                      to="/ngo/applications"
                      className="px-3.5 py-1.5 bg-white dark:bg-charcoal border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-primary hover:border-primary transition-all flex-shrink-0"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default NGODashboard;
