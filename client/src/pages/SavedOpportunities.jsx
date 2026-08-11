import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, Calendar, Trash2 } from 'lucide-react';

const SavedOpportunities = () => {
  const { showToast } = useNotification();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await API.get('/volunteers/saved');
      if (res.data.success) {
        setOpportunities(res.data.opportunities);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve saved opportunities.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (oppId) => {
    try {
      const res = await API.post(`/volunteers/saved/${oppId}`);
      if (res.data.success) {
        setOpportunities(prev => prev.filter(opp => opp._id !== oppId));
        showToast('Removed', 'Opportunity removed from saved list.', 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to remove saved opportunity.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Saved Opportunities</h1>
        <p className="text-sm text-slate-500 mt-1">Bookmarked volunteering openings you saved for later.</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-44 rounded-2xl shimmer border border-slate-100 dark:border-slate-850"></div>
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white dark:bg-charcoal p-10 rounded-2xl border border-slate-150 dark:border-slate-800 text-center text-slate-400">
          No saved opportunities found.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
            <div key={opp._id} className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative group">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block mb-3">
                  {opp.category}
                </span>

                <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">{opp.title}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">by {opp.ngoId?.name}</p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{opp.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(opp.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-50 dark:border-slate-800/80 pt-4 mt-6 flex items-center justify-between gap-4">
                <button
                  onClick={() => handleRemove(opp._id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link
                  to={`/opportunities/${opp._id}`}
                  className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-lg transition-all"
                >
                  Help Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedOpportunities;
