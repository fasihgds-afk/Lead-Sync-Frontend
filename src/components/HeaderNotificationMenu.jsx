import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiFileText, FiAlertCircle, FiCheckCircle, FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { writerAPI } from '../api/writer.api';
import { metaLeadAPI } from '../api/metaLeadAPI';

export default function HeaderNotificationMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const role = String(user?.role || user?.department || '').toLowerCase();
  const isWriter = role.includes('writer');
  const isAdmin = role.includes('admin') || role.includes('super');

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items = [];

      // If writer or admin, fetch active writer leads
      if (isWriter || isAdmin) {
        try {
          const writerData = await writerAPI.getAllLeads({ limit: 10, leadType: 'NORMAL' });
          const leads = writerData?.leads || [];

          leads.forEach((lead) => {
            const isDueSoon = lead.adminAssignedDate && new Date(lead.adminAssignedDate).getTime() - Date.now() < 48 * 3600 * 1000;
            items.push({
              id: `writer-${lead._id}`,
              title: 'Normal Writer Lead',
              message: `${lead.fullName || lead.name || 'Lead'} is active in WRITER stage (${lead.writerStatus || 'PENDING'}).`,
              time: lead.writerVisibleAt ? new Date(lead.writerVisibleAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
              type: isDueSoon ? 'warning' : 'info',
              link: isWriter ? '/gds/writer' : '/gds/admin/pending-leads',
              read: false,
            });
          });
        } catch {
          // ignore error if unauthorized for writer endpoint
        }
      }

      // If admin/superadmin, fetch paid leads awaiting processing
      if (isAdmin) {
        try {
          const paidData = await metaLeadAPI.getPaidLeads({ limit: 5 });
          const paidLeads = paidData?.leads || [];

          paidLeads.forEach((lead) => {
            if (lead.stage === 'ADMIN_REVIEW' || lead.stage === 'MANAGER') {
              items.push({
                id: `paid-${lead._id}`,
                title: 'Paid Lead Awaiting Writer',
                message: `Lead "${lead.fullName}" status is PAID and ready to be processed for writers.`,
                time: lead.updatedAt ? new Date(lead.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
                type: 'success',
                link: '/gds/admin/paid-leads',
                read: false,
              });
            }
          });
        } catch {
          // ignore
        }
      }

      setNotifications(items);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user, isWriter, isAdmin]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] transition-all duration-300 border border-[var(--border-primary)] shadow-sm text-[var(--text-primary)] focus:outline-none"
        title="Notifications"
      >
        <FiBell className="w-5 h-5 text-[var(--text-primary)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[var(--bg-secondary)] border border-black/10 shadow-2xl z-[100] overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-4 border-b border-black/10 flex items-center justify-between bg-black/5">
            <div className="flex items-center gap-2">
              <FiBell className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="p-1 rounded-lg hover:bg-black/10 text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh"
              >
                <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-blue-500 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-black/5 text-xs">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <FiRefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                <p className="text-xs font-medium">Checking notifications…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <FiCheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                <p className="text-xs font-medium">No new notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                    notif.read ? 'opacity-60 hover:bg-black/5' : 'bg-blue-50/20 dark:bg-gray-800/40 hover:bg-blue-50/40'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    notif.type === 'warning'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : notif.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  }`}>
                    {notif.type === 'warning' ? <FiAlertCircle className="w-4 h-4" /> : <FiFileText className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[var(--text-primary)] truncate">{notif.title}</span>
                      <span className="text-[10px] font-mono text-gray-400 shrink-0">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-2">{notif.message}</p>
                  </div>

                  <FiExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0 self-center" />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
