import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Users, Search, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';

const AdminUsers = () => {
  const { showToast } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = '?';
      if (search) query += `search=${search}&`;
      if (roleFilter) query += `role=${roleFilter}&`;
      
      const res = await API.get(`/admin/users${query}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve users list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleStatusToggle = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await API.put(`/admin/users/${userId}/status`, { status: nextStatus });
      if (res.data.success) {
        showToast('Status Updated', `User account is now ${nextStatus}.`, 'success');
        setUsers(prev => 
          prev.map(u => u._id === userId ? { ...u, status: nextStatus } : u)
        );
      }
    } catch (err) {
      console.error(err);
      showToast('Error', err.response?.data?.message || 'Failed to update user status.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Member Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">Review active member accounts and toggle moderation blocks.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 bg-white dark:bg-charcoal p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <input
            type="text"
            placeholder="Search email/name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 bg-transparent text-xs w-40 focus:outline-none"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-transparent focus:outline-none border-l border-slate-100 dark:border-slate-800 pl-2 pr-1"
          >
            <option value="">All Roles</option>
            <option value="volunteer">Volunteer</option>
            <option value="ngo">NGO</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-16 shimmer rounded-xl"></div>)}
        </div>
      ) : users.length === 0 ? (
        <div className="p-8 text-center text-slate-450 bg-white dark:bg-charcoal rounded-2xl border border-slate-150">
          No matching member accounts located.
        </div>
      ) : (
        <div className="bg-white dark:bg-charcoal border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100 dark:divide-slate-850">
            {users.map(u => (
              <div key={u._id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {u.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{u.email} | Role: <span className="font-bold uppercase">{u.role}</span></p>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                    u.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/20'
                  }`}>
                    {u.status}
                  </span>

                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleStatusToggle(u._id, u.status)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        u.status === 'active'
                          ? 'border-slate-200 hover:border-rose-500 text-slate-400 hover:text-rose-500'
                          : 'border-rose-500 text-rose-500 bg-rose-500/5'
                      }`}
                      title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                    >
                      {u.status === 'active' ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-rose-500" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;
