import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Plus, X, Save, Calendar, Clock, MapPin } from 'lucide-react';

const NGOEvents = () => {
  const { showToast } = useNotification();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    location: '',
    capacity: 30
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await API.get('/events/ngo');
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve NGO events list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/events', formData);
      if (res.data.success) {
        showToast('Scheduled', 'Event scheduled successfully.', 'success');
        setIsModalOpen(false);
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Event scheduling failed.', 'error');
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      
      {/* Title */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Organization Events</h1>
          <p className="text-sm text-slate-500 mt-1">Schedule and manage seminars, training sessions, or webinars for volunteers.</p>
        </div>
        <button
          onClick={() => {
            setFormData({ title: '', description: '', date: '', startTime: '10:00 AM', endTime: '01:00 PM', location: '', capacity: 30 });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Schedule Event
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-40 shimmer rounded-2xl"></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white dark:bg-charcoal p-10 rounded-2xl border border-slate-150 text-center text-slate-400">
          No events scheduled yet. Click "Schedule Event" to list!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {events.map((ev) => (
            <div key={ev._id} className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <h3 className="font-bold text-base">{ev.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{ev.description}</p>
                <div className="text-xs text-slate-400 dark:text-slate-550 space-y-1 pt-2 font-semibold">
                  <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Date: {new Date(ev.date).toLocaleDateString()}</p>
                  <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Time: {ev.startTime} - {ev.endTime}</p>
                  <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Location: {ev.location}</p>
                </div>
              </div>

              <div className="border-t border-slate-50 dark:border-slate-800/80 pt-4 mt-6 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                <span>Capacity: {ev.capacity} Seats</span>
                <span>Registrations: {ev.attendees?.length || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event request modal popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-charcoal max-w-md w-full p-6 rounded-3xl shadow-2xl relative border border-slate-100 dark:border-slate-800">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg mb-4">Schedule Event</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                  placeholder="Volunteer Training Workshop"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Event Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                  placeholder="Summarize the agenda..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Capacity Seats</label>
                  <input
                    type="number"
                    min={5}
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    placeholder="10:00 AM"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    placeholder="01:00 PM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Location Venue</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  placeholder="Online Zoom, office auditorium..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Schedule Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default NGOEvents;
