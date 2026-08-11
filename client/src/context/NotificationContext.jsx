import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Toast trigger
  const showToast = useCallback((title, message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await API.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.notifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  // Load notifications on login
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds for new notifications (optional, keeping it lightweight)
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      const res = await API.put(`/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(prev => 
          prev.map(n => n._id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        showToast('Success', 'Notification marked as read', 'info');
      }
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await API.put('/notifications/read-all');
      if (res.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        showToast('Success', 'All notifications cleared', 'info');
      }
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      toasts,
      showToast,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      setToasts
    }}>
      {children}
      
      {/* Global Toast Render Layer */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgColor = 'bg-emerald-600 dark:bg-emerald-700';
          if (toast.type === 'error') bgColor = 'bg-rose-600 dark:bg-rose-700';
          if (toast.type === 'info') bgColor = 'bg-blue-600 dark:bg-blue-700';
          if (toast.type === 'warning') bgColor = 'bg-amber-600 dark:bg-amber-700';

          return (
            <div
              key={toast.id}
              className={`p-4 rounded-xl shadow-2xl text-white ${bgColor} flex flex-col pointer-events-auto transform translate-y-0 transition-all duration-300 animate-float`}
              style={{ animationDuration: '4s' }}
            >
              <div className="font-bold flex items-center justify-between text-sm md:text-base">
                <span>{toast.title}</span>
                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="ml-4 text-xs bg-black/20 hover:bg-black/40 rounded-full px-2 py-0.5"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs md:text-sm mt-1 opacity-90">{toast.message}</div>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
