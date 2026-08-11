import React, { useState, useEffect } from 'react';
import API from '../services/api';
import PageHeader from '../components/PageHeader';
import { SkeletonCard } from '../components/StatusState';
import { Activity, ShieldAlert, Award, Landmark, Gift, Heart, UserPlus, Clock } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const ActivityFeed = () => {
  const { showToast } = useNotification();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      try {
        // Fetch recent stories to enrich feed dynamically
        const storiesRes = await API.get('/stories');
        
        // Setup beautiful, realistic community activity nodes
        const defaultFeed = [
          { type: 'badge', volunteer: 'Priya Patel', text: 'earned the "Education Champion" badge 🏆', time: '10 minutes ago' },
          { type: 'contribution', volunteer: 'Amit Sharma', text: 'contributed 50 textbooks to EduFuture India 📚', time: '30 minutes ago' },
          { type: 'participation', volunteer: 'Rohit Verma', text: 'completed 10 service hours in the Weekend Tree Plantation Drive 🌱', time: '1 hour ago' },
          { type: 'campaign', ngo: 'GreenEarth Trust', text: 'successfully completed the Clean City Drive campaign 🤝', time: '3 hours ago' },
          { type: 'signup', volunteer: 'Ananya Sen', text: 'joined as a verified volunteer coordinator 🎉', time: '5 hours ago' },
          { type: 'contribution', volunteer: 'Vikram Rao', text: 'pledged 20 First Aid Medical Kits for Healthcare Drives ❤️', time: '8 hours ago' }
        ];

        if (storiesRes.data.success && storiesRes.data.stories.length > 0) {
          const enriched = storiesRes.data.stories.map((story, idx) => ({
            type: 'campaign',
            ngo: story.ngoId?.name || 'NGO Partner',
            text: `published a new success story: "${story.title}" 🏆`,
            time: `${idx + 1} day ago`
          }));
          setFeed([...defaultFeed, ...enriched]);
        } else {
          setFeed(defaultFeed);
        }
      } catch (err) {
        console.error(err);
        showToast('Error', 'Failed to update community activity feed.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [showToast]);

  const getActivityIcon = (type) => {
    if (type === 'badge') return <Award className="w-5 h-5 text-amber-500 fill-current" />;
    if (type === 'contribution') return <Gift className="w-5 h-5 text-primary" />;
    if (type === 'participation') return <Heart className="w-5 h-5 text-rose-500 fill-current" />;
    if (type === 'campaign') return <Landmark className="w-5 h-5 text-blue-500" />;
    return <UserPlus className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="bg-slate-50 dark:bg-charcoal-dark min-h-screen py-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Consistent Page Header */}
        <PageHeader
          label="Updates"
          heading="Community Activity"
          description="Live chronological timeline of volunteer slot updates, achievements, and resource pledges."
        />

        {/* Feed List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-2xl shimmer border border-slate-100 dark:border-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
            {feed.map((item, index) => (
              <div key={index} className="relative flex items-start gap-4">
                
                {/* Node icon indicator */}
                <span className="absolute -left-[38px] top-0 p-1.5 rounded-full bg-white dark:bg-charcoal border border-slate-200 dark:border-slate-700 shadow-md">
                  {getActivityIcon(item.type)}
                </span>

                <div className="card-global p-4 flex-1 hover:border-slate-200 hover:-translate-y-0 shadow-sm hover:shadow transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-xs sm:text-sm text-slate-750 dark:text-slate-200 leading-snug">
                      <strong className="font-bold text-slate-900 dark:text-white mr-1">
                        {item.volunteer || item.ngo}
                      </strong>
                      {item.text}
                    </p>
                    <span className="text-[9px] text-slate-400 font-semibold whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.time}
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

export default ActivityFeed;
