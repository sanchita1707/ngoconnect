import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import API from '../services/api';
import PageHeader from '../components/PageHeader';
import { SkeletonCard, EmptyState } from '../components/StatusState';
import { Layers, MapPin, Calendar, Clock, AlertTriangle, CheckCircle, Gift, X } from 'lucide-react';

const Resources = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [contribQuantity, setContribQuantity] = useState(1);
  const [isContributing, setIsContributing] = useState(false);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/resources');
      if (res.data.success) {
        setResources(res.data.resources);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to fetch resource needs.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleContributeSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Authentication Required', 'Please sign in to log contributions.', 'warning');
      return;
    }
    if (user.role !== 'volunteer') {
      showToast('Action Blocked', 'Only volunteer accounts can contribute resources.', 'warning');
      return;
    }

    try {
      const res = await API.post(`/resources/${selectedResource._id}/contribute`, {
        quantity: Number(contribQuantity)
      });

      if (res.data.success) {
        showToast('Thank You!', `Contribution of ${contribQuantity} ${selectedResource.unit} registered.`, 'success');
        setIsContributing(false);
        setContribQuantity(1);
        // Reload resources to refresh progress bars
        fetchResources();
      }
    } catch (err) {
      console.error(err);
      showToast('Error', err.response?.data?.message || 'Contribution failed.', 'error');
    }
  };

  const getUrgencyBadge = (urg) => {
    if (urg === 'Critical' || urg === 'Urgent') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  };

  return (
    <div className="bg-slate-50 dark:bg-charcoal-dark min-h-screen py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Consistent Page Header */}
        <PageHeader
          label="Procurement"
          heading="Physical Material Needs"
          description="Support partner organizations by pledging supply items required for their field activities."
        />

        {/* Catalog */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard count={3} />
          </div>
        ) : resources.length === 0 ? (
          <EmptyState
            title="No active supply requests"
            description="All listed physical resource demands are currently fully verified and met."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => {
              const progress = Math.min(Math.round((res.quantityReceived / res.quantityRequired) * 100), 100);
              const isFulfilled = res.status === 'Fulfilled' || res.status === 'Closed' || progress >= 100;
              return (
                <div key={res._id} className="card-global p-5">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {res.category}
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${getUrgencyBadge(res.urgency)}`}>
                        {res.urgency}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">{res.title}</h3>
                    <p className="text-xs text-primary dark:text-primary-light font-bold mt-1">by {res.ngoId?.name || 'NGO Partner'}</p>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>

                    {/* Progress details */}
                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-slate-700 dark:text-slate-350">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                        <span>Needed: {res.quantityRequired} {res.unit}</span>
                        <span>Logged: {res.quantityReceived} {res.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-slate-50 dark:border-slate-800/80 pt-4 mt-6 flex items-center justify-between gap-4">
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 min-w-0 truncate">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{res.location || 'Local Head Office'}</span>
                    </span>
                    {isFulfilled ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Fulfilled
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedResource(res);
                          setIsContributing(true);
                        }}
                        className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>Pledge</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Contribution Modal Popup */}
        {isContributing && selectedResource && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-charcoal max-w-sm w-full p-6 rounded-[24px] shadow-2xl relative border border-slate-100 dark:border-slate-800 flex flex-col">
              
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-850 dark:text-white">Pledge Contribution</h3>
                <button 
                  onClick={() => {
                    setIsContributing(false);
                    setSelectedResource(null);
                  }}
                  className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-405 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Pledge supply items for <strong>"{selectedResource.title}"</strong>. Supply items should be coordinated and delivered directly to the NGO representative.
              </p>

              <form onSubmit={handleContributeSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Quantity of {selectedResource.unit} to deliver
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    max={selectedResource.quantityRequired - selectedResource.quantityReceived}
                    value={contribQuantity}
                    onChange={(e) => setContribQuantity(Math.max(1, Number(e.target.value)))}
                    className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsContributing(false);
                      setSelectedResource(null);
                    }}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-750 dark:text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary h-9 px-4"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Confirm Pledge</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Resources;
