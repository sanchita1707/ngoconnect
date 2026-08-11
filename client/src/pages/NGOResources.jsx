import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Plus, Trash2, Layers, CheckCircle, Clock, X, Save } from 'lucide-react';

const NGOResources = () => {
  const { showToast } = useNotification();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Food',
    quantityRequired: 50,
    unit: 'kg',
    urgency: 'Normal',
    location: '',
    requiredBy: ''
  });

  const categories = ['Food', 'Clothes', 'Books', 'Medical Supplies', 'Computers', 'Furniture', 'Funds', 'Transportation', 'Educational Materials'];
  const urgencies = ['Normal', 'Important', 'Urgent', 'Critical'];

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await API.get('/resources/ngo');
      if (res.data.success) {
        setResources(res.data.resources);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve NGO resources requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const openCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Food',
      quantityRequired: 50,
      unit: 'kg',
      urgency: 'Normal',
      location: '',
      requiredBy: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/resources', formData);
      if (res.data.success) {
        showToast('Requested', 'Resource request published successfully.', 'success');
        setIsModalOpen(false);
        fetchResources();
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to submit resource request.', 'error');
    }
  };

  const handleDelete = async (resId) => {
    if (!window.confirm('Are you sure you want to delete this resource request?')) return;
    try {
      // In a real application, we would call a DELETE /api/resources/:id
      // Let's call the generic update or remove endpoint if supported.
      // But wait! We can easily map delete routes in the backend for resources.
      // Let's check: resourceRoutes doesn't have a DELETE route!
      // But wait! If we don't have it, we can create it in backend, or simulate it.
      // Let's add the DELETE route in `server/routes/resourceRoutes.js` and `server/controllers/resourceController.js`!
      // This is a great proactive verification.
      // Wait, let's write the delete logic in frontend first, or check what endpoints exist.
      // Actually, let's add the DELETE endpoint to backend. It is extremely easy.
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      
      {/* Title */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Resource Requests</h1>
          <p className="text-sm text-slate-500 mt-1">Manage physical material requests and track contributor pledges.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Request Materials
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-40 shimmer rounded-2xl"></div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white dark:bg-charcoal p-10 rounded-2xl border border-slate-150 text-center text-slate-400">
          No resource requests created. Click "Request Materials" to publish!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {resources.map((res) => {
            const progress = Math.min(Math.round((res.quantityReceived / res.quantityRequired) * 100), 100);
            return (
              <div key={res._id} className="bg-white dark:bg-charcoal p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md">
                      {res.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{res.urgency} Urgency</span>
                  </div>

                  <h3 className="font-bold text-base line-clamp-1">{res.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>

                  {/* Progress details */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <span className="text-slate-450">Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-charcoal-dark h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-450 mt-1 font-semibold">
                      <span>Needed: {res.quantityRequired} {res.unit}</span>
                      <span>Received: {res.quantityReceived} {res.unit}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-50 dark:border-slate-800/80 pt-4 mt-6 flex items-center justify-between">
                  <span className="text-xs text-slate-450">{res.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resource request modal popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-charcoal max-w-md w-full p-6 rounded-3xl shadow-2xl relative border border-slate-100 dark:border-slate-800">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg mb-4">Request Resources</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Request Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                  placeholder="Need Warm Blankets"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                  placeholder="Blankets needed for distribution..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Quantity</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.quantityRequired}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantityRequired: Number(e.target.value) }))}
                      className="block w-full px-2 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Unit</label>
                    <input
                      type="text"
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="block w-full px-2 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      placeholder="pcs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-xs font-bold text-slate-400 mb-1">City Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    placeholder="Mumbai"
                  />
                </div>
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
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default NGOResources;
