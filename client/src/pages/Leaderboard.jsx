import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { Award, Clock, Star, Users, AlertTriangle, Trophy } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

const Leaderboard = () => {
  const { showToast } = useNotification();
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter duration state
  const [timeframe, setTimeframe] = useState('All Time');

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/volunteers/leaderboard');
      if (res.data.success) {
        setBoard(res.data.leaderboard);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to fetch leaderboard rankings.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankBadge = (rank) => {
    if (rank === 0) return <span className="text-xl font-bold" title="1st Place">🥇</span>;
    if (rank === 1) return <span className="text-xl font-bold" title="2nd Place">🥈</span>;
    if (rank === 2) return <span className="text-xl font-bold" title="3rd Place">🥉</span>;
    return <span className="font-bold text-slate-400 text-xs dark:text-slate-500">#{rank + 1}</span>;
  };

  return (
    <div className="bg-slate-50 dark:bg-charcoal-dark min-h-screen py-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Consistent Page Header */}
        <PageHeader
          label="Rankings"
          heading="Impact Leaderboard"
          description="Recognizing outstanding volunteering efforts and social support contributions across the country."
        />

        {/* Timeframe filters */}
        <div className="flex justify-center gap-2 mb-8 bg-white dark:bg-charcoal p-1 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm max-w-sm mx-auto">
          {['This Week', 'This Month', 'This Year', 'All Time'].map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf);
                showToast('Filter Applied', `Rankings filtered by ${tf}`, 'info');
              }}
              className={`flex-1 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                timeframe === tf
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Rankings Card */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 rounded-2xl shimmer border border-slate-100 dark:border-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : board.length === 0 ? (
          <div className="bg-white dark:bg-charcoal p-12 rounded-[24px] border border-slate-100 dark:border-slate-800 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold">Leaderboard empty</h3>
            <p className="text-sm text-slate-400 mt-2 font-medium">Verify your participation to enter the rankings.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-charcoal rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-md overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {board.map((item, index) => {
                const isCurrentUser = user && item.userId?._id === user._id;
                return (
                  <div
                    key={item._id}
                    className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/20 ${
                      isCurrentUser ? 'bg-primary/10 dark:bg-primary-dark/20 border-l-4 border-l-primary' : (index < 3 ? 'bg-primary/5 dark:bg-primary-dark/5' : '')
                    }`}
                  >
                    
                    {/* Left: Rank & User Avatar/Name */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-8 flex justify-center flex-shrink-0">{getRankBadge(index)}</div>
                      
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm uppercase overflow-hidden flex-shrink-0 text-slate-600 dark:text-slate-350">
                        {item.userId?.profileImage ? (
                          <img src={item.userId.profileImage} alt={item.userId.name} className="w-full h-full object-cover" />
                        ) : (
                          item.userId?.name?.substring(0, 2) || 'US'
                        )}
                      </div>
                      
                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                          <span>{item.userId?.name}</span>
                          {isCurrentUser && (
                            <span className="text-[8px] bg-primary text-white px-2 py-0.5 rounded-full font-black uppercase">You</span>
                          )}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5 truncate">{item.level}</p>
                      </div>
                    </div>

                    {/* Right: XP and Hours */}
                    <div className="flex items-center gap-4 sm:gap-6 text-right flex-shrink-0">
                      <div>
                        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Hours</span>
                        <span className="text-xs sm:text-sm font-extrabold flex items-center gap-1 justify-end mt-0.5 text-slate-750 dark:text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{item.volunteerHours}h</span>
                        </span>
                      </div>

                      <div className="w-16 sm:w-20">
                        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">XP Earned</span>
                        <span className="text-xs sm:text-sm font-extrabold flex items-center gap-1 justify-end text-amber-600 dark:text-amber-500 mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{item.xp} XP</span>
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Leaderboard;
