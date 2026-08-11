import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { Sun, Moon, Bell, Menu, X, Heart, Award, Shield, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setProfileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Dropdown auto-closure triggers (click outside & Escape)
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (moreOpen && !e.target.closest('.more-dropdown-container')) {
        setMoreOpen(false);
      }
      if (profileOpen && !e.target.closest('.profile-dropdown-container')) {
        setProfileOpen(false);
      }
      if (notificationOpen && !e.target.closest('.notification-dropdown-container')) {
        setNotificationOpen(false);
      }
    };
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        setProfileOpen(false);
        setNotificationOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [moreOpen, profileOpen, notificationOpen]);

  return (
    <nav className="sticky top-0 z-40 bg-white/85 dark:bg-charcoal/85 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-base text-primary dark:text-primary-light">
              <Heart className="w-5 h-5 fill-current text-primary" />
              <span>NGOConnect</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link 
              to="/opportunities" 
              className={`text-xs font-bold transition-colors duration-200 ${isActive('/opportunities') ? 'text-primary dark:text-primary-light' : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light'}`}
            >
              Opportunities
            </Link>
            <Link 
              to="/ngos" 
              className={`text-xs font-bold transition-colors duration-200 ${isActive('/ngos') ? 'text-primary dark:text-primary-light' : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light'}`}
            >
              NGOs
            </Link>
            <Link 
              to="/resources" 
              className={`text-xs font-bold transition-colors duration-200 ${isActive('/resources') ? 'text-primary dark:text-primary-light' : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light'}`}
            >
              Resources
            </Link>
            <Link 
              to="/events" 
              className={`text-xs font-bold transition-colors duration-200 ${isActive('/events') ? 'text-primary dark:text-primary-light' : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light'}`}
            >
              Events
            </Link>

            {/* More dropdown container */}
            <div className="relative more-dropdown-container">
              <button
                onClick={() => {
                  setMoreOpen(!moreOpen);
                  setNotificationOpen(false);
                  setProfileOpen(false);
                }}
                className={`text-xs font-bold transition-colors duration-205 flex items-center gap-1 focus:outline-none ${moreOpen ? 'text-primary dark:text-primary-light' : 'text-slate-600 dark:text-slate-300 hover:text-primary'}`}
              >
                <span>More</span>
                <span className="text-[10px] select-none">&#9662;</span>
              </button>
              {moreOpen && (
                <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-charcoal border border-slate-100 dark:border-slate-800 rounded-xl shadow-2xl py-1 z-50 transition-all">
                  <Link
                    to="/campaigns"
                    onClick={() => setMoreOpen(false)}
                    className={`block px-4 py-2.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isActive('/campaigns') ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    Campaigns
                  </Link>
                  <Link
                    to="/stories"
                    onClick={() => setMoreOpen(false)}
                    className={`block px-4 py-2.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isActive('/stories') ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    Stories
                  </Link>
                  <Link
                    to="/leaderboard"
                    onClick={() => setMoreOpen(false)}
                    className={`block px-4 py-2.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isActive('/leaderboard') ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    Leaderboard
                  </Link>
                  <Link
                    to="/impact-map"
                    onClick={() => setMoreOpen(false)}
                    className={`block px-4 py-2.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isActive('/impact-map') ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    Impact Map
                  </Link>
                  <Link
                    to="/activity"
                    onClick={() => setMoreOpen(false)}
                    className={`block px-4 py-2.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isActive('/activity') ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    Activity
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* User controls / Auth / Theme */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* If Logged In: Notifications */}
            {user && (
              <div className="relative notification-dropdown-container">
                <button
                  onClick={() => {
                    setNotificationOpen(!notificationOpen);
                    setProfileOpen(false);
                    setMoreOpen(false);
                  }}
                  className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-charcoal border border-slate-100 dark:border-slate-800 rounded-xl shadow-2xl z-50">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="font-bold text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-primary dark:text-primary-light font-medium hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => markAsRead(notif._id)}
                            className={`p-3 border-b border-slate-55 dark:border-slate-800 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col gap-1 ${
                              !notif.read ? 'bg-primary/5 dark:bg-primary-dark/10' : ''
                            }`}
                          >
                            <span className="font-bold">{notif.title}</span>
                            <span className="text-slate-500 dark:text-slate-400">{notif.message}</span>
                            <span className="text-[10px] text-slate-400 self-end">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Session actions */}
            {user ? (
              <div className="relative profile-dropdown-container">
                <button
                  onClick={() => {
                    setProfileOpen(!profileOpen);
                    setNotificationOpen(false);
                    setMoreOpen(false);
                  }}
                  className="flex items-center gap-2 p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-[10px] uppercase overflow-hidden">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.substring(0, 2)
                    )}
                  </div>
                  <span className="text-xs font-semibold hidden md:inline truncate max-w-[80px]">{user.name}</span>
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-charcoal border border-slate-100 dark:border-slate-800 rounded-xl shadow-2xl py-1 z-50">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{user.role}</p>
                      <p className="text-xs font-semibold truncate mt-0.5">{user.name}</p>
                    </div>

                    <Link
                      to={user.role === 'volunteer' ? '/volunteer/dashboard' : user.role === 'ngo' ? '/ngo/dashboard' : '/admin/dashboard'}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      <span>My Dashboard</span>
                    </Link>

                    <Link
                      to={user.role === 'volunteer' ? '/volunteer/profile' : user.role === 'ngo' ? '/ngo/profile' : '/admin/settings'}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit Profile</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/login" className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-3.5 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-md">
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile Hamburger menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-charcoal px-4 pt-2 pb-4 space-y-1 flex flex-col gap-1 transition-all duration-300">
          <Link
            to="/opportunities"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-105 dark:hover:bg-slate-800 transition-colors ${isActive('/opportunities') ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}
          >
            Opportunities
          </Link>
          <Link
            to="/ngos"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-105 dark:hover:bg-slate-800 transition-colors ${isActive('/ngos') ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}
          >
            NGOs
          </Link>
          <Link
            to="/resources"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-105 dark:hover:bg-slate-800 transition-colors ${isActive('/resources') ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}
          >
            Resources
          </Link>
          <Link
            to="/campaigns"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-105 dark:hover:bg-slate-800 transition-colors ${isActive('/campaigns') ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}
          >
            Campaigns
          </Link>
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-105 dark:hover:bg-slate-800 transition-colors ${isActive('/events') ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}
          >
            Events
          </Link>
          <Link
            to="/stories"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-105 dark:hover:bg-slate-800 transition-colors ${isActive('/stories') ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}
          >
            Stories
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-105 dark:hover:bg-slate-800 transition-colors ${isActive('/leaderboard') ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}
          >
            Leaderboard
          </Link>
          <Link
            to="/impact-map"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-105 dark:hover:bg-slate-800 transition-colors ${isActive('/impact-map') ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}
          >
            Impact Map
          </Link>
          <Link
            to="/activity"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-105 dark:hover:bg-slate-800 transition-colors ${isActive('/activity') ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}
          >
            Activity
          </Link>

          {!user && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-xs font-bold border border-slate-205 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-md"
              >
                Join Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
