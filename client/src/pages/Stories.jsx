import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import PageHeader from '../components/PageHeader';
import { SkeletonCard, EmptyState } from '../components/StatusState';
import { BookOpen, Sparkles, Heart, Clock, Users, AlertTriangle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const Stories = () => {
  const { showToast } = useNotification();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/stories');
      if (res.data.success) {
        setStories(res.data.stories);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve stories list.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  return (
    <div className="bg-slate-50 dark:bg-charcoal-dark min-h-screen py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Consistent Page Header */}
        <PageHeader
          label="Highlights"
          heading="Success Stories"
          description="Read inspiring impact narratives detailing volunteer service milestones achieved across India."
        />

        {/* Stories List */}
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-6">
            <SkeletonCard count={2} />
          </div>
        ) : stories.length === 0 ? (
          <EmptyState
            title="No stories shared yet"
            description="Success stories highlighting verified community service changes will appear here."
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {stories.map((story) => (
              <div key={story._id} className="card-global flex flex-col justify-between">
                
                <div>
                  {/* Story Image */}
                  {story.image && (
                    <div className="w-full h-48 bg-slate-100 dark:bg-slate-900 overflow-hidden relative border-b border-slate-50 dark:border-slate-800/80">
                      <img 
                        src={story.image} 
                        alt={story.title} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          const placeholder = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 24 24'><rect width='24' height='24' fill='%23047857'/><g transform='translate(4.5, 4.5) scale(0.625)'><path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='white'/></g></svg>`;
                          if (e.target.src !== placeholder) {
                            e.target.src = placeholder;
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                        {story.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(story.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug">{story.title}</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold">shared by {story.ngoId?.name || 'NGO Partner'}</p>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4 whitespace-pre-line">
                      {story.description}
                    </p>
                  </div>
                </div>

                {/* Footer Metrics Panel */}
                <div className="p-5 border-t border-slate-50 dark:border-slate-800/80 bg-slate-50/20 dark:bg-charcoal-dark/10 flex items-center justify-around gap-4 text-center">
                  <div className="text-center">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Volunteers</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-850 dark:text-slate-200 mt-1 flex items-center gap-1 justify-center">
                      <Users className="w-3.5 h-3.5 text-primary" /> {story.volunteersCount}
                    </span>
                  </div>
                  <div className="text-center border-l border-slate-150 dark:border-slate-800 pl-4 flex-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Hours</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-850 dark:text-slate-200 mt-1 flex items-center gap-1 justify-center">
                      <Clock className="w-3.5 h-3.5 text-primary" /> {story.hours}
                    </span>
                  </div>
                  <div className="text-center border-l border-slate-150 dark:border-slate-800 pl-4 flex-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Impacted</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-850 dark:text-slate-200 mt-1 flex items-center gap-1 justify-center">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> {story.peopleImpacted}
                    </span>
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

export default Stories;
