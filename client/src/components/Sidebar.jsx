import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, Briefcase, FileText, Bookmark, Calendar, Award, 
  Activity, BookOpen, User, Users, Clipboard, Layers, Flag, Award as CertIcon
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const linkClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
      isActive 
        ? 'bg-primary text-white shadow-md shadow-primary/20' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
    }`;

  const renderVolunteerLinks = () => (
    <>
      <NavLink to="/volunteer/dashboard" className={linkClass}>
        <Home className="w-5 h-5" />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/opportunities" className={linkClass}>
        <Briefcase className="w-5 h-5" />
        <span>Explore</span>
      </NavLink>
      <NavLink to="/volunteer/applications" className={linkClass}>
        <FileText className="w-5 h-5" />
        <span>Applications</span>
      </NavLink>
      <NavLink to="/volunteer/saved" className={linkClass}>
        <Bookmark className="w-5 h-5" />
        <span>Saved</span>
      </NavLink>
      <NavLink to="/volunteer/calendar" className={linkClass}>
        <Calendar className="w-5 h-5" />
        <span>Calendar</span>
      </NavLink>
      <NavLink to="/volunteer/participation" className={linkClass}>
        <Clipboard className="w-5 h-5" />
        <span>Participation</span>
      </NavLink>
      <NavLink to="/volunteer/impact" className={linkClass}>
        <Activity className="w-5 h-5" />
        <span>Impact Metrics</span>
      </NavLink>
      <NavLink to="/volunteer/certificates" className={linkClass}>
        <CertIcon className="w-5 h-5" />
        <span>Certificates</span>
      </NavLink>
      <NavLink to="/volunteer/profile" className={linkClass}>
        <User className="w-5 h-5" />
        <span>My Profile</span>
      </NavLink>
    </>
  );

  const renderNGOLinks = () => (
    <>
      <NavLink to="/ngo/dashboard" className={linkClass}>
        <Home className="w-5 h-5" />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/ngo/opportunities" className={linkClass}>
        <Briefcase className="w-5 h-5" />
        <span>Opportunities</span>
      </NavLink>
      <NavLink to="/ngo/applications" className={linkClass}>
        <FileText className="w-5 h-5" />
        <span>Applications</span>
      </NavLink>
      <NavLink to="/ngo/volunteers" className={linkClass}>
        <Users className="w-5 h-5" />
        <span>Volunteers</span>
      </NavLink>
      <NavLink to="/ngo/resources" className={linkClass}>
        <Layers className="w-5 h-5" />
        <span>Resource Needs</span>
      </NavLink>
      <NavLink to="/ngo/campaigns" className={linkClass}>
        <BookOpen className="w-5 h-5" />
        <span>Campaigns</span>
      </NavLink>
      <NavLink to="/ngo/events" className={linkClass}>
        <Calendar className="w-5 h-5" />
        <span>Events</span>
      </NavLink>
      <NavLink to="/ngo/profile" className={linkClass}>
        <User className="w-5 h-5" />
        <span>Organization Profile</span>
      </NavLink>
    </>
  );

  const renderAdminLinks = () => (
    <>
      <NavLink to="/admin/dashboard" className={linkClass}>
        <Home className="w-5 h-5" />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/admin/users" className={linkClass}>
        <Users className="w-5 h-5" />
        <span>User Management</span>
      </NavLink>
      <NavLink to="/admin/ngos" className={linkClass}>
        <Clipboard className="w-5 h-5" />
        <span>NGO Verifications</span>
      </NavLink>
      <NavLink to="/admin/opportunities" className={linkClass}>
        <Briefcase className="w-5 h-5" />
        <span>Opportunities</span>
      </NavLink>
      <NavLink to="/admin/resources" className={linkClass}>
        <Layers className="w-5 h-5" />
        <span>Resource Moderation</span>
      </NavLink>
      <NavLink to="/admin/reports" className={linkClass}>
        <Flag className="w-5 h-5" />
        <span>Reports Queue</span>
      </NavLink>
      <NavLink to="/admin/categories" className={linkClass}>
        <BookOpen className="w-5 h-5" />
        <span>Categories Curation</span>
      </NavLink>
    </>
  );

  return (
    <aside className="w-64 hidden md:flex flex-col bg-white dark:bg-charcoal border-r border-slate-100 dark:border-slate-800 p-4 gap-2 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto transition-colors duration-300">
      <div className="flex flex-col gap-1.5">
        <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider pl-4 mb-2">
          {user.role} Navigation
        </p>
        {user.role === 'volunteer' && renderVolunteerLinks()}
        {user.role === 'ngo' && renderNGOLinks()}
        {user.role === 'admin' && renderAdminLinks()}
      </div>
    </aside>
  );
};

export default Sidebar;
