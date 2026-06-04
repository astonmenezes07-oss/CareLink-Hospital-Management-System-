'use client';

import { useEffect, useState } from 'react';
import { initStore, getSession, getNotifications, markNotificationRead } from '@/lib/store';
import type { Notification } from '@/types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const ICONS: Record<string, string> = {
  appointment_confirmed: '✅',
  queue_update: '📊',
  priority_changed: '⚡',
  appointment_reminder: '⏰',
  emergency_alert: '🚨',
  treatment_complete: '💚',
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    initStore();
    load();
  }, []);

  const load = () => {
    const s = getSession();
    if (!s) return;
    setNotifs(getNotifications(s.userId));
  };

  const markRead = (id: string) => {
    markNotificationRead(id);
    load();
  };

  const markAllRead = () => {
    notifs.filter((n) => !n.read).forEach((n) => markNotificationRead(n.id));
    load();
  };

  const filtered = filter === 'unread' ? notifs.filter((n) => !n.read) : notifs;
  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-brand font-medium hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-surface-secondary rounded-xl p-1 w-fit">
        {(['all', 'unread'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}>
            {f === 'all' ? `All (${notifs.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center">
          <p className="text-3xl mb-3">🔔</p>
          <p className="text-sm text-text-muted">{filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                n.read ? 'bg-white border-border/30' : 'bg-brand-50/50 border-brand/10 hover:bg-brand-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">{ICONS[n.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${n.read ? 'text-text-secondary' : 'text-text-primary'}`}>{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-brand flex-shrink-0" />}
                  </div>
                  <p className={`text-xs mt-0.5 ${n.read ? 'text-text-muted' : 'text-text-secondary'}`}>{n.message}</p>
                  <p className="text-[10px] text-text-muted mt-1.5">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
