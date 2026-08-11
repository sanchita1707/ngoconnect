import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import PageHeader from '../components/PageHeader';
import { SkeletonCard, EmptyState } from '../components/StatusState';
import { BookOpen, Calendar, DollarSign, AlertTriangle, ShieldCheck, Award } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const Campaigns = () => {
  const { showToast } = useNotification();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/campaigns');
      if (res.data.success) {
        setCampaigns(res.data.campaigns);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve active campaigns list.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <div className="bg-slate-50 dark:bg-charcoal-dark min-h-screen py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Consistent Page Header */}
        <PageHeader
          label="Drives"
          heading="NGO Campaigns"
          description="Support physical supply distributions, donations, and long-term social initiatives hosted by verified NGOs."
        />

        {/* Catalog grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard count={3} />
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyState
            title="No active campaigns"
            description="There are currently no active social campaigns running on the platform."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => (
              <div key={camp._id} className="card-global">
                <div>
                  {/* Campaign Image */}
                  <div className="w-full h-44 bg-slate-100 dark:bg-slate-900 overflow-hidden relative border-b border-slate-50 dark:border-slate-800/80">
                    <img 
                      src={camp.image} 
                      alt={camp.title} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        const placeholder = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 24 24'><rect width='24' height='24' fill='%23047857'/><g transform='translate(4.5, 4.5) scale(0.625)'><path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='white'/></g></svg>`;
                        if (e.target.src !== placeholder) {
                          e.target.src = placeholder;
                        }
                      }}
                    />
                    
                    <span className="absolute top-4 left-4 text-[9px] font-black bg-white/95 backdrop-blur-sm text-slate-800 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      Active Campaign
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug line-clamp-1">{camp.title}</h3>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1.5 flex items-center gap-1.5">
                      {camp.ngoId?.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 fill-current" title="Verified NGO" />
                      )}
                      <span>by {camp.ngoId?.name || 'NGO Partner'}</span>
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-3.5 line-clamp-2 leading-relaxed">
                      {camp.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 border-t border-slate-50 dark:border-slate-800/80 bg-slate-50/20 dark:bg-charcoal-dark/10 flex flex-col gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-slate-450 uppercase tracking-wider block">Target Goal</span>
                    <span className="font-extrabold text-sm text-slate-850 dark:text-slate-200 mt-1 block">{camp.goal}</span>
                  </div>
                  
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between font-semibold border-t border-slate-100 dark:border-slate-800/80 pt-2.5 mt-1">
                    <span>Starts: {new Date(camp.startDate).toLocaleDateString()}</span>
                    <span>Ends: {new Date(camp.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Campaigns;
