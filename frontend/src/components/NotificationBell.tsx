import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, Check } from 'lucide-react';
import { api } from '../api.ts';
import { Notification } from '../types.ts';
import { motion, AnimatePresence } from 'motion/react';

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success && res.notifications) {
        setNotifications(res.notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (e: any) {
      // Silently ignore polling errors to prevent console spam during server restarts or network drops
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col"
            >
              <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1">
                    <Check size={12} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">No notifications yet.</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 ${!n.isRead ? 'bg-indigo-50/30' : ''}`}>
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-500" /> :
                         n.type === 'warning' ? <AlertCircle size={16} className="text-amber-500" /> :
                         <Info size={16} className="text-indigo-500" />}
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>{n.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {!n.isRead && (
                        <button onClick={() => handleMarkAsRead(n.id)} className="shrink-0 p-1 rounded hover:bg-indigo-100 text-indigo-600 self-start">
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
