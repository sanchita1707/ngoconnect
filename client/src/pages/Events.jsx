import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import PageHeader from '../components/PageHeader';
import { SkeletonCard, EmptyState } from '../components/StatusState';
import { Calendar, Clock, MapPin, AlertTriangle, Users, CheckCircle } from 'lucide-react';

const Events = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/events');
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve events list.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRegisterEvent = async (evId) => {
    if (!user) {
      showToast('Authentication Required', 'Please sign in to register for events.', 'warning');
      return;
    }
    if (user.role !== 'volunteer') {
      showToast('Action Blocked', 'Only volunteers can register for events.', 'warning');
      return;
    }

    setJoiningId(evId);
    try {
      const res = await API.post(`/events/${evId}/join`);
      if (res.data.success) {
        showToast('Registered!', 'You are registered for this event. +50 XP awarded!', 'success');
        fetchEvents(); // reload list
      }
    } catch (err) {
      console.error(err);
      showToast('Error', err.response?.data?.message || 'Event registration failed.', 'error');
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-charcoal-dark min-h-screen py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Consistent Page Header */}
        <PageHeader
          label="Seminars"
          heading="Community Events"
          description="Join educational panels, volunteer workshops, and community summits organized by partner NGOs."
        />

        {/* Listings */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard count={3} />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            title="No upcoming events"
            description="There are currently no community events scheduled by non-profit groups."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => {
              const isRegistered = ev.attendees.includes(user?._id);
              const isFull = ev.attendees.length >= ev.capacity;
              return (
                <div key={ev._id} className="card-global p-5">
                  
                  <div className="space-y-3">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug line-clamp-1">{ev.title}</h3>
                    <p className="text-xs text-primary dark:text-primary-light font-bold">Hosted by {ev.ngoId?.name || 'NGO Partner'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mt-2">
                      {ev.description}
                    </p>

                    <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{new Date(ev.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{ev.startTime} - {ev.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{ev.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card bottom details */}
                  <div className="border-t border-slate-50 dark:border-slate-800/80 pt-4 mt-6 flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-450 dark:text-slate-505 flex items-center gap-1.5 font-bold">
                      <Users className="w-4 h-4" />
                      <span>{ev.attendees.length} / {ev.capacity} joined</span>
                    </span>

                    {isRegistered ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Joined
                      </span>
                    ) : isFull ? (
                      <span className="text-xs font-bold text-slate-400 bg-slate-105 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                        Full
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegisterEvent(ev._id)}
                        disabled={joiningId === ev._id}
                        className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        {joiningId === ev._id ? 'Joining...' : 'Register'}
                      </button>
                    )}
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

export default Events;
