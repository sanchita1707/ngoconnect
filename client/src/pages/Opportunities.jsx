import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import API from '../services/api';
import PageHeader from '../components/PageHeader';
import { SkeletonCard, EmptyState } from '../components/StatusState';
import { 
  Search, MapPin, Calendar, Clock, AlertTriangle, 
  Heart, Star, ShieldCheck, Users, RotateCcw, Filter, X, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';

// Standalone vector-based category placeholder images (offline-friendly & 100% reliable)
const getCategoryPlaceholder = (category) => {
  let color = '%23047857'; // default emerald
  let iconPath = ''; // SVG path

  const normalized = (category || '').toLowerCase();
  if (normalized.includes('env') || normalized.includes('tree')) {
    color = '%23047857'; // Emerald
    iconPath = '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  } else if (normalized.includes('edu') || normalized.includes('read')) {
    color = '%232563eb'; // Blue
    iconPath = '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V5A2.5 2.5 0 0 1 6.5 2.5H20v20H6.5" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  } else if (normalized.includes('health') || normalized.includes('blood') || normalized.includes('medic')) {
    color = '%23e11d48'; // Rose
    iconPath = '<path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  } else if (normalized.includes('food') || normalized.includes('hunger')) {
    color = '%23d97706'; // Amber
    iconPath = '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  } else {
    color = '%231e293b'; // Charcoal
    iconPath = '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white"/>';
  }

  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 24 24'><rect width='24' height='24' fill='${color}'/><g transform='translate(4.5, 4.5) scale(0.625)'>${iconPath}</g></svg>`;
};

// Reusable Image component that handles offline/online fallbacks gracefully
const ImageWithFallback = ({ src, alt, category, className }) => {
  const placeholder = getCategoryPlaceholder(category);
  const [imgSrc, setImgSrc] = useState(src || placeholder);

  useEffect(() => {
    setImgSrc(src || placeholder);
  }, [src, category, placeholder]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (imgSrc !== placeholder) {
          setImgSrc(placeholder);
        }
      }}
    />
  );
};

const Opportunities = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [opportunities, setOpportunities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort parameters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [urgency, setUrgency] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [availability, setAvailability] = useState(''); // 'weekdays' | 'weekends' | ''
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'urgency' | 'slots_needed'
  
  // Mobile drawer filter status
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const categories = [
    '🌱 Environment', '📚 Education', '❤️ Healthcare', '🍲 Food Support', 
    '👶 Child Welfare', '👵 Elder Care', '🐾 Animal Welfare', 
    '🏘️ Community Development', '🩸 Blood Donation', '🌳 Tree Plantation'
  ];

  const fetchOpps = useCallback(async () => {
    setLoading(true);
    try {
      let query = '?status=Open';
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (category) query += `&category=${encodeURIComponent(category)}`;
      if (city) query += `&city=${encodeURIComponent(city)}`;
      if (urgency) query += `&urgency=${encodeURIComponent(urgency)}`;

      const res = await API.get(`/opportunities${query}`);
      if (res.data.success) {
        setOpportunities(res.data.opportunities);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve opportunities list.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, category, city, urgency, showToast]);

  const fetchRecommendations = useCallback(async () => {
    if (user?.role !== 'volunteer') return;
    try {
      const res = await API.get('/opportunities/recommendations');
      if (res.data.success) {
        setRecommendations(res.data.recommendations);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  }, [user]);

  const fetchSavedList = useCallback(async () => {
    if (user?.role !== 'volunteer') return;
    try {
      const res = await API.get('/volunteers/saved');
      if (res.data.success) {
        setSavedIds(res.data.opportunities.map(o => o._id));
      }
    } catch (err) {
      console.error('Error loading saved wishlist:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchOpps();
    fetchRecommendations();
    fetchSavedList();
  }, [fetchOpps, fetchRecommendations, fetchSavedList]);

  const handleSaveToggle = async (oppId) => {
    if (!user) {
      showToast('Authentication Required', 'Please sign in to save opportunities.', 'warning');
      return;
    }
    if (user.role !== 'volunteer') {
      showToast('Access Blocked', 'Only volunteers can save opportunities.', 'warning');
      return;
    }

    try {
      const res = await API.post(`/volunteers/saved/${oppId}`);
      if (res.data.success) {
        if (res.data.saved) {
          setSavedIds(prev => [...prev, oppId]);
          showToast('Saved', 'Added to saved wishlist.', 'success');
        } else {
          setSavedIds(prev => prev.filter(id => id !== oppId));
          showToast('Removed', 'Removed from saved wishlist.', 'info');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to toggle save status.', 'error');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setCity('');
    setUrgency('');
    setDateFilter('');
    setAvailability('');
    setSortBy('newest');
  };

  const getUrgencyStyles = (urg) => {
    if (urg === 'Critical') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    if (urg === 'Urgent') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    if (urg === 'Important') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  };

  // Client-side filtering & sorting on top of base query results
  const getProcessedOpportunities = () => {
    let result = [...opportunities];

    // Filter by Date
    if (dateFilter) {
      const targetDateStr = new Date(dateFilter).toDateString();
      result = result.filter(opp => new Date(opp.date).toDateString() === targetDateStr);
    }

    // Filter by Availability (Weekdays / Weekends)
    if (availability === 'weekdays') {
      result = result.filter(opp => {
        const day = new Date(opp.date).getDay();
        return day >= 1 && day <= 5; // Monday to Friday
      });
    } else if (availability === 'weekends') {
      result = result.filter(opp => {
        const day = new Date(opp.date).getDay();
        return day === 0 || day === 6; // Sunday or Saturday
      });
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'urgency') {
      const weight = { Critical: 4, Urgent: 3, Important: 2, Normal: 1 };
      result.sort((a, b) => (weight[b.urgency] || 0) - (weight[a.urgency] || 0));
    } else if (sortBy === 'slots_needed') {
      result.sort((a, b) => {
        const remainingA = a.volunteersNeeded - a.volunteersJoined;
        const remainingB = b.volunteersNeeded - b.volunteersJoined;
        return remainingB - remainingA; // Most remaining slots first
      });
    }

    return result;
  };

  const processedOpps = getProcessedOpportunities();

  const renderCard = (opp, matchScore = null) => {
    const isSaved = savedIds.includes(opp._id);
    return (
      <div key={opp._id} className="card-global">
        <div>
          {/* Card Top Image & Heart */}
          <div className="relative w-full h-44 bg-slate-100 dark:bg-slate-900 overflow-hidden">
            <ImageWithFallback 
              src={opp.image} 
              alt={opp.title} 
              category={opp.category} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            
            {/* Category badge */}
            <span className="absolute top-4 left-4 text-[9px] font-extrabold text-slate-800 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {opp.category}
            </span>

            {/* Favorite button */}
            <button
              onClick={() => handleSaveToggle(opp._id)}
              className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-rose-500 rounded-full transition-colors shadow-sm"
              title={isSaved ? "Remove from wishlist" : "Bookmark opportunity"}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
            </button>
          </div>

          {/* Details */}
          <div className="p-5">
            <h3 className="font-bold text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {opp.title}
            </h3>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1.5 flex items-center gap-1.5">
              {opp.ngoId?.isVerified && (
                <ShieldCheck className="w-4 h-4 text-emerald-600 fill-current" title="Verified NGO" />
              )}
              <span className="truncate">{opp.ngoId?.name || 'NGO Partner'}</span>
            </p>

            {/* Address & Date Metadata */}
            <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{opp.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{new Date(opp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{opp.volunteersJoined} / {opp.volunteersNeeded} slots filled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer: Urgency Match / Action */}
        <div className="p-5 border-t border-slate-50 dark:border-slate-800/80 bg-slate-50/20 dark:bg-charcoal-dark/10 flex items-center justify-between">
          {matchScore !== null ? (
            <span className="text-[10px] font-extrabold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-lg uppercase">
              {matchScore}% Match
            </span>
          ) : (
            <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase ${getUrgencyStyles(opp.urgency)}`}>
              {opp.urgency}
            </span>
          )}
          <Link
            to={`/opportunities/${opp._id}`}
            className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-800 hover:bg-slate-800 text-xs font-extrabold rounded-xl transition-all shadow-sm"
          >
            View
          </Link>
        </div>
      </div>
    );
  };

  const filterFormContent = () => (
    <div className="space-y-5">
      {/* Search Input */}
      <div>
        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Search Keywords</label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Title or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-charcoal-dark/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Cause Select */}
      <div>
        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Cause Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-charcoal-dark/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100"
        >
          <option value="">All Causes</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* City Input */}
      <div>
        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Location (City)</label>
        <div className="relative">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="e.g. Mumbai"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-charcoal-dark/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Urgency select */}
      <div>
        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Urgency Level</label>
        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-charcoal-dark/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100"
        >
          <option value="">All Urgencies</option>
          <option value="Normal">Normal</option>
          <option value="Important">Important</option>
          <option value="Urgent">Urgent</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      {/* Specific Date Filter */}
      <div>
        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Activity Date</label>
        <div className="relative">
          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-charcoal-dark/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Availability Selector */}
      <div>
        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Day Schedule</label>
        <div className="flex gap-2">
          {['weekdays', 'weekends'].map((av) => (
            <button
              key={av}
              type="button"
              onClick={() => setAvailability(availability === av ? '' : av)}
              className={`flex-1 py-2 text-[10px] font-bold rounded-xl border capitalize transition-all ${
                availability === av
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-slate-50 dark:bg-charcoal-dark/45 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {av}
            </button>
          ))}
        </div>
      </div>

      {/* Sort selection */}
      <div>
        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Sort Results</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-charcoal-dark/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100"
        >
          <option value="newest">Date: Newest First</option>
          <option value="oldest">Date: Oldest First</option>
          <option value="urgency">Urgency: Critical First</option>
          <option value="slots_needed">Remaining Slots: High to Low</option>
        </select>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleResetFilters}
        className="w-full py-2.5 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset Filters</span>
      </button>

      <button
        onClick={fetchOpps}
        className="w-full btn-primary"
      >
        <Filter className="w-3.5 h-3.5" />
        <span>Refresh Query</span>
      </button>
    </div>
  );

  return (
    <div className="bg-slate-50 dark:bg-charcoal-dark min-h-screen py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <PageHeader 
          label="Discover" 
          heading="Find Opportunities That Matter" 
          description="Explore volunteer campaigns, donation drives, and activities near you."
        >
          {/* Mobile Filter Button toggle */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden w-full flex justify-center py-2.5 px-4 bg-white dark:bg-charcoal border border-slate-250 dark:border-slate-700 hover:border-slate-350 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl shadow-sm transition-all items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span>Filters & Sorting</span>
          </button>
        </PageHeader>

        {/* Scrollable Cause Categories navigation */}
        <div className="w-full max-w-full -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 overflow-hidden">
          <div className="flex overflow-x-auto gap-2 pb-3 scrollbar-none">
            <button
              onClick={() => setCategory('')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                category === ''
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white dark:bg-charcoal text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              💼 All Causes
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  category === cat
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white dark:bg-charcoal text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Smart Recommendations for Volunteer */}
        {user?.role === 'volunteer' && recommendations.length > 0 && !category && !search && !city && !urgency && !dateFilter && !availability && (
          <div className="mb-10">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-4 flex items-center gap-1.5">
              <Star className="w-4.5 h-4.5 fill-current text-amber-500" /> Recommended For You
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.slice(0, 3).map(rec => renderCard(rec.opportunity, rec.matchScore))}
            </div>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Left Filter Panel */}
          <div className="hidden lg:block lg:col-span-1 bg-white dark:bg-charcoal p-5 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm h-fit sticky top-20">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-50 dark:border-slate-800/50 pb-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm">Filters & Sorting</h3>
            </div>
            {filterFormContent()}
          </div>

          {/* Results Grid List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <SkeletonCard count={6} />
              </div>
            ) : processedOpps.length === 0 ? (
              <EmptyState 
                title="No opportunities found" 
                description="Try changing your filters or search keywords to explore other community options."
                actionText="Reset All Filters"
                onAction={handleResetFilters}
              />
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {processedOpps.map(opp => {
                  const rec = recommendations.find(r => r.opportunity?._id === opp._id || r.opportunity === opp._id);
                  return renderCard(opp, rec?.matchScore || null);
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Bottom Filter Drawer Drawer Overlay */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex items-end justify-center transition-all duration-300">
          <div className="bg-white dark:bg-charcoal w-full max-h-[85vh] rounded-t-3xl shadow-2xl p-6 overflow-y-auto relative border-t border-slate-100 dark:border-slate-800 flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span>Filters & Sorting</span>
              </h3>
              <button 
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 pb-4">
              {filterFormContent()}
            </div>
            
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="mt-2 w-full py-3.5 bg-primary text-white font-bold rounded-xl"
            >
              Apply and View ({processedOpps.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Opportunities;
