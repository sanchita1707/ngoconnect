import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const { showToast } = useNotification();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Message Sent', 'Thank you! We will get back to you shortly.', 'success');
      setFormData({ name: '', email: '', message: '' });
    }, 1000);
  };

  return (
    <div className="bg-slate-50 dark:bg-charcoal-dark min-h-screen py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight">Contact Us</h1>
          <p className="mt-3 text-slate-500 font-medium">Have questions or feedback? Get in touch with our team.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          
          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-charcoal p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="font-bold text-lg">Support Channels</h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-bold">Email</p>
                    <p className="text-slate-500 mt-0.5">support@ngoconnect.org</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-bold">Phone</p>
                    <p className="text-slate-500 mt-0.5">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-bold">Location</p>
                    <p className="text-slate-500 mt-0.5">NGOConnect HQ, Tech Park, Mumbai, India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3 bg-white dark:bg-charcoal p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Message</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-charcoal-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;
