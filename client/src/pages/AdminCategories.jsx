import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Plus, Check, Save } from 'lucide-react';

const AdminCategories = () => {
  const { showToast } = useNotification();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🌱');

  const fetchCats = async () => {
    setLoading(true);
    try {
      const res = await API.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to retrieve cause categories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !icon) return;

    try {
      const res = await API.post('/categories', { name, description, icon });
      if (res.data.success) {
        showToast('Created', 'Cause category created successfully.', 'success');
        setName('');
        setDescription('');
        setIcon('🌱');
        fetchCats(); // reload
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to create category.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Cause Classifications</h1>
        <p className="text-sm text-slate-500 mt-1">Curate available volunteering sectors and social causes.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        
        {/* Form */}
        <div className="md:col-span-2 bg-white dark:bg-charcoal p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm h-fit">
          <h3 className="font-bold text-sm mb-4">Create Category</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Category Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none"
                placeholder="e.g. Tree Plantation"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Short Icon/Emoji</label>
              <input
                type="text"
                required
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                placeholder="🌳"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Brief Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                placeholder="Nature and afforestation drives..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-3 space-y-4">
          <h3 className="font-bold text-base text-slate-400">Available Classifications</h3>
          
          {loading ? (
            <div className="h-40 shimmer rounded-2xl"></div>
          ) : (
            <div className="bg-white dark:bg-charcoal border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-850">
              {categories.map(cat => (
                <div key={cat._id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 leading-tight">{cat.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{cat.description}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-emerald-600 bg-emerald-100/40 px-2 py-0.5 rounded uppercase">
                    {cat.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AdminCategories;
