import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Lock, Mail, ShieldAlert, Award, Landmark, UserCheck, Eye, EyeOff, KeyRound } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect target
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Validation Error', 'Please fill in all credentials.', 'warning');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      showToast('Logged In', 'Welcome back to NGOConnect!', 'success');
      // Load current user context and navigate to their dashboard
      setTimeout(() => {
        if (email.includes('admin') || email === 'admin@ngoconnect.demo') {
          navigate('/admin/dashboard');
        } else if (email.includes('ngo') || email === 'ngo@ngoconnect.demo') {
          navigate('/ngo/dashboard');
        } else {
          navigate('/volunteer/dashboard');
        }
      }, 300);
    } else {
      // Map technical errors to user friendly messages
      let friendlyMessage = result.message;
      if (result.message.includes('500') || result.message.toLowerCase().includes('internal server')) {
        friendlyMessage = 'Our database servers are currently experiencing issues. Please try again in a few moments.';
      } else if (result.message.toLowerCase().includes('network') || result.message.toLowerCase().includes('timeout')) {
        friendlyMessage = 'Connection timed out. Please check your internet connection.';
      }
      showToast('Authentication Failed', friendlyMessage, 'error');
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setLoading(true);
    const result = await login(demoEmail, 'password123');
    setLoading(false);

    if (result.success) {
      showToast('Demo Login Success', `Logged in as ${demoEmail.split('@')[0]}`, 'success');
      if (demoEmail === 'admin@ngoconnect.demo') {
        navigate('/admin/dashboard');
      } else if (demoEmail === 'ngo@ngoconnect.demo') {
        navigate('/ngo/dashboard');
      } else {
        navigate('/volunteer/dashboard');
      }
    } else {
      showToast('Demo Authentication Error', result.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-charcoal-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-charcoal p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Sign In</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Or{' '}
            <Link to="/register" className="font-semibold text-primary hover:text-primary-dark hover:underline">
              create a new account
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-slate-800 dark:text-slate-200 transition-all font-medium"
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-slate-800 dark:text-slate-200 transition-all font-medium"
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
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-55 transition-all cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Demo login panel */}
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
          <p className="text-[10px] font-bold text-center text-slate-400 uppercase tracking-widest mb-4">
            Presentation Quick Sign In
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleDemoLogin('volunteer@ngoconnect.demo')}
              className="w-full py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-slate-700 dark:text-slate-300"
            >
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>Login as Demo Volunteer</span>
            </button>
            <button
              onClick={() => handleDemoLogin('ngo@ngoconnect.demo')}
              className="w-full py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-slate-700 dark:text-slate-300"
            >
              <Landmark className="w-4 h-4 text-amber-500" />
              <span>Login as Demo NGO</span>
            </button>
            <button
              onClick={() => handleDemoLogin('admin@ngoconnect.demo')}
              className="w-full py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-slate-700 dark:text-slate-300"
            >
              <Award className="w-4 h-4 text-blue-500" />
              <span>Login as Demo Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
