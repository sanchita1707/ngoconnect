import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Calendar as CalendarIcon, Clock, MapPin, AlertCircle } from 'lucide-react';

const VolunteerCalendar = () => {
  const { showToast } = useNotification();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar render states
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const res = await API.get('/applications/my');
        if (res.data.success) {
          // Filter accepted or completed apps to show on schedule
          const scheduled = res.data.applications.filter(
            a => a.status === 'Accepted' || a.status === 'Completed'
          );
          setActivities(scheduled);
        }
      } catch (err) {
        console.error(err);
        showToast('Error', 'Failed to retrieve scheduling data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [showToast]);

  // Calendar calculation helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // 0: Sunday, 1: Monday...
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Find if date has activities
  const getActivitiesForDate = (day) => {
    return activities.filter(a => {
      const aDate = new Date(a.opportunityId?.date);
      return (
        aDate.getDate() === day &&
        aDate.getMonth() === currentDate.getMonth() &&
        aDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const renderDays = () => {
    const days = [];
    // Empty cells for preceding month overlap
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 bg-slate-50/50 dark:bg-charcoal-dark/10 border border-slate-100/50 dark:border-slate-800/30"></div>);
    }

    // Days cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dayActivities = getActivitiesForDate(day);
      const isToday = 
        day === new Date().getDate() && 
        currentDate.getMonth() === new Date().getMonth() && 
        currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={`day-${day}`}
          className={`h-20 p-1 border border-slate-100 dark:border-slate-800/60 relative flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all ${
            isToday ? 'bg-primary/5 border-primary/30' : 'bg-white dark:bg-charcoal'
          }`}
        >
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md self-start ${
            isToday ? 'bg-primary text-white' : 'text-slate-400'
          }`}>
            {day}
          </span>

          {dayActivities.length > 0 && (
            <div className="flex flex-col gap-1 overflow-hidden max-h-[48px] pb-1">
              {dayActivities.map(a => (
                <div
                  key={a._id}
                  className={`text-[8px] font-extrabold px-1 py-0.5 rounded truncate ${
                    a.status === 'Completed'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                  }`}
                  title={a.opportunityId?.title}
                >
                  {a.opportunityId?.title}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Calendar Schedule</h1>
        <p className="text-sm text-slate-500 mt-1">Review your upcoming slot confirmations and completed dates.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Calendar Grid */}
        <div className="lg:col-span-3 bg-white dark:bg-charcoal rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 sm:p-5">
          
          {/* Header controls */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850 mb-4">
            <button onClick={prevMonth} className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800">&larr; Prev</button>
            <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={nextMonth} className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800">Next &rarr;</button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center font-bold text-[10px] uppercase text-slate-400 tracking-wider mb-2">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          {/* Days */}
          {loading ? (
            <div className="h-80 w-full rounded-2xl shimmer"></div>
          ) : (
            <div className="grid grid-cols-7 border-t border-l border-slate-100 dark:border-slate-800">
              {renderDays()}
            </div>
          )}
        </div>

        {/* Schedule List */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">My Schedule</h3>
          {loading ? (
            <div className="h-40 shimmer rounded-2xl"></div>
          ) : activities.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 bg-white dark:bg-charcoal border border-slate-150 dark:border-slate-800 rounded-2xl">
              No confirmed appointments listed.
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {activities.map(app => (
                <div key={app._id} className="bg-white dark:bg-charcoal p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    app.status === 'Completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30'
                  }`}>
                    {app.status}
                  </span>
                  <h4 className="font-bold text-xs mt-2 leading-tight text-slate-800 dark:text-slate-200">
                    {app.opportunityId?.title}
                  </h4>
                  <div className="mt-3 space-y-1 text-[10px] text-slate-400 font-semibold">
                    <p className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> {new Date(app.opportunityId?.date).toLocaleDateString()}</p>
                    <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {app.opportunityId?.startTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default VolunteerCalendar;
