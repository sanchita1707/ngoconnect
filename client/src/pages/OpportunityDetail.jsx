import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import API from '../services/api';
import { 
  MapPin, Calendar, Clock, AlertTriangle, ShieldCheck, Heart, 
  Send, Check, UserCheck, Award, MessageSquare, ArrowLeft, BookOpen, Gift, CheckCircle
} from 'lucide-react';

const OpportunityDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [opp, setOpp] = useState(null);
  const [ngoProfile, setNgoProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [hasApplied, setHasApplied] = useState(false);

  // Load details
  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/opportunities/${id}`);
        if (res.data.success) {
          setOpp(res.data.opportunity);
          setNgoProfile(res.data.ngoProfile);
        }
      } catch (err) {
        console.error(err);
        showToast('Error', 'Opportunity detail could not be loaded.', 'error');
        navigate('/opportunities');
      } finally {
        setLoading(false);
      }
    };

    const checkAppliedStatus = async () => {
      if (user?.role !== 'volunteer') return;
      try {
        const res = await API.get('/applications/my');
        if (res.data.success) {
          const applied = res.data.applications.some(app => app.opportunityId._id === id);
          setHasApplied(applied);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadDetails();
    checkAppliedStatus();
  }, [id, user, showToast, navigate]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Login Required', 'Please sign in as volunteer to apply.', 'warning');
      navigate('/login');
      return;
    }

    if (user.role !== 'volunteer') {
      showToast('Invalid Role', 'Only volunteers can apply for opportunities.', 'warning');
      return;
    }

    try {
      const res = await API.post(`/applications/${id}`, { message: applyMessage });
      if (res.data.success) {
        setHasApplied(true);
        setIsApplying(false);
        showToast('Application Submitted', 'Your application is registered with the NGO!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Error', err.response?.data?.message || 'Application submission failed', 'error');
    }
  };

  const getDuration = (start, end) => {
    try {
      const s = start.split(':');
      const e = end.split(':');
      const diffMin = (parseInt(e[0], 10)*60 + parseInt(e[1] || 0, 10)) - (parseInt(s[0], 10)*60 + parseInt(s[1] || 0, 10));
      const hrs = Math.floor(diffMin / 60);
      const mins = diffMin % 60;
      if (isNaN(hrs)) return '4 hours';
      return `${hrs} ${hrs === 1 ? 'hour' : 'hours'}${mins > 0 ? ` ${mins} mins` : ''}`;
    } catch {
      return '4 hours';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary dark:bg-charcoal-dark">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!opp) return null;

  const durationStr = getDuration(opp.startTime, opp.endTime);
  const deadlineDate = new Date(new Date(opp.date).getTime() - 2 * 24 * 60 * 60 * 1000);
  const isExpired = new Date() > new Date(opp.date);

  return (
    <div className="bg-slate-50 dark:bg-charcoal-dark min-h-screen py-6 md:py-10 transition-colors duration-300 pb-24 md:pb-12">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Navigation Link */}
        <Link to="/opportunities" className="text-xs sm:text-sm text-slate-500 hover:text-primary font-bold mb-6 inline-flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </Link>

        {/* Header Hero banner */}
        <div className="bg-white dark:bg-charcoal rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm p-6 mb-8 flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-black tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase">
                {opp.category}
              </span>
              <span className="text-[10px] font-bold tracking-wider text-rose-700 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400 px-2.5 py-1 rounded-full uppercase">
                {opp.urgency} Urgency
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {opp.title}
            </h1>

            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <span className="text-slate-500">Organized by</span>
              <Link to={`/ngos/${opp.ngoId._id}`} className="text-primary hover:underline flex items-center gap-1">
                {opp.ngoId.name}
                {ngoProfile?.verificationStatus === 'Verified' && (
                  <ShieldCheck className="w-4 h-4 text-emerald-500 fill-current" title="Verified NGO" />
                )}
              </Link>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            {hasApplied ? (
              <div className="flex-1 sm:flex-initial bg-emerald-500 text-white font-bold text-xs rounded-xl h-11 px-5 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Applied</span>
              </div>
            ) : isExpired ? (
              <div className="flex-1 sm:flex-initial bg-slate-200 dark:bg-slate-800 text-slate-400 font-bold text-xs rounded-xl h-11 px-5 flex items-center justify-center">
                Opportunity Ended
              </div>
            ) : opp.status === 'Full' ? (
              <div className="flex-1 sm:flex-initial bg-slate-200 dark:bg-slate-800 text-slate-400 font-bold text-xs rounded-xl h-11 px-5 flex items-center justify-center">
                Fully Booked
              </div>
            ) : (
              <button
                onClick={() => setIsApplying(true)}
                className="flex-1 sm:flex-initial btn-primary"
              >
                <span>Apply for Slot</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cover image banner */}
            {opp.image && (
              <div className="w-full h-64 sm:h-80 rounded-[24px] overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 shadow-sm">
                <img 
                  src={opp.image} 
                  alt={opp.title} 
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

            {/* Description */}
            <div className="bg-white dark:bg-charcoal rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-lg font-bold border-b border-slate-50 dark:border-slate-800 pb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span>Description</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {opp.description}
              </p>
            </div>

            {/* Structured Responsibilities */}
            <div className="bg-white dark:bg-charcoal rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-lg font-bold border-b border-slate-50 dark:border-slate-800 pb-2 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                <span>Responsibilities</span>
              </h2>
              <ul className="space-y-2.5 text-slate-650 dark:text-slate-400 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">&#8226;</span>
                  <span>Arrive at least 15 minutes before the scheduled start time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">&#8226;</span>
                  <span>Coordinate with the NGO group representative on-site.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">&#8226;</span>
                  <span>Participate in introductory briefings and adhere to volunteer code of conduct.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">&#8226;</span>
                  <span>Dedicate efforts towards achieving the cause milestones of this activity.</span>
                </li>
              </ul>
            </div>

            {/* Benefits */}
            <div className="bg-white dark:bg-charcoal rounded-[24px] p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
              <h2 className="text-lg font-bold border-b border-slate-50 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                <span>Volunteer Benefits</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                <div className="p-3 bg-slate-50 dark:bg-charcoal-dark/50 rounded-xl flex items-center gap-3">
                  <Award className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="font-bold">Service Certificate</p>
                    <p className="text-[10px] text-slate-400">Downloadable verified completion letter</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-charcoal-dark/50 rounded-xl flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-bold">Service Hours Logged</p>
                    <p className="text-[10px] text-slate-400">Hours dynamically verified on profile</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-charcoal-dark/50 rounded-xl flex items-center gap-3">
                  <Star className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="font-bold">+150 XP Reward</p>
                    <p className="text-[10px] text-slate-400">Boost platform level and milestone metrics</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-charcoal-dark/50 rounded-xl flex items-center gap-3">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <div>
                    <p className="font-bold">Social Impact</p>
                    <p className="text-[10px] text-slate-400">Make a genuine change in people's lives</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar (Desktop sticky / Mobile content stacked) */}
          <div className="space-y-6 lg:sticky lg:top-20 h-fit">
            
            {/* Quick specifications */}
            <div className="bg-white dark:bg-charcoal rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base border-b border-slate-50 dark:border-slate-800/80 pb-2">
                Activity Details
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Location</p>
                    <p className="text-slate-500 text-xs mt-0.5">{opp.location}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{opp.city}, {opp.state}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Scheduled Date</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {new Date(opp.date).toLocaleDateString(undefined, { dateStyle: 'full' })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Time & Duration</p>
                    <p className="text-slate-500 text-xs mt-0.5">{opp.startTime} - {opp.endTime}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Total Duration: {durationStr}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Application Deadline</p>
                    <p className="text-rose-500 text-xs font-semibold mt-0.5">
                      {deadlineDate.toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirement Skills block */}
              {opp.requiredSkills && opp.requiredSkills.length > 0 && (
                <div className="pt-2 border-t border-slate-50 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Desired Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {opp.requiredSkills.map(sk => (
                      <span key={sk} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2.5 py-1 rounded-lg">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Slots progress bar */}
              <div className="bg-slate-50 dark:bg-charcoal-dark/50 p-4 rounded-2xl space-y-2 mt-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">Volunteer Slots Filled</span>
                  <span>{opp.volunteersJoined} / {opp.volunteersNeeded}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-850 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, Math.round((opp.volunteersJoined / opp.volunteersNeeded) * 100))}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* NGO info details */}
            {ngoProfile && (
              <div className="bg-white dark:bg-charcoal rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-bold uppercase text-lg overflow-hidden flex-shrink-0">
                    {opp.ngoId.profileImage ? (
                      <img src={opp.ngoId.profileImage} alt={opp.ngoId.name} className="w-full h-full object-cover" />
                    ) : (
                      opp.ngoId.name.substring(0, 2)
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight">{opp.ngoId.name}</h4>
                    <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md mt-1 inline-block uppercase">
                      Trust score {ngoProfile.trustScore}/100
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {ngoProfile.description}
                </p>
                <Link to={`/ngos/${opp.ngoId._id}`} className="text-xs text-primary font-bold hover:underline block text-center pt-2">
                  View NGO Profile
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Floating Sticky Mobile CTA panel */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-charcoal/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-850 p-4 flex items-center justify-between gap-4 md:hidden">
        <div className="text-left">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Remaining Slots</p>
          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
            {opp.volunteersNeeded - opp.volunteersJoined} of {opp.volunteersNeeded} left
          </p>
        </div>

        {hasApplied ? (
          <div className="bg-emerald-500 text-white font-bold text-xs rounded-xl h-11 px-6 flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>Applied</span>
          </div>
        ) : isExpired ? (
          <div className="text-slate-400 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl h-11 px-6 flex items-center justify-center">
            Opportunity Expired
          </div>
        ) : opp.status === 'Full' ? (
          <div className="text-slate-400 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl h-11 px-6 flex items-center justify-center">
            Slots Full
          </div>
        ) : (
          <button
            onClick={() => setIsApplying(true)}
            className="btn-primary"
          >
            <span>Apply Now</span>
          </button>
        )}
      </div>

      {/* Applying Modal Form Popup */}
      {isApplying && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-charcoal max-w-md w-full p-6 rounded-[24px] shadow-2xl relative border border-slate-100 dark:border-slate-800 flex flex-col">
            
            <h3 className="text-lg font-bold mb-1.5 text-slate-850 dark:text-white">Apply for volunteering</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Introduce yourself, write down why you'd like to participate, and any relevant experience or skills.
            </p>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Message / Cover Letter
                </label>
                <textarea
                  required
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  rows={4}
                  className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-slate-200"
                  placeholder="I am passionate about this cause and have relevant background in..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityDetail;
