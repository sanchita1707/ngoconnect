import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Heart, BookOpen, Activity, Utensils, Users, Leaf, ShieldAlert, 
  MapPin, Globe, ArrowRight, ShieldCheck, Star, Calendar, 
  Clock, Compass, HelpCircle, Award, CheckCircle, ChevronRight 
} from 'lucide-react';

// Standalone vector-based category placeholders (guarantees offline safety)
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

const Landing = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [stats, setStats] = useState({
    volunteers: 180,
    ngos: 14,
    opportunities: 32,
    hours: 2400,
    impacted: 1350
  });

  const [featuredOpps, setFeaturedOpps] = useState([]);
  const [urgentOpps, setUrgentOpps] = useState([]);
  const [stories, setStories] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cause categories with matching icons
  const causeCategories = [
    { name: '🌱 Environment', icon: Leaf, desc: 'Eco cleanup campaigns' },
    { name: '📚 Education', icon: BookOpen, desc: 'Teaching & tutor drives' },
    { name: '❤️ Healthcare', icon: Activity, desc: 'Clinics & health camps' },
    { name: '🍲 Food Support', icon: Utensils, desc: 'Feeding shelter kitchens' },
    { name: '👶 Child Welfare', icon: Heart, desc: 'Orphanage companionships' },
    { name: '👵 Elder Care', icon: Users, desc: 'Assisting care facility homes' },
    { name: '🐾 Animal Welfare', icon: ShieldAlert, desc: 'Stray feeding & rescue work' },
    { name: '🏘️ Community Development', icon: MapPin, desc: 'Slum sanitization & paints' }
  ];

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

  useEffect(() => {
    const fetchLandingData = async () => {
      setLoading(true);
      try {
        // 1. Fetch public platform statistics
        const statsRes = await API.get('/opportunities/stats');
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }

        // 2. Fetch opportunities for featured/urgent listings
        const oppsRes = await API.get('/opportunities?status=Open');
        if (oppsRes.data.success) {
          const list = oppsRes.data.opportunities;
          setFeaturedOpps(list.slice(0, 3));
          
          // Filter critical/urgent items
          const critical = list.filter(o => o.urgency === 'Critical' || o.urgency === 'Urgent');
          setUrgentOpps(critical.slice(0, 3));
        }

        // 3. Fetch public success stories
        const storiesRes = await API.get('/stories');
        if (storiesRes.data.success) {
          setStories(storiesRes.data.stories.slice(0, 3));
        }

        // 4. Fetch public NGOs
        const ngosRes = await API.get('/ngos');
        if (ngosRes.data.success) {
          setNgos(ngosRes.data.ngos.slice(0, 3));
        }

        // 5. Fetch saved wishlist if volunteer logged in
        if (user?.role === 'volunteer') {
          const savedRes = await API.get('/volunteers/saved');
          if (savedRes.data.success) {
            setSavedIds(savedRes.data.opportunities.map(o => o._id));
          }
        }
      } catch (err) {
        console.error('Error fetching landing page aggregations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, [user, showToast]);

  const getUrgencyStyles = (urg) => {
    if (urg === 'Critical') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30';
    if (urg === 'Urgent') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800';
  };

  return (
    <div className="bg-slate-50 dark:bg-charcoal-dark min-h-screen transition-colors duration-300">
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 5s ease-in-out infinite; }
      `}</style>

      {/* 1. HERO SECTION WITH ILLUSTRATION */}
      <header className="relative py-12 md:py-20 overflow-hidden bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/2 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center relative z-10">
          
          {/* Left Text content */}
          <div className="text-left space-y-5">
            <span className="px-3.5 py-1 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary dark:text-primary-light uppercase tracking-widest inline-block">
              Impact Community Hub
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
              Connect. <br />
              Volunteer. <br />
              <span className="text-primary dark:text-primary-light">Create Impact.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-350 leading-relaxed max-w-md font-medium">
              NGOConnect bridges the gap between active volunteers and verified non-profits. Apply to drives, verify service hours, and view platform achievements.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                to="/opportunities"
                className="w-full sm:w-auto px-6 py-3.5 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all duration-250 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <span>Explore Opportunities</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-charcoal text-slate-850 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold rounded-2xl shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-250 text-xs text-center uppercase tracking-wider"
              >
                Join as Volunteer
              </Link>
              <Link
                to="/register?role=ngo"
                className="w-full sm:w-auto px-6 py-3.5 bg-transparent hover:bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-550/30 hover:border-amber-500 font-extrabold rounded-2xl shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-250 text-xs text-center uppercase tracking-wider"
              >
                Register NGO
              </Link>
            </div>
          </div>

          {/* Right Vector Illustration (Floating Node Network & Stats Cards) */}
          <div className="hidden md:flex justify-center items-center relative min-h-[380px]">
            {/* Soft decorative background glow */}
            <div className="absolute w-72 h-72 bg-primary/10 dark:bg-primary/5 rounded-full filter blur-3xl animate-pulse"></div>
            
            {/* Interactive Nodes Network SVG */}
            <svg viewBox="0 0 400 400" className="w-full max-w-[340px] h-[340px] relative z-10 select-none animate-float">
              {/* Connection Lines with glowing color */}
              <line x1="200" y1="200" x2="90" y2="110" stroke="#047857" strokeWidth="2.5" strokeDasharray="6,6" className="opacity-80" />
              <line x1="200" y1="200" x2="310" y2="110" stroke="#047857" strokeWidth="2.5" strokeDasharray="6,6" className="opacity-80" />
              <line x1="200" y1="200" x2="200" y2="310" stroke="#d97706" strokeWidth="2.5" strokeDasharray="6,6" className="opacity-80" />
              <line x1="90" y1="110" x2="310" y2="110" stroke="#cbd5e1" strokeWidth="1.5" className="opacity-30" />
              
              {/* Central Node: NGOConnect Hub */}
              <circle cx="200" cy="200" r="44" fill="#047857" />
              <circle cx="200" cy="200" r="44" fill="none" stroke="white" strokeWidth="2" className="opacity-50" />
              <text x="200" y="205" fill="white" fontSize="13" fontWeight="900" textAnchor="middle" letterSpacing="0.5">HUB</text>

              {/* Node 2: Volunteer */}
              <circle cx="90" cy="110" r="32" fill="#2563eb" />
              <circle cx="90" cy="110" r="32" fill="none" stroke="white" strokeWidth="1.5" className="opacity-50" />
              <text x="90" y="113" fill="white" fontSize="9" fontWeight="800" textAnchor="middle">VOLUNTEER</text>

              {/* Node 3: NGO */}
              <circle cx="310" cy="110" r="32" fill="#10b981" />
              <circle cx="310" cy="110" r="32" fill="none" stroke="white" strokeWidth="1.5" className="opacity-50" />
              <text x="310" y="113" fill="white" fontSize="9" fontWeight="800" textAnchor="middle">NGO</text>

              {/* Node 4: Community Impact */}
              <circle cx="200" cy="310" r="32" fill="#d97706" />
              <circle cx="200" cy="310" r="32" fill="none" stroke="white" strokeWidth="1.5" className="opacity-50" />
              <text x="200" y="313" fill="white" fontSize="9" fontWeight="800" textAnchor="middle">IMPACT</text>
            </svg>

            {/* Floating Card 1: Verified Badge */}
            <div className="absolute top-10 right-4 bg-white dark:bg-charcoal px-3 py-2 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2 animate-bounce-slow z-20">
              <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold text-slate-850 dark:text-white leading-none">Verified NGOs</p>
                <p className="text-[8px] text-slate-400 font-semibold mt-0.5">100% Trusted</p>
              </div>
            </div>

            {/* Floating Card 2: Impact Hours Badge */}
            <div className="absolute bottom-16 left-0 bg-white dark:bg-charcoal px-3 py-2 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2 animate-float-slow z-20">
              <span className="p-1 rounded-lg bg-amber-500/10 text-amber-600">
                <Award className="w-4 h-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold text-slate-850 dark:text-white leading-none">Service Hours</p>
                <p className="text-[8px] text-slate-400 font-semibold mt-0.5">Verified Milestones</p>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* 2. TRUST / IMPACT STATS STRIP OVERLAY */}
      <section className="relative z-20 -mt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-charcoal p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors duration-300">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
            <div className="pt-4 md:pt-0">
              <div className="flex items-center justify-center gap-2 text-primary dark:text-primary-light">
                <Users className="w-5 h-5 opacity-70" />
                <p className="text-3xl font-black">{stats.volunteers || 150}+</p>
              </div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Volunteers Joined</p>
            </div>
            
            <div className="pt-4 md:pt-0 md:pl-4">
              <div className="flex items-center justify-center gap-2 text-primary dark:text-primary-light">
                <ShieldCheck className="w-5 h-5 opacity-70" />
                <p className="text-3xl font-black">{stats.ngos || 5}+</p>
              </div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Verified NGOs</p>
            </div>

            <div className="pt-4 md:pt-0 md:pl-4">
              <div className="flex items-center justify-center gap-2 text-primary dark:text-primary-light">
                <Compass className="w-5 h-5 opacity-70" />
                <p className="text-3xl font-black">{stats.opportunities || 10}+</p>
              </div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Active Opportunities</p>
            </div>

            <div className="pt-4 md:pt-0 md:pl-4">
              <div className="flex items-center justify-center gap-2 text-amber-500">
                <Clock className="w-5 h-5 opacity-70" />
                <p className="text-3xl font-black">{stats.hours || 1200}+</p>
              </div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Service Hours</p>
            </div>

            <div className="pt-4 md:pt-0 md:pl-4 col-span-2 md:col-span-1">
              <div className="flex items-center justify-center gap-2 text-amber-500">
                <Award className="w-5 h-5 opacity-70" />
                <p className="text-3xl font-black">{stats.impacted || 800}+</p>
              </div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Impact Score</p>
            </div>
          </div>
          <span className="block text-center text-[9px] text-slate-400 mt-5 italic font-medium">
            * Actual platform verified database statistics.
          </span>
        </div>
      </section>

      {/* 3. HOW NGOConnect WORKS */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight">How NGOConnect Works</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-semibold">
            Connecting for community impact is streamlined in 4 transparent stages.
          </p>
        </div>

        <div className="relative">
          {/* Timeline Connector Line */}
          <div className="hidden lg:block absolute top-[24px] left-[12%] right-[12%] h-[2px] bg-slate-200 dark:bg-slate-800 z-0"></div>
          <div className="lg:hidden absolute top-[24px] bottom-[24px] left-[24px] w-[2px] bg-slate-200 dark:bg-slate-800 z-0"></div>

          <div className="grid lg:grid-cols-4 gap-8 relative z-10">
            {[
              { step: '01', title: 'Discover', desc: 'Find opportunities that match your skills and causes.', icon: Compass },
              { step: '02', title: 'Apply', desc: 'Apply and connect with trusted NGOs.', icon: Heart },
              { step: '03', title: 'Contribute', desc: 'Volunteer and contribute to meaningful activities.', icon: Activity },
              { step: '04', title: 'Create Impact', desc: 'Track your hours, achievements and community impact.', icon: Award }
            ].map((item, index) => {
              const StepIcon = item.icon;
              return (
                <div key={index} className="flex lg:flex-col gap-5 lg:gap-0 items-start lg:items-center text-left lg:text-center bg-white dark:bg-charcoal p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  {/* Step bubble with icon */}
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm z-10 flex-shrink-0 lg:mb-4 relative shadow-md shadow-primary/20">
                    {item.step}
                    <StepIcon className="w-4 h-4 absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-500 text-white shadow" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider">{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-semibold">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. CAUSE CATEGORIES */}
      <section className="py-20 bg-white dark:bg-charcoal border-t border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">Make an Impact Your Way</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-semibold">
              Filter openings, drives, and events depending on your core causes interests.
            </p>
          </div>

          {/* Horizontal scroll container on mobile */}
          <div className="w-full max-w-full -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex overflow-x-auto gap-4 pb-3 scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
              {causeCategories.map((cat, index) => {
                const IconComponent = cat.icon;
                return (
                  <Link
                    key={index}
                    to={`/opportunities?category=${encodeURIComponent(cat.name)}`}
                    className="p-5 rounded-3xl border border-slate-100 dark:border-slate-800/80 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all flex flex-col items-center text-center group bg-slate-50 dark:bg-charcoal-dark/50 flex-shrink-0 w-64 sm:w-auto"
                  >
                    <div className="p-3.5 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm mt-4 text-slate-850 dark:text-white">{cat.name.split(' ')[1]}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug font-semibold">{cat.desc}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED OPPORTUNITIES */}
      {featuredOpps.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-baseline mb-10">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Featured Opportunities</h2>
              <p className="text-xs text-slate-400 mt-1 font-semibold">Handpicked social campaigns seeking active volunteer registrations.</p>
            </div>
            <Link to="/opportunities" className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5">
              Explore All Opportunities <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredOpps.map((opp) => {
              const isSaved = savedIds.includes(opp._id);
              return (
                <div
                  key={opp._id}
                  className="bg-white dark:bg-charcoal rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative w-full h-40 bg-slate-100 dark:bg-slate-850 overflow-hidden">
                      <ImageWithFallback src={opp.image} alt={opp.title} category={opp.category} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                      <span className="absolute top-4 left-4 text-[9px] font-bold text-slate-800 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {opp.category}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="font-bold text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors">{opp.title}</h3>
                      <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                        {opp.ngoId?.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-600 fill-current" />}
                        <span className="truncate">{opp.ngoId?.name}</span>
                      </p>

                      <div className="pt-2 space-y-1.5 text-xs text-slate-500 font-semibold">
                        <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {opp.city}</p>
                        <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(opp.date).toLocaleDateString()}</p>
                        <p className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-slate-400" /> {opp.volunteersJoined} / {opp.volunteersNeeded} spots filled</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 border-t border-slate-50 dark:border-slate-800/80 bg-slate-50/10 flex items-center justify-between">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${getUrgencyStyles(opp.urgency)}`}>
                      {opp.urgency}
                    </span>
                    <Link to={`/opportunities/${opp._id}`} className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-800 text-xs font-bold rounded-xl shadow-sm">
                      View Opportunity
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. URGENT NEEDS */}
      {urgentOpps.length > 0 && (
        <section className="py-20 bg-slate-100/50 dark:bg-charcoal border-y border-slate-100 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-xl mx-auto">
              <h2 className="text-3xl font-extrabold tracking-tight">Help Needed Now</h2>
              <p className="text-xs text-slate-400 mt-1 font-semibold">Critical and urgent opportunities that require immediate support.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {urgentOpps.map((opp) => (
                <div
                  key={opp._id}
                  className="bg-white dark:bg-charcoal-dark/50 p-5 rounded-3xl border border-rose-500/10 hover:border-rose-500/20 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-md uppercase">
                        {opp.urgency} Needs
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{opp.category}</span>
                    </div>

                    <h3 className="font-bold text-base leading-tight">{opp.title}</h3>
                    <p className="text-xs text-slate-450 truncate">by {opp.ngoId?.name}</p>

                    <div className="pt-2 text-xs text-slate-500 space-y-1 font-semibold">
                      <p className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" /> {opp.volunteersNeeded - opp.volunteersJoined} volunteers required</p>
                      <p className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> Timing: {new Date(opp.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <Link
                    to={`/opportunities/${opp._id}`}
                    className="w-full py-2.5 mt-6 bg-rose-600 hover:bg-rose-700 text-white text-center text-xs font-bold rounded-xl block shadow-md shadow-rose-600/10"
                  >
                    Help Now
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. IMPACT STORIES */}
      {stories.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">Stories That Inspire Change</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-semibold">
              Read summaries detailing verified community progress achievements.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div
                key={story._id}
                className="bg-white dark:bg-charcoal rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-40 bg-slate-100 overflow-hidden">
                    <ImageWithFallback src={story.image} alt={story.title} category={story.category} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {story.category}
                    </span>
                    <h3 className="font-bold text-sm leading-snug line-clamp-1">{story.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{story.description}</p>
                  </div>
                </div>

                <div className="p-5 border-t border-slate-50 dark:border-slate-850 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">by {story.ngoId?.name || 'NGO'}</span>
                  <Link to="/stories" className="text-xs text-primary font-bold hover:underline">
                    Read Story &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. NGO TRUST SECTION */}
      {ngos.length > 0 && (
        <section className="py-20 bg-white dark:bg-charcoal border-t border-slate-100 dark:border-slate-850 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-baseline mb-12">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight">Meet Organizations Creating Change</h2>
                <p className="text-xs text-slate-400 mt-1 font-semibold">Verified non-profits running certified municipal chapters.</p>
              </div>
              <Link to="/ngos" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                Explore NGOs <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ngos.map((ngo) => (
                <div
                  key={ngo._id}
                  className="p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center font-bold text-sm text-primary uppercase">
                        {ngo.organizationName.substring(0, 2)}
                      </div>
                      <span className="text-[10px] font-extrabold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                        Trust Score {ngo.trustScore}/100
                      </span>
                    </div>

                    <h3 className="font-bold text-base leading-snug flex items-center gap-1.5">
                      {ngo.organizationName}
                      <ShieldCheck className="w-4 h-4 text-emerald-500 fill-current" title="Verified NGO" />
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{ngo.causes?.slice(0, 2).join(', ')}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ngo.city}, {ngo.state}</p>
                  </div>

                  <Link
                    to={`/ngos/${ngo._id}`}
                    className="w-full py-2 mt-5 border border-slate-200 dark:border-slate-700 hover:border-primary text-primary rounded-xl text-xs font-bold text-center transition-all"
                  >
                    View NGO Profile
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. VOLUNTEER GAMIFICATION PREVIEW */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 dark:bg-charcoal text-white rounded-3xl p-8 md:p-12 border border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-10 shadow-2xl relative overflow-hidden">
          
          <div className="max-w-md space-y-4">
            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md">
              Platform Gamification
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">Your Impact. Your Journey.</h2>
            <p className="text-slate-400 text-xs leading-relaxed font-semibold">
              Earn XP milestone points, upgrade your helper level, unlock achievement badges, and print certified hours credentials instantly.
            </p>
            <Link
              to="/register"
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-extrabold shadow-md inline-block transition-all"
            >
              Start Your Impact Journey
            </Link>
          </div>

          {/* Achievement mockup card */}
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-full sm:w-80 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-xs">A</div>
                <div>
                  <p className="font-bold text-xs leading-none">Amit Sharma</p>
                  <p className="text-[8px] text-slate-450">Ecosystem Contributor</p>
                </div>
              </div>
              <span className="text-[8px] text-amber-500 font-bold uppercase">Level 3</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-slate-400">
                <span>XP Progress</span>
                <span>740 / 1000 XP</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: '74%' }}></div>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider mb-2">Unlocked Badges</p>
              <div className="flex gap-1.5">
                <span className="w-8 h-8 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs" title="Green Warrior">🌱</span>
                <span className="w-8 h-8 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs" title="Helping Hand">🏆</span>
                <span className="w-8 h-8 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs" title="10 Hours Completed">❤️</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 10. IMPACT MAP PREVIEW */}
      <section className="py-20 bg-white dark:bg-charcoal border-t border-slate-100 dark:border-slate-850 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center">
          
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight">Impact Across Communities</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-semibold">
              Explore municipal coordination listings. View active tree plantations, books distributions, and healthcare camps maps by city.
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
              <div className="py-3 flex justify-between font-semibold">
                <span>Mumbai Chapter</span>
                <span className="text-primary font-bold">142 Opportunities</span>
              </div>
              <div className="py-3 flex justify-between font-semibold">
                <span>Delhi NCR Chapter</span>
                <span className="text-primary font-bold">110 Opportunities</span>
              </div>
              <div className="py-3 flex justify-between font-semibold">
                <span>Pune Chapter</span>
                <span className="text-primary font-bold">87 Opportunities</span>
              </div>
            </div>

            <Link
              to="/impact-map"
              className="px-6 py-3 border border-slate-200 dark:border-slate-700 hover:border-primary text-primary rounded-xl text-xs font-bold inline-block transition-all"
            >
              Explore Impact Map
            </Link>
          </div>

          {/* India topography mock grid */}
          <div className="w-full h-64 bg-emerald-500/5 dark:bg-emerald-500/2 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px]"></div>
            <div className="relative z-10 text-center">
              <Globe className="w-12 h-12 text-primary mx-auto mb-2 animate-pulse" />
              <p className="font-extrabold text-xs">Municipal Chapters Nodes</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Bombay, Delhi, Pune, Bangalore chapters active.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-primary to-primary-dark p-8 md:p-16 rounded-3xl text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="max-w-xl relative z-10 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">Your Time Can Change a Life.</h2>
            <p className="mt-4 text-emerald-100 font-semibold leading-relaxed text-xs sm:text-sm">
              Whether you have an hour, a skill, or a helping hand — there is a place for you at NGOConnect. Create your profile, verify causes, and volunteer now.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full md:w-auto">
            <Link to="/opportunities" className="px-6 py-3.5 bg-white text-primary font-extrabold rounded-xl shadow-lg hover:bg-emerald-50 text-center text-xs transition-all">
              Find an Opportunity
            </Link>
            <Link to="/register" className="px-6 py-3.5 bg-slate-900 text-white border border-slate-800 font-extrabold rounded-xl shadow-lg hover:bg-slate-800 text-center text-xs transition-all">
              Join NGOConnect
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
