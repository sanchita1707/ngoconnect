import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Plus, Edit3, Trash2, Calendar, MapPin, X, Save } from 'lucide-react';

const NGOOpportunities = () => {
  const { showToast } = useNotification();
  
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '🌱 Environment',
    requiredSkills: '',
    location: '',
    city: '',
    state: '',
    date: '',
    startTime: '09:00 AM',
    endTime: '01:00 PM',
    volunteersNeeded: 5,
    urgency: 'Normal',
    image: ''
  });

  const categories = ['🌱 Environment', '📚 Education', '❤️ Healthcare', '🍲 Food Support', '👶 Child Welfare', '👵 Elder Care', '🐾 Animal Welfare', '🏘️ Community Development', '🩸 Blood Donation', '🌳 Tree Plantation'];
  const urgencies = ['Normal', 'Important', 'Urgent', 'Critical'];

  const fetchOpps = async () => {
    setLoading(true);
    try {
      const res = await API.get('/opportunities');
      if (res.data.success) {
        // Only load NGO's own opportunities
        // (API getMe returns User profile, but we can verify against logged-in User ID)
        const meRes = await API.get('/auth/me');
        if (meRes.data.success) {
          const myId = meRes.data.user._id;
          setOpportunities(res.data.opportunities.filter(opp => opp.ngoId?._id === myId));
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve opportunities list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpps();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      category: '🌱 Environment',
      requiredSkills: '',
      location: '',
      city: '',
      state: '',
      date: '',
      startTime: '09:00 AM',
      endTime: '01:00 PM',
      volunteersNeeded: 5,
      urgency: 'Normal',
      image: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (opp) => {
    setEditingId(opp._id);
    // Format date string to YYYY-MM-DD for input element
    const fDate = new Date(opp.date).toISOString().split('T')[0];
    setFormData({
      title: opp.title,
      description: opp.description,
      category: opp.category,
      requiredSkills: opp.requiredSkills.join(', '),
      location: opp.location,
      city: opp.city,
      state: opp.state,
      date: fDate,
      startTime: opp.startTime,
      endTime: opp.endTime,
      volunteersNeeded: opp.volunteersNeeded,
      urgency: opp.urgency,
      image: opp.image
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const skillsArray = formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const postBody = { ...formData, requiredSkills: skillsArray };

    try {
      if (editingId) {
        const res = await API.put(`/opportunities/${editingId}`, postBody);
        if (res.data.success) {
          showToast('Updated', 'Opportunity updated successfully.', 'success');
        }
      } else {
        const res = await API.post('/opportunities', postBody);
        if (res.data.success) {
          showToast('Published', 'Opportunity posted successfully.', 'success');
        }
      }
      setIsModalOpen(false);
      fetchOpps();
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to publish opportunity details.', 'error');
    }
  };

  const handleDelete = async (oppId) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      const res = await API.delete(`/opportunities/${oppId}`);
      if (res.data.success) {
        showToast('Deleted', 'Opportunity deleted successfully.', 'info');
        fetchOpps();
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to delete opportunity.', 'error');
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      
      {/* Title */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage Opportunities</h1>
          <p className="text-sm text-slate-500 mt-1">Review, update, or publish volunteering sessions for your organization.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Opening
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-40 shimmer rounded-2xl"></div>
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white dark:bg-charcoal p-10 rounded-2xl border border-slate-150 text-center text-slate-400">
          No opportunities published yet. Click "Create Opening" to get started!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
            <div key={opp._id} className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative group">
              <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {opp.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{opp.urgency} Urgency</span>
                </div>

                <h3 className="font-bold text-base line-clamp-1">{opp.title}</h3>
                
                <div className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {opp.location}</p>
                  <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {new Date(opp.date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-50 dark:border-slate-800/80 pt-4 mt-6 flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold text-slate-400">Joined: {opp.volunteersJoined} / {opp.volunteersNeeded}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(opp)}
                    className="p-2 border border-slate-200 dark:border-slate-700 hover:border-primary text-primary rounded-xl transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(opp._id)}
                    className="p-2 border border-slate-200 dark:border-slate-700 hover:border-rose-500 text-rose-500 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Modal Form Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-charcoal max-w-2xl w-full p-6 rounded-3xl shadow-2xl relative border border-slate-100 dark:border-slate-800 my-8">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg mb-4">{editingId ? 'Edit Opportunity' : 'Create New Opportunity'}</h3>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Opportunity Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                    placeholder="Weekend Clean Drive"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Cause Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Detailed Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                  placeholder="Summarize the activities..."
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Street Address / Venue</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    placeholder="Cross Road Center"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      placeholder="MH"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
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
                  <label className="block text-xs font-bold text-slate-400 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    placeholder="09:00 AM"
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

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Volunteers Needed</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.volunteersNeeded}
                    onChange={(e) => setFormData(prev => ({ ...prev, volunteersNeeded: Number(e.target.value) }))}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Urgency</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    placeholder="https://image..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiredSkills: e.target.value }))}
                  className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  placeholder="Teaching, Patience, Painting..."
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
                  <span>{editingId ? 'Save Changes' : 'Publish Opportunity'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default NGOOpportunities;
