import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Briefcase, FileText, Activity, User, Layers } from 'lucide-react';

const BottomNavigation = () => {
  const { user } = useAuth();

  if (!user) return null;

  const tabClass = ({ isActive }) => 
    `flex flex-col items-center justify-center flex-1 py-2 text-[10px] font-semibold transition-all ${
      isActive 
        ? 'text-primary' 
        : 'text-slate-500 dark:text-slate-400'
    }`;

  const renderVolunteerTabs = () => (
    <>
      <NavLink to="/volunteer/dashboard" className={tabClass}>
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </NavLink>
      <NavLink to="/opportunities" className={tabClass}>
        <Briefcase className="w-5 h-5 mb-0.5" />
        <span>Explore</span>
      </NavLink>
      <NavLink to="/volunteer/applications" className={tabClass}>
        <FileText className="w-5 h-5 mb-0.5" />
        <span>Apps</span>
      </NavLink>
      <NavLink to="/volunteer/impact" className={tabClass}>
        <Activity className="w-5 h-5 mb-0.5" />
        <span>Impact</span>
      </NavLink>
      <NavLink to="/volunteer/profile" className={tabClass}>
        <User className="w-5 h-5 mb-0.5" />
        <span>Profile</span>
      </NavLink>
    </>
  );

  const renderNGOTabs = () => (
    <>
      <NavLink to="/ngo/dashboard" className={tabClass}>
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </NavLink>
      <NavLink to="/ngo/opportunities" className={tabClass}>
        <Briefcase className="w-5 h-5 mb-0.5" />
        <span>Opps</span>
      </NavLink>
      <NavLink to="/ngo/applications" className={tabClass}>
        <FileText className="w-5 h-5 mb-0.5" />
        <span>Apps</span>
      </NavLink>
      <NavLink to="/ngo/resources" className={tabClass}>
        <Layers className="w-5 h-5 mb-0.5" />
        <span>Resources</span>
      </NavLink>
      <NavLink to="/ngo/profile" className={tabClass}>
        <User className="w-5 h-5 mb-0.5" />
        <span>Profile</span>
      </NavLink>
    </>
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-charcoal border-t border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-around pb-safe-bottom transition-colors duration-300">
      {user.role === 'volunteer' && renderVolunteerTabs()}
      {user.role === 'ngo' && renderNGOTabs()}
      {user.role === 'admin' && (
        <NavLink to="/admin/dashboard" className={tabClass}>
          <Home className="w-5 h-5" />
          <span>Admin Home</span>
        </NavLink>
      )}
    </div>
  );
};

export default BottomNavigation;
