import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import PageHeader from '../components/PageHeader';
import { SkeletonCard, EmptyState } from '../components/StatusState';
import { Search, MapPin, Landmark, AlertTriangle, ShieldCheck, Filter, SlidersHorizontal, Award, Briefcase } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const NGOs = () => {
  const { showToast } = useNotification();
  const [ngos, setNgos] = useState([]);
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [cause, setCause] = useState('');
  const [city, setCity] = useState('');

  const causesList = [
    '🌱 Environment', '📚 Education', '❤️ Healthcare', '🍲 Food Support', 
    '👶 Child Welfare', '👵 Elder Care', '🐾 Animal Welfare', 
    '🏘️ Community Development', '🩸 Blood Donation', '🌳 Tree Plantation'
  ];

  const fetchNGOs = useCallback(async () => {
    setLoading(true);
    try {
      let query = '?';
      if (search) query += `search=${encodeURIComponent(search)}&`;
      if (cause) query += `cause=${encodeURIComponent(cause)}&`;
      if (city) query += `city=${encodeURIComponent(city)}&`;

      const res = await API.get(`/ngos${query}`);
      const resOpps = await API.get('/opportunities?status=Open');
      
      if (res.data.success) {
        setNgos(res.data.ngos);
      }
      if (resOpps.data.success) {
        setOpps(resOpps.data.opportunities);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve NGO directory list.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, cause, city, showToast]);

  useEffect(() => {
    fetchNGOs();
  }, [fetchNGOs]);

  const handleResetFilters = () => {
    setSearch('');
    setCause('');
    setCity('');
  };

  const getOppCount = (ngoId) => {
    return opps.filter(o => o.ngoId?._id === ngoId).length;
  };

  return (
    <div className="bg-slate-50 dark:bg-charcoal-dark min-h-screen py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Consistent Page Header */}
        <PageHeader
          label="Directory"
          heading="Partner Organizations"
          description="Discover trustworthy non-profit groups making real local impacts and volunteer with them."
        />

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-charcoal p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search NGOs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-charcoal-dark/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* City */}
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="City (e.g. Mumbai)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-charcoal-dark/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Category */}
            <div>
              <select
                value={cause}
                onChange={(e) => setCause(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-charcoal-dark/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100"
              >
                <option value="">All Causes</option>
                {causesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={fetchNGOs}
              className="flex-grow md:flex-initial btn-primary px-5 h-9"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
            {(search || cause || city) && (
              <button
                onClick={handleResetFilters}
                className="btn-secondary h-9 px-3.5"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Cause Pills Header */}
        <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-none mb-8">
          <button
            onClick={() => setCause('')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              cause === ''
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white dark:bg-charcoal text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            🌱 All Causes
          </button>
          {causesList.map((c) => (
            <button
              key={c}
              onClick={() => setCause(c)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                cause === c
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white dark:bg-charcoal text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Listings */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard count={3} />
          </div>
        ) : ngos.length === 0 ? (
          <EmptyState 
            title="No organizations found" 
            description="Try adjusting your filters or search keywords to locate active non-profit groups."
            actionText="Clear All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ngos.map((ngo) => {
              const openOppCount = getOppCount(ngo.userId?._id || ngo._id);
              return (
                <div key={ngo._id} className="card-global p-5 hover:-translate-y-1 transition-all duration-300">
                  <div>
                    {/* NGO Header Profile */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center font-bold uppercase text-lg overflow-hidden flex-shrink-0">
                        {ngo.userId?.profileImage ? (
                          <img src={ngo.userId.profileImage} alt={ngo.organizationName} className="w-full h-full object-cover" />
                        ) : (
                          ngo.organizationName.substring(0, 2)
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base flex items-center gap-1 leading-tight group-hover:text-primary transition-colors text-slate-900 dark:text-white truncate">
                          <span>{ngo.organizationName}</span>
                          {ngo.verificationStatus === 'Verified' && (
                            <ShieldCheck className="w-4 h-4 text-emerald-500 fill-current flex-shrink-0" title="Verified NGO" />
                          )}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 flex items-center gap-1 font-medium truncate">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{ngo.city}, {ngo.state}</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                      {ngo.description || "Dedicated organization committed to developing local communities through direct action and support."}
                    </p>

                    {/* Causes list tags */}
                    {ngo.causes && ngo.causes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {ngo.causes.slice(0, 3).map(c => (
                          <span key={c} className="text-[9px] font-extrabold bg-primary/10 text-primary dark:text-primary-light px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Panel */}
                  <div className="border-t border-slate-50 dark:border-slate-800/80 pt-4 mt-2 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                      <Briefcase className="w-3.5 h-3.5 text-primary" />
                      <span>{openOppCount} {openOppCount === 1 ? 'Opportunity' : 'Opportunities'}</span>
                    </div>

                    <Link
                      to={`/ngos/${ngo.userId?._id || ngo._id}`}
                      className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default NGOs;
