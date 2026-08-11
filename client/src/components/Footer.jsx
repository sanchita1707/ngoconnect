import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-350 dark:bg-charcoal-dark border-t border-slate-800 transition-colors duration-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Columns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          
          {/* Col 1: NGOConnect */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-widest">NGOConnect</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link to="/opportunities" className="hover:text-primary transition-colors">Opportunities</Link></li>
              <li><Link to="/ngos" className="hover:text-primary transition-colors">NGO Directory</Link></li>
            </ul>
          </div>

          {/* Col 2: For Volunteers */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-widest">For Volunteers</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link to="/opportunities" className="hover:text-primary transition-colors">Explore</Link></li>
              <li><Link to="/volunteer/applications" className="hover:text-primary transition-colors">Applications</Link></li>
              <li><Link to="/volunteer/impact" className="hover:text-primary transition-colors">Impact</Link></li>
              <li><Link to="/volunteer/certificates" className="hover:text-primary transition-colors">Certificates</Link></li>
              <li><Link to="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
            </ul>
          </div>

          {/* Col 3: For NGOs */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-widest">For NGOs</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link to="/ngo/opportunities" className="hover:text-primary transition-colors">Create Opportunity</Link></li>
              <li><Link to="/ngo/resources" className="hover:text-primary transition-colors">Resources Requests</Link></li>
              <li><Link to="/ngo/campaigns" className="hover:text-primary transition-colors">Campaigns</Link></li>
              <li><Link to="/ngo/events" className="hover:text-primary transition-colors">Events</Link></li>
            </ul>
          </div>

          {/* Col 4: Support */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-widest">Support</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        {/* Copy / Tagline */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2 text-white">
            <Heart className="w-5 h-5 fill-current text-primary" />
            <span className="font-extrabold text-sm">NGOConnect</span>
          </div>
          
          <div className="text-slate-500">
            &copy; 2026 NGOConnect. Connect. Volunteer. Create Impact.
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
