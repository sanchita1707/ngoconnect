import React, { useState, useEffect } from 'react';
import API from '../services/api';
import PageHeader from '../components/PageHeader';
import { EmptyState } from '../components/StatusState';
import { MapPin, Heart, Clock, Briefcase, Globe, SlidersHorizontal } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const CITY_COORDS = {
  'mumbai': { top: '65%', left: '32%' },
  'pune': { top: '72%', left: '36%' },
  'delhi': { top: '32%', left: '42%' },
  'delhi ncr': { top: '32%', left: '42%' },
  'bangalore': { top: '82%', left: '45%' },
  'hyderabad': { top: '68%', left: '49%' },
  'chennai': { top: '85%', left: '52%' },
  'kolkata': { top: '50%', left: '78%' }
};

const ImpactMap = () => {
  const { showToast } = useNotification();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityData, setCityData] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await API.get('/opportunities?status=Open');
        if (res.data.success) {
          const opps = res.data.opportunities;
          setOpportunities(opps);

          // Group by city location
          const groups = {};
          opps.forEach(opp => {
            const city = (opp.city || '').trim();
            if (!city) return;
            const key = city.toLowerCase();
            if (!groups[key]) {
              groups[key] = {
                name: city,
                opportunities: 0,
                volunteers: 0,
                hours: 0,
                coords: CITY_COORDS[key] || { top: '50%', left: '50%' } // Default fallback placement
              };
            }
            groups[key].opportunities += 1;
            groups[key].volunteers += opp.volunteersJoined || 0;
            // Estimate service hours: remaining or joined volunteers * average 4h
            groups[key].hours += (opp.volunteersJoined || 0) * 4;
          });

          setCityData(Object.values(groups));
        }
      } catch (err) {
        console.error(err);
        showToast('Error', 'Failed to retrieve geographic impact coordinates.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [showToast]);

  return (
    <div className="bg-slate-50 dark:bg-charcoal-dark min-h-screen py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Consistent Page Header */}
        <PageHeader
          label="Topography"
          heading="Social Impact Map"
          description="Visualizing verified volunteer locations, active openings, and logged community hours across India."
        />

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : cityData.length === 0 ? (
          <EmptyState
            title="No geographic nodes active"
            description="There are currently no active opportunity locations listed in the database to display."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Interactive Grid Map outline */}
            <div className="lg:col-span-3 bg-white dark:bg-charcoal p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm relative overflow-hidden flex flex-col justify-between h-[450px]">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 z-10 relative">
                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500">Distribution Nodes</h3>
                <span className="flex items-center gap-1.5 text-xs text-primary font-bold">
                  <Globe className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} /> Live Nodes
                </span>
              </div>

              {/* Map background outline */}
              <div className="relative w-full h-full flex items-center justify-center bg-emerald-500/5 dark:bg-emerald-500/2 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/60 mt-4 overflow-hidden">
                {/* Grid Pattern dot */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>

                {/* City node pins */}
                {cityData.map((city) => (
                  <div
                    key={city.name}
                    className="absolute p-2 rounded-xl bg-white dark:bg-charcoal border border-slate-100 dark:border-slate-700 shadow-xl flex items-center gap-2 group hover:scale-105 hover:border-primary transition-all cursor-pointer z-10"
                    style={{ top: city.coords.top, left: city.coords.left }}
                  >
                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping absolute -top-0.5 -right-0.5"></div>
                    <MapPin className="w-4 h-4 text-primary fill-current flex-shrink-0" />
                    <div className="text-[9px] min-w-0">
                      <p className="font-bold leading-none text-slate-805 dark:text-slate-205">{city.name}</p>
                      <p className="text-slate-400 font-semibold leading-none mt-1 whitespace-nowrap">{city.opportunities} Openings</p>
                    </div>
                  </div>
                ))}

                <span className="absolute bottom-4 right-4 text-[9px] font-bold text-slate-400">
                  Interactive Node Grid
                </span>
              </div>
            </div>

            {/* List side panel */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-lg text-slate-905 dark:text-white">Active Municipal Chapters</h3>
              
              <div className="space-y-4 max-h-[390px] overflow-y-auto pr-1">
                {cityData.map((city) => (
                  <div key={city.name} className="card-global p-5 hover:border-slate-205 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-base text-slate-800 dark:text-slate-200">{city.name}</span>
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">
                        Verified Chapter
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50">
                        <span className="text-[10px] text-slate-400 block font-semibold">Openings</span>
                        <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1 justify-center">
                          <Briefcase className="w-3.5 h-3.5 text-primary" /> {city.opportunities}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50">
                        <span className="text-[10px] text-slate-400 block font-semibold">Total Hours</span>
                        <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1 justify-center">
                          <Clock className="w-3.5 h-3.5 text-primary" /> {city.hours}h
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50">
                        <span className="text-[10px] text-slate-400 block font-semibold">Volunteers</span>
                        <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1 justify-center">
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> {city.volunteers}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default ImpactMap;
