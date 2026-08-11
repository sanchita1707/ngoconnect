import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { 
  Users, Landmark, Briefcase, Clock, Heart, 
  ShieldAlert, Award, FileText, CheckCircle 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell 
} from 'recharts';

const AdminDashboard = () => {
  const { showToast } = useNotification();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#047857', '#10b981', '#fbbf24', '#d97706', '#3b82f6', '#f43f5e'];

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await API.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error(err);
        showToast('Error', 'Failed to retrieve admin ecosystem stats.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [showToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary dark:bg-charcoal-dark">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Formatting chart data
  const getGrowthData = () => {
    if (!stats?.userGrowth || stats.userGrowth.length === 0) {
      return [
        { name: 'Mar', count: 5 },
        { name: 'Apr', count: 12 },
        { name: 'May', count: 18 },
        { name: 'Jun', count: 24 },
        { name: 'Jul', count: 32 },
        { name: 'Aug', count: stats?.totalUsers || 42 }
      ];
    }
    return stats.userGrowth.map(item => ({
      name: item._id, // e.g. "2026-08"
      count: item.count
    }));
  };

  const getCategoryData = () => {
    if (!stats?.categories || stats.categories.length === 0) {
      return [
        { name: 'Education', value: 8 },
        { name: 'Environment', value: 6 },
        { name: 'Healthcare', value: 4 },
        { name: 'Food', value: 4 }
      ];
    }
    return stats.categories.map(item => ({
      name: item._id?.split(' ')[1] || item._id || 'Other',
      value: item.count
    }));
  };

  const growthData = getGrowthData();
  const catData = getCategoryData();

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Console</h1>
        <p className="text-sm text-slate-500 mt-1">Ecosystem metrics overview and platform moderations.</p>
      </div>

      {/* Counters Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black">{stats.totalUsers}</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Members</p>
            </div>
          </div>

          <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black">{stats.ngosCount}</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Registered NGOs</p>
            </div>
          </div>

          <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black">{stats.opportunitiesCount}</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Campaigns</p>
            </div>
          </div>

          <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black">{stats.totalHours}</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Service Hours</p>
            </div>
          </div>

        </div>
      )}

      {/* Recharts Grid */}
      <div className="grid md:grid-cols-5 gap-6">
        
        {/* Growth Bar */}
        <div className="bg-white dark:bg-charcoal p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm md:col-span-3">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-4">Monthly User Sign-ups</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} />
                <Bar dataKey="count" fill="#047857" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie */}
        <div className="bg-white dark:bg-charcoal p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm md:col-span-2">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-4">Campaigns by Category</h3>
          <div className="h-56 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={catData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {catData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute flex flex-col gap-1 text-[9px] left-2 bottom-2 font-bold text-slate-400">
              {catData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
