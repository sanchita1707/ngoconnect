import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { User, Landmark, Mail, Lock, Phone, MapPin, CheckCircle, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register, onboard, user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'ngo' ? 'ngo' : 'volunteer';

  // State: Registration Flow vs Onboarding Flow
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [registeredRole, setRegisteredRole] = useState(initialRole);

  // 1. Registration States
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    role: initialRole
  });

  // 2. Volunteer Onboarding States
  const [volStep, setVolStep] = useState(1);
  const [volData, setVolData] = useState({
    bio: '',
    experience: '',
    skills: [],
    interests: [],
    preferredCauses: [],
    city: '',
    state: '',
    country: 'India',
    availability: { weekdays: false, weekends: false }
  });

  // 3. NGO Onboarding States
  const [ngoStep, setNgoStep] = useState(1);
  const [ngoData, setNgoData] = useState({
    organizationName: '',
    description: '',
    registrationNumber: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    causes: [],
    foundedYear: new Date().getFullYear()
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Skill items list
  const skillOptions = ['Teaching', 'Writing', 'Web Design', 'Cooking', 'Driving', 'Event Planning', 'Gardening', 'First Aid', 'Patient Care', 'Photography', 'Translation', 'Content Creation'];
  
  // Cause options
  const causeOptions = ['🌱 Environment', '📚 Education', '❤️ Healthcare', '🍲 Food Support', '👶 Child Welfare', '👵 Elder Care', '🐾 Animal Welfare', '🏘️ Community Development', '🩸 Blood Donation', '🌳 Tree Plantation'];

  // Handle standard registration submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regData.name || !regData.email || !regData.password) {
      showToast('Validation Error', 'Please fill in required fields.', 'warning');
      return;
    }

    setLoading(true);
    const result = await register(regData);
    setLoading(false);

    if (result.success) {
      showToast('Account Created', 'Registration successful! Let\'s complete your profile.', 'success');
      setRegisteredRole(regData.role);
      setIsOnboarding(true);
      // Initialize NGO organizationName with registered name
      if (regData.role === 'ngo') {
        setNgoData(prev => ({ ...prev, organizationName: regData.name, phone: regData.phone, city: regData.location }));
      } else {
        setVolData(prev => ({ ...prev, city: regData.location }));
      }
    } else {
      showToast('Registration Error', result.message, 'error');
    }
  };

  // Toggle skills selection
  const handleSkillToggle = (skill) => {
    setVolData(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  // Toggle causes selection
  const handleCauseToggle = (cause) => {
    if (registeredRole === 'volunteer') {
      setVolData(prev => {
        const preferredCauses = prev.preferredCauses.includes(cause)
          ? prev.preferredCauses.filter(c => c !== cause)
          : [...prev.preferredCauses, cause];
        return { ...prev, preferredCauses };
      });
    } else {
      setNgoData(prev => {
        const causes = prev.causes.includes(cause)
          ? prev.causes.filter(c => c !== cause)
          : [...prev.causes, cause];
        return { ...prev, causes };
      });
    }
  };

  // Handle volunteer onboarding submit
  const handleVolunteerOnboard = async () => {
    setLoading(true);
    const result = await onboard(volData);
    setLoading(false);

    if (result.success) {
      showToast('Onboarding Completed', 'Welcome to the platform!', 'success');
      navigate('/volunteer/dashboard');
    } else {
      showToast('Onboarding Error', result.message, 'error');
    }
  };

  // Handle NGO onboarding submit
  const handleNGOOnboard = async () => {
    setLoading(true);
    const result = await onboard(ngoData);
    setLoading(false);

    if (result.success) {
      showToast('Onboarding Completed', 'Your organization profile is now active!', 'success');
      navigate('/ngo/dashboard');
    } else {
      showToast('Onboarding Error', result.message, 'error');
    }
  };

  // --- RENDERS ---

  // 1. Render Registration Form
  const renderRegisterForm = () => (
    <div className="max-w-md w-full space-y-8 bg-white dark:bg-charcoal p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xl">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight">Create Account</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark hover:underline">
            Sign In here
          </Link>
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex gap-4 p-1 bg-slate-100 dark:bg-charcoal-dark/50 rounded-2xl">
        <button
          type="button"
          onClick={() => setRegData(prev => ({ ...prev, role: 'volunteer' }))}
          className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all ${
            regData.role === 'volunteer'
              ? 'bg-white dark:bg-charcoal text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <User className="w-4 h-4 text-primary" />
          <span>Volunteer</span>
        </button>
        <button
          type="button"
          onClick={() => setRegData(prev => ({ ...prev, role: 'ngo' }))}
          className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all ${
            regData.role === 'ngo'
              ? 'bg-white dark:bg-charcoal text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Landmark className="w-4 h-4 text-amber-500" />
          <span>NGO</span>
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleRegisterSubmit}>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {regData.role === 'ngo' ? 'Organization Name' : 'Full Name'}
          </label>
          <input
            type="text"
            required
            value={regData.name}
            onChange={(e) => setRegData(prev => ({ ...prev, name: e.target.value }))}
            className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={regData.role === 'ngo' ? 'Hope Foundation' : 'John Doe'}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Mail className="w-5 h-5" />
            </span>
            <input
              type="email"
              required
              value={regData.email}
              onChange={(e) => setRegData(prev => ({ ...prev, email: e.target.value }))}
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="contact@domain.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Lock className="w-4.5 h-4.5" />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={regData.password}
              onChange={(e) => setRegData(prev => ({ ...prev, password: e.target.value }))}
              className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-slate-800 dark:text-slate-200"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={regData.phone}
                onChange={(e) => setRegData(prev => ({ ...prev, phone: e.target.value }))}
                className="block w-full pl-9 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="9876..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">City Location</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={regData.location}
                onChange={(e) => setRegData(prev => ({ ...prev, location: e.target.value }))}
                className="block w-full pl-9 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Mumbai"
              />
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none disabled:opacity-50 transition-all"
          >
            {loading ? 'Registering...' : 'Register and Continue'}
          </button>
        </div>
      </form>
    </div>
  );

  // 2. Render Volunteer Onboarding Wizard
  const renderVolunteerOnboardWizard = () => {
    const totalSteps = 6;
    const progressPercent = Math.round((volStep / totalSteps) * 100);

    return (
      <div className="max-w-2xl w-full bg-white dark:bg-charcoal p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl transition-all">
        {/* Progress header */}
        <div className="mb-8">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            <span>Volunteer Onboarding</span>
            <span>Step {volStep} of {totalSteps} ({progressPercent}% Complete)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-charcoal-dark h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Step Content */}
        {volStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Step 1 — Tell us about yourself</h3>
            <p className="text-sm text-slate-500">Provide a short bio and summarize any past volunteering experience.</p>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Biography</label>
              <textarea
                value={volData.bio}
                onChange={(e) => setVolData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Share a brief introduction of who you are and why you want to volunteer..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Prior Experience</label>
              <input
                type="text"
                value={volData.experience}
                onChange={(e) => setVolData(prev => ({ ...prev, experience: e.target.value }))}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. 2 years at college social service club, teaching kids, none..."
              />
            </div>
          </div>
        )}

        {volStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Step 2 — Select your skills</h3>
            <p className="text-sm text-slate-500">Choose skills you possess to help match you with correct activities.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {skillOptions.map((skill) => {
                const isSelected = volData.skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-charcoal-dark/50 hover:bg-slate-100'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {volStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Step 3 — Preferred Causes</h3>
            <p className="text-sm text-slate-500">Pick social causes or sectors you are passionate about support.</p>
            <div className="grid grid-cols-2 gap-3">
              {causeOptions.map((cause) => {
                const isSelected = volData.preferredCauses.includes(cause);
                return (
                  <button
                    key={cause}
                    type="button"
                    onClick={() => handleCauseToggle(cause)}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-charcoal-dark/50 hover:bg-slate-100'
                    }`}
                  >
                    {cause}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {volStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Step 4 — Location Details</h3>
            <p className="text-sm text-slate-500">Where are you located? We use this to suggest local city opportunities.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={volData.city}
                  onChange={(e) => setVolData(prev => ({ ...prev, city: e.target.value }))}
                  className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Mumbai"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  value={volData.state}
                  onChange={(e) => setVolData(prev => ({ ...prev, state: e.target.value }))}
                  className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Maharashtra"
                />
              </div>
            </div>
          </div>
        )}

        {volStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Step 5 — Availability</h3>
            <p className="text-sm text-slate-500">When are you usually available to volunteer?</p>
            <div className="flex gap-4">
              <label className="flex-1 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-charcoal-dark/50 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={volData.availability.weekdays}
                  onChange={(e) => setVolData(prev => ({
                    ...prev,
                    availability: { ...prev.availability, weekdays: e.target.checked }
                  }))}
                  className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <div className="text-sm">
                  <p className="font-bold">Weekdays</p>
                  <p className="text-xs text-slate-400">Monday to Friday</p>
                </div>
              </label>

              <label className="flex-1 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-charcoal-dark/50 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={volData.availability.weekends}
                  onChange={(e) => setVolData(prev => ({
                    ...prev,
                    availability: { ...prev.availability, weekends: e.target.checked }
                  }))}
                  className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <div className="text-sm">
                  <p className="font-bold">Weekends</p>
                  <p className="text-xs text-slate-400">Saturday & Sunday</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {volStep === 6 && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Profile Onboarding Complete!</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                Thank you for completing your registration details. Click below to enter your dashboard and explore matches!
              </p>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 flex items-center justify-between">
          {volStep > 1 && volStep < 6 ? (
            <button
              onClick={() => setVolStep(prev => prev - 1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {volStep < 6 ? (
            <button
              onClick={() => setVolStep(prev => prev + 1)}
              className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-primary-dark transition-all shadow-md"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleVolunteerOnboard}
              disabled={loading}
              className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-lg w-full sm:w-auto transition-all"
            >
              {loading ? 'Completing Profile...' : 'Enter Volunteer Dashboard'}
            </button>
          )}
        </div>
      </div>
    );
  };

  // 3. Render NGO Onboarding Wizard
  const renderNGOOnboardWizard = () => {
    const totalSteps = 6;
    const progressPercent = Math.round((ngoStep / totalSteps) * 100);

    return (
      <div className="max-w-2xl w-full bg-white dark:bg-charcoal p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl transition-all">
        {/* Progress header */}
        <div className="mb-8">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            <span>NGO Onboarding</span>
            <span>Step {ngoStep} of {totalSteps} ({progressPercent}% Complete)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-charcoal-dark h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Step Content */}
        {ngoStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Step 1 — Tell us about your organization</h3>
            <p className="text-sm text-slate-500 font-medium">Describe your NGO's main objectives and goals.</p>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Organization Biography</label>
              <textarea
                value={ngoData.description}
                onChange={(e) => setNgoData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Describe your organization's mission, values, and accomplishments..."
              />
            </div>
          </div>
        )}

        {ngoStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Step 2 — Main Causes Support</h3>
            <p className="text-sm text-slate-500 font-medium">Which cause categories are core to your NGO's works?</p>
            <div className="grid grid-cols-2 gap-3">
              {causeOptions.map((cause) => {
                const isSelected = ngoData.causes.includes(cause);
                return (
                  <button
                    key={cause}
                    type="button"
                    onClick={() => handleCauseToggle(cause)}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 shadow-sm'
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-charcoal-dark/50 hover:bg-slate-100'
                    }`}
                  >
                    {cause}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {ngoStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Step 3 — Location Coordinates</h3>
            <p className="text-sm text-slate-500 font-medium">Enter your NGO registration city and head office address.</p>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Street Address</label>
              <input
                type="text"
                value={ngoData.address}
                onChange={(e) => setNgoData(prev => ({ ...prev, address: e.target.value }))}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                placeholder="Building Name, Lane 4, Area Road"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={ngoData.city}
                  onChange={(e) => setNgoData(prev => ({ ...prev, city: e.target.value }))}
                  className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                  placeholder="Pune"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  value={ngoData.state}
                  onChange={(e) => setNgoData(prev => ({ ...prev, state: e.target.value }))}
                  className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                  placeholder="Maharashtra"
                />
              </div>
            </div>
          </div>
        )}

        {ngoStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Step 4 — Contact & Links</h3>
            <p className="text-sm text-slate-500 font-medium">How can volunteers and admins reach you?</p>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Website URL</label>
              <input
                type="url"
                value={ngoData.website}
                onChange={(e) => setNgoData(prev => ({ ...prev, website: e.target.value }))}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm"
                placeholder="https://www.yourngo.org"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={ngoData.phone}
                onChange={(e) => setNgoData(prev => ({ ...prev, phone: e.target.value }))}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm"
                placeholder="NGO Hotline Number"
              />
            </div>
          </div>
        )}

        {ngoStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Step 5 — Verification Information</h3>
            <p className="text-sm text-slate-500 font-medium">These details are utilized by site administrators to verify your organization legitimacy.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Government Reg Number</label>
                <input
                  type="text"
                  value={ngoData.registrationNumber}
                  onChange={(e) => setNgoData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                  className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm"
                  placeholder="NGO-12345678"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Founded Year</label>
                <input
                  type="number"
                  value={ngoData.foundedYear}
                  onChange={(e) => setNgoData(prev => ({ ...prev, foundedYear: Number(e.target.value) }))}
                  className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm"
                  placeholder="2015"
                />
              </div>
            </div>
          </div>
        )}

        {ngoStep === 6 && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">NGO Onboarding Complete!</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                Your organization profile details are successfully configured. Click below to load your dashboard panel.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 flex items-center justify-between">
          {ngoStep > 1 && ngoStep < 6 ? (
            <button
              onClick={() => setNgoStep(prev => prev - 1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {ngoStep < 6 ? (
            <button
              onClick={() => setNgoStep(prev => prev + 1)}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-all shadow-md"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNGOOnboard}
              disabled={loading}
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-lg w-full sm:w-auto transition-all"
            >
              {loading ? 'Completing Profile...' : 'Enter NGO Dashboard'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-charcoal-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      {!isOnboarding ? renderRegisterForm() : (
        registeredRole === 'ngo' ? renderNGOOnboardWizard() : renderVolunteerOnboardWizard()
      )}
    </div>
  );
};

export default Register;
