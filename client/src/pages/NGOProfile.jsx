import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Save, ShieldCheck, Landmark, MapPin, Clipboard, Settings } from 'lucide-react';

const NGOProfile = () => {
  const { user, profile, update } = useAuth();
  const { showToast } = useNotification();

  const [orgName, setOrgName] = useState(profile?.organizationName || user?.name || '');
  const [description, setDescription] = useState(profile?.description || '');
  const [registrationNumber, setRegistrationNumber] = useState(profile?.registrationNumber || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [phone, setPhone] = useState(profile?.phone || user?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [city, setCity] = useState(profile?.city || '');
  const [state, setState] = useState(profile?.state || '');
  const [causes, setCauses] = useState(profile?.causes?.join(', ') || '');
  const [foundedYear, setFoundedYear] = useState(profile?.foundedYear || new Date().getFullYear());

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const causesArray = causes.split(',').map(c => c.trim()).filter(c => c.length > 0);

    const result = await update({
      name: orgName, // Sync name back to user
      organizationName: orgName,
      description,
      registrationNumber,
      website,
      phone,
      address,
      city,
      state,
      causes: causesArray,
      foundedYear: Number(foundedYear)
    });

    setLoading(false);

    if (result.success) {
      showToast('Profile Updated', 'Organization details saved successfully.', 'success');
    } else {
      showToast('Update Failed', result.message, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Organization Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Configure your public organizational profile details.</p>
        </div>

        {profile?.verificationStatus === 'Verified' ? (
          <span className="px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start">
            <ShieldCheck className="w-4 h-4 fill-current" /> Verified Organization
          </span>
        ) : (
          <span className="px-4 py-2 bg-amber-500/10 text-amber-600 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start">
            <Settings className="w-4 h-4" /> Verification Pending
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-charcoal p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        
        {/* Core details */}
        <div className="border-b border-slate-50 dark:border-slate-800 pb-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
            <Landmark className="w-4 h-4" /> Legal Information
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Organization Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Govt registration Number</label>
              <input
                type="text"
                required
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bio description */}
        <div className="border-b border-slate-50 dark:border-slate-800 pb-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
            <Clipboard className="w-4 h-4" /> Mission Description
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Biography Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
              placeholder="Describe your organization's mission..."
            />
          </div>
        </div>

        {/* Contacts */}
        <div className="border-b border-slate-50 dark:border-slate-800 pb-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
            <Settings className="w-4 h-4" /> Contacts & Links
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                placeholder="https://www.yourngo.org"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Hotline phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Location coordinates */}
        <div className="border-b border-slate-50 dark:border-slate-800 pb-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> Address Location
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* Core causes and years */}
        <div className="pb-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-455 uppercase tracking-widest">Causes & Founded year</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Core Causes (comma separated)</label>
              <input
                type="text"
                value={causes}
                onChange={(e) => setCauses(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm"
                placeholder="Education, Healthcare, Food Support..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Founded Year</label>
              <input
                type="number"
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm"
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
          <span>{loading ? 'Saving Changes...' : 'Save Organization Profile'}</span>
        </button>

      </form>
    </div>
  );
};

export default NGOProfile;
