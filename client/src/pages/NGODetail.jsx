import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  MapPin, Globe, Phone, Mail, ShieldCheck, 
  Award, Star, Activity, Clipboard, BookOpen, AlertTriangle, Calendar, Clock, Heart, Users, MessageSquare 
} from 'lucide-react';

const NGODetail = () => {
  const { id } = useParams(); // NGO User ID
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [ngo, setNgo] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState('opportunities');

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [postingReview, setPostingReview] = useState(false);

  const fetchNGODetails = async () => {
    try {
      const res = await API.get(`/ngos/${id}`);
      if (res.data.success) {
        setNgo(res.data.ngo);
        setOpportunities(res.data.opportunities);
        setCampaigns(res.data.campaigns);
        setEvents(res.data.events);
        setReviews(res.data.reviews);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve NGO detailed profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchNGODetails();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Login Required', 'Please sign in to write reviews.', 'warning');
      return;
    }

    if (user.role !== 'volunteer') {
      showToast('Invalid Access', 'Only volunteers can write reviews for NGOs.', 'warning');
      return;
    }

    setPostingReview(true);
    try {
      const res = await API.post('/reviews', {
        ngoId: ngo.userId._id,
        rating: reviewRating,
        comment: reviewComment
      });
      if (res.data.success) {
        showToast('Review Submitted', 'Thank you! Your feedback is logged.', 'success');
        setReviewComment('');
        // Refresh details to show new review and update trustScore
        fetchNGODetails();
      }
    } catch (err) {
      console.error(err);
      showToast('Error', err.response?.data?.message || 'Review posting failed.', 'error');
    } finally {
      setPostingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary dark:bg-charcoal-dark">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!ngo) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-2" />
        <h2 className="text-xl font-bold">NGO Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">This organization profile could not be loaded.</p>
        <Link to="/ngos" className="mt-6 btn-primary">Back to Directory</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-charcoal-dark min-h-screen py-6 md:py-10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* NGO Header Hero Profile */}
        <div className="bg-white dark:bg-charcoal rounded-[24px] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            
            {/* Logo and metadata */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
              <div className="w-20 h-20 bg-primary/10 border border-primary/20 text-primary rounded-[20px] flex items-center justify-center font-bold uppercase text-2xl overflow-hidden flex-shrink-0 shadow-sm">
                {ngo.userId?.profileImage ? (
                  <img src={ngo.userId.profileImage} alt={ngo.organizationName} className="w-full h-full object-cover" />
                ) : (
                  ngo.organizationName.substring(0, 2)
                )}
              </div>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    {ngo.organizationName}
                  </h1>
                  {ngo.verificationStatus === 'Verified' ? (
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 fill-current" />
                      <span>Verified NGO</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" />
                      <span>Pending Verification</span>
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {ngo.city}, {ngo.state}
                  </span>
                  {ngo.website && (
                    <a href={ngo.website.startsWith('http') ? ngo.website : `https://${ngo.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span>{ngo.website.replace('https://', '').replace('http://', '').replace('www.', '')}</span>
                    </a>
                  )}
                  {ngo.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {ngo.phone}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 mt-2">
                  {ngo.causes && ngo.causes.map(c => (
                    <span key={c} className="text-[9px] font-bold bg-primary/10 text-primary dark:text-primary-light px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust rating badge card */}
            <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl text-center w-full md:w-44 flex-shrink-0">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest block">Trust Rating</span>
              <span className="text-3xl font-black text-amber-600 mt-1 block">{ngo.trustScore}/100</span>
              <span className="text-[9px] text-slate-450 dark:text-slate-500 mt-1 block leading-tight">Based on verified listings and volunteer ratings.</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800/80 space-y-3">
            <h3 className="font-bold text-sm text-slate-400 dark:text-slate-500 uppercase tracking-widest">About the NGO</h3>
            <p className="text-sm sm:text-base text-slate-650 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {ngo.description || `${ngo.organizationName} is a committed non-profit organization focused on making tangible improvements across education, community development, and healthcare sectors.`}
            </p>
          </div>
        </div>

        {/* Dynamic platform stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-center">
            <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
              <span className="text-2xl font-black text-primary block">{stats.totalVolunteersCount || 0}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">Volunteers Active</span>
            </div>
            <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
              <span className="text-2xl font-black text-primary block">{stats.totalHours || 0} hrs</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">Service Logged</span>
            </div>
            <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
              <span className="text-2xl font-black text-amber-500 block">{stats.totalPeopleImpacted || 0}+</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">People Impacted</span>
            </div>
            <div className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
              <span className="text-2xl font-black text-amber-500 block">{opportunities.length || 0}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">Openings Listed</span>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-6 text-sm overflow-x-auto scrollbar-none">
          {[
            { id: 'opportunities', label: 'Opportunities', count: opportunities.length },
            { id: 'campaigns', label: 'Campaigns', count: campaigns.length },
            { id: 'events', label: 'Scheduled Events', count: events.length },
            { id: 'reviews', label: 'Reviews', count: reviews.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tab Details */}
        <div className="min-h-60 mb-10">
          
          {/* Opportunities tab */}
          {activeTab === 'opportunities' && (
            <div>
              {opportunities.length === 0 ? (
                <div className="bg-white dark:bg-charcoal p-8 rounded-2xl text-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800/80 text-xs font-semibold">
                  No open opportunities listed currently
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {opportunities.map(opp => (
                    <div key={opp._id} className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-md mb-2 inline-block">
                          {opp.category}
                        </span>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">{opp.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{opp.description}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/80 pt-3">
                        <span className="text-xs text-slate-450 dark:text-slate-500 flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(opp.date).toLocaleDateString()}</span>
                        </span>
                        <Link to={`/opportunities/${opp._id}`} className="text-xs font-bold text-primary hover:underline">
                          View details &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Campaigns tab */}
          {activeTab === 'campaigns' && (
            <div>
              {campaigns.length === 0 ? (
                <div className="bg-white dark:bg-charcoal p-8 rounded-2xl text-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800/80 text-xs font-semibold">
                  No active campaigns listed currently
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {campaigns.map(camp => (
                    <div key={camp._id} className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white">{camp.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{camp.description}</p>
                        <p className="text-xs font-bold text-slate-400 mt-3">Target Goal: <span className="text-slate-700 dark:text-slate-350">{camp.goal}</span></p>
                      </div>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-450 font-bold uppercase px-2.5 py-0.5 rounded-full mt-4 self-start">
                        {camp.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Events tab */}
          {activeTab === 'events' && (
            <div>
              {events.length === 0 ? (
                <div className="bg-white dark:bg-charcoal p-8 rounded-2xl text-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800/80 text-xs font-semibold">
                  No scheduled events listed currently
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {events.map(ev => (
                    <div key={ev._id} className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="font-bold text-base text-slate-900 dark:text-white">{ev.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{ev.description}</p>
                        <div className="text-xs text-slate-500 space-y-1 mt-3">
                          <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Date: {new Date(ev.date).toLocaleDateString()}</p>
                          <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Time: {ev.startTime} - {ev.endTime}</p>
                          <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Location: {ev.location}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-400 mt-4">Capacity: {ev.attendees.length} / {ev.capacity} joined</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              
              {/* Form to submit review */}
              {user?.role === 'volunteer' && (
                <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-charcoal p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Rate and Review this NGO</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rating score</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-charcoal-dark/50 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5 Star)</option>
                        <option value="4">⭐⭐⭐⭐ (4 Star)</option>
                        <option value="3">⭐⭐⭐ (3 Star)</option>
                        <option value="2">⭐⭐ (2 Star)</option>
                        <option value="1">⭐ (1 Star)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comment review</label>
                      <input
                        type="text"
                        required
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Write down your experience with the NGO group..."
                        className="block w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-charcoal-dark/50 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={postingReview}
                    className="btn-primary h-9 px-4 ml-auto"
                  >
                    {postingReview ? 'Logging...' : 'Post Review'}
                  </button>
                </form>
              )}

              {/* Reviews list */}
              {reviews.length === 0 ? (
                <div className="bg-white dark:bg-charcoal p-8 rounded-2xl text-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800/80 text-xs font-semibold">
                  No volunteer reviews logged yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 text-slate-600 dark:text-slate-350">
                        {rev.volunteerId?.name?.substring(0, 2) || 'V'}
                      </div>
                      
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">{rev.volunteerId?.name || 'Anonymous'}</p>
                          <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex text-amber-500 text-[10px] font-bold">
                          {Array.from({ length: rev.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-1">{rev.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default NGODetail;
