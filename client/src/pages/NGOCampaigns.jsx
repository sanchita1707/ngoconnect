import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Plus, X, Save, Calendar, Landmark } from 'lucide-react';

const NGOCampaigns = () => {
  const { showToast } = useNotification();
  
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    startDate: '',
    endDate: '',
    image: ''
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await API.get('/campaigns/ngo');
      if (res.data.success) {
        setCampaigns(res.data.campaigns);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve NGO campaigns.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/campaigns', formData);
      if (res.data.success) {
        showToast('Created', 'Campaign launched successfully.', 'success');
        setIsModalOpen(false);
        fetchCampaigns();
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Campaign creation failed.', 'error');
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      
      {/* Title */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Social Campaigns</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage fundraising or support drives for your organization.</p>
        </div>
        <button
          onClick={() => {
            setFormData({ title: '', description: '', goal: '', startDate: '', endDate: '', image: '' });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Launch Campaign
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-40 shimmer rounded-2xl"></div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white dark:bg-charcoal p-10 rounded-2xl border border-slate-150 text-center text-slate-400">
          No campaigns launched yet. Click "Launch Campaign" to post!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {campaigns.map((camp) => (
            <div key={camp._id} className="bg-white dark:bg-charcoal rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="p-5">
                <h3 className="font-bold text-base">{camp.title}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{camp.description}</p>
                <div className="mt-4 p-3 bg-slate-50 dark:bg-charcoal-dark/50 rounded-xl text-xs font-semibold">
                  <p className="text-slate-400 uppercase tracking-widest text-[9px]">Campaign Goal</p>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5">{camp.goal}</p>
                </div>
              </div>

              <div className="p-5 border-t border-slate-50 dark:border-slate-800/80 pt-3 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span>Ends: {new Date(camp.endDate).toLocaleDateString()}</span>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">{camp.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Campaign request modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-charcoal max-w-md w-full p-6 rounded-3xl shadow-2xl relative border border-slate-100 dark:border-slate-800">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg mb-4">Launch Campaign</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                  placeholder="Winter Cloth Donation"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Campaign Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                  placeholder="Need clothes to distribute..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Objective Goal Description</label>
                <input
                  type="text"
                  required
                  value={formData.goal}
                  onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                  className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  placeholder="e.g. 500 Blankets Distributed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
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
                  <span>Launch Campaign</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default NGOCampaigns;
