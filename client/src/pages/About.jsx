import React from 'react';
import { Heart, Target, Sparkles, BookOpen } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-slate-50 dark:bg-charcoal-dark min-h-screen py-16 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            About <span className="text-primary dark:text-primary-light">NGOConnect</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 font-medium">
            Empowering communities, bridging causes, and magnifying volunteer efforts.
          </p>
        </div>

        {/* Story Card */}
        <div className="bg-white dark:bg-charcoal rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800/80 mb-10 transition-colors">
          <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            We believe that social impact shouldn't be hard to construct or verify. In conventional volunteering setups, finding the right organization, logging hours, and validating credentials is often a manual, fragmented process. 
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            NGOConnect is built to solve this. It provides a single unified digital ecosystem where NGOs can list physical resource requirements and volunteering opportunities, and volunteers can verify contributions, track hours in interactive analytics, build XP levels, and download certificates.
          </p>
        </div>

        {/* Grid Pillars */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-charcoal p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-center transition-colors">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Goal Oriented</h3>
            <p className="text-sm text-slate-500 mt-2">Connecting skills to concrete, on-ground goals of local NGOs.</p>
          </div>

          <div className="bg-white dark:bg-charcoal p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-center transition-colors">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Gamified Reward</h3>
            <p className="text-sm text-slate-500 mt-2">Level up, achieve achievement badges, and grow your impact score.</p>
          </div>

          <div className="bg-white dark:bg-charcoal p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-center transition-colors">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Verifiable Ledger</h3>
            <p className="text-sm text-slate-500 mt-2">Verifiable certificate numbers backed by logged activity records.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
