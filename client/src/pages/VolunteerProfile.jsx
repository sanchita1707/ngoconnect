import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Save, User, MapPin, Clipboard, Settings } from 'lucide-react';

const VolunteerProfile = () => {
  const { user, profile, update } = useAuth();
  const { showToast } = useNotification();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [experience, setExperience] = useState(profile?.experience || '');
  const [city, setCity] = useState(profile?.city || '');
  const [state, setState] = useState(profile?.state || '');
  const [skills, setSkills] = useState(profile?.skills?.join(', ') || '');
  const [causes, setCauses] = useState(profile?.preferredCauses?.join(', ') || '');
  const [availability, setAvailability] = useState({
    weekdays: profile?.availability?.weekdays || false,
    weekends: profile?.availability?.weekends || false
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const causesArray = causes.split(',').map(c => c.trim()).filter(c => c.length > 0);

    const result = await update({
      name,
      phone,
      bio,
      experience,
      city,
      state,
      skills: skillsArray,
      preferredCauses: causesArray,
      availability
    });

    setLoading(false);

    if (result.success) {
      showToast('Profile Updated', 'Your profile details have been saved.', 'success');
    } else {
      showToast('Update Failed', result.message, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Edit Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your personal credentials, biography, and skill keywords.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-charcoal p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        
        {/* Core Info */}
        <div className="border-b border-slate-50 dark:border-slate-800 pb-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <User className="w-4 h-4" /> Personal Information
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bio & Experience */}
        <div className="border-b border-slate-50 dark:border-slate-800 pb-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Clipboard className="w-4 h-4" /> Bio & Experience
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Biography</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                placeholder="Tell NGOs who you are..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Prior Volunteering Experience</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm"
                placeholder="e.g. none, 2 years at environmental clubs..."
              />
            </div>
          </div>
        </div>

        {/* Location & availability */}
        <div className="border-b border-slate-50 dark:border-slate-800 pb-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> Location & Availability
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-400 mb-2">Availability Choices</label>
            <div className="flex gap-4">
              <label className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2 cursor-pointer text-xs font-bold bg-slate-50 dark:bg-charcoal-dark/50">
                <input
                  type="checkbox"
                  checked={availability.weekdays}
                  onChange={(e) => setAvailability(prev => ({ ...prev, weekdays: e.target.checked }))}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Weekdays</span>
              </label>
              <label className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2 cursor-pointer text-xs font-bold bg-slate-50 dark:bg-charcoal-dark/50">
                <input
                  type="checkbox"
                  checked={availability.weekends}
                  onChange={(e) => setAvailability(prev => ({ ...prev, weekends: e.target.checked }))}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Weekends</span>
              </label>
            </div>
          </div>
        </div>

        {/* Skills & Causes */}
        <div className="pb-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Settings className="w-4 h-4" /> Skills & Causes keywords
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Skills (comma separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm"
                placeholder="Teaching, Event Planning, Cooking..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Preferred Causes (comma separated)</label>
              <input
                type="text"
                value={causes}
                onChange={(e) => setCauses(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm"
                placeholder="Education, Healthcare, Food..."
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all ml-auto"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
        </button>

      </form>
    </div>
  );
};

export default VolunteerProfile;
