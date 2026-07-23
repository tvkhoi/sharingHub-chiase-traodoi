import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { socketService } from '../../services/socket.service';
import type { AppNotification } from '../../types';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, Trash2, MessageSquare, CheckCircle2, XCircle, Repeat, ShieldAlert, ArrowRight } from 'lucide-react';

export const NotificationDropdown: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const storageKey = user ? `notifications_${user.nguoi_dung_id}` : null;

  // Load persisted notifications from LocalStorage
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Lỗi tải thông báo từ LocalStorage:', e);
    }
  }, [storageKey]);

  // Save notifications to LocalStorage on change
  const saveNotifications = (newNotifs: AppNotification[]) => {
    setNotifications(newNotifs);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newNotifs.slice(0, 50))); // Keep latest 50
      } catch (e) {
        console.error('Lỗi lưu thông báo:', e);
      }
    }
  };

  // Connect socket and listen for real-time notifications
  useEffect(() => {
    if (!user) return;

    // Join user socket channel
    socketService.joinUserRoom(user.nguoi_dung_id);

    // Register callback for push_notification
    socketService.onPushNotification((notif: AppNotification) => {
      setNotifications((prev) => {
        const updated = [notif, ...prev.filter((n) => n.id !== notif.id)];
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(updated.slice(0, 50)));
        }
        return updated;
      });

      // Show sleek real-time toast alert
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full glass-panel p-4 rounded-2xl shadow-2xl pointer-events-auto flex items-start gap-3 border border-indigo-500/30 cursor-pointer`}
          onClick={() => {
            toast.dismiss(t.id);
            if (notif.link) navigate(notif.link);
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            {getNotificationIcon(notif.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-primary flex items-center justify-between">
              <span>{notif.title}</span>
              <span className="text-[10px] text-brand-emerald font-normal">Vừa xong</span>
            </h4>
            <p className="text-xs text-secondary mt-1 leading-snug line-clamp-2">{notif.message}</p>
            {notif.link && (
              <span className="text-[11px] text-brand-primary font-semibold flex items-center gap-1 mt-2 hover:underline">
                Xem chi tiết <ArrowRight className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>
      ), { duration: 5000 });
    });
  }, [user, storageKey, navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  const handleItemClick = (notif: AppNotification) => {
    const updated = notifications.map((n) => (n.id === notif.id ? { ...n, read: true } : n));
    saveNotifications(updated);
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'NEW_PROPOSAL':
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case 'PROPOSAL_ACCEPTED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'PROPOSAL_REJECTED':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'TRANSACTION_UPDATED':
        return <Repeat className="w-4 h-4 text-amber-400" />;
      case 'ASSET_MODERATED':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-400" />;
    }
  }

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl border border-color bg-card-hover hover:border-accent text-secondary hover:text-primary transition-all cursor-pointer focus:outline-none"
        title="Thông báo hệ thống"
      >
        <Bell className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 animate-pulse shadow-lg ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl border border-color z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-3.5 border-b border-color flex items-center justify-between bg-card">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-primary">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="badge badge-indigo text-[10px] py-0.5 px-2">
                  {unreadCount} mới
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-secondary hover:text-brand-primary flex items-center gap-1 transition-colors"
                  title="Đánh dấu tất cả đã đọc"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Đọc hết
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-muted hover:text-rose-400 flex items-center gap-1 transition-colors ml-1"
                  title="Xóa tất cả thông báo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/20">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Bạn chưa có thông báo nào
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    notif.read ? 'bg-transparent hover:bg-card-hover opacity-75' : 'bg-indigo-500/5 hover:bg-indigo-500/10'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className={`text-xs font-bold ${notif.read ? 'text-secondary' : 'text-primary'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-muted whitespace-nowrap ml-2">
                        {new Date(notif.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-secondary leading-relaxed line-clamp-2">{notif.message}</p>
                  </div>

                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
