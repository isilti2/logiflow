'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCheck, Trash2, Zap, AlertTriangle, Info, X } from 'lucide-react';
import type { AppNotification } from '@/lib/notifications';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} sa önce`;
  return `${Math.floor(hrs / 24)} gün önce`;
}

const TYPE_STYLE: Record<AppNotification['type'], { icon: React.ReactNode; ring: string }> = {
  success: {
    icon: <Zap className="w-4 h-4 text-emerald-600" />,
    ring: 'bg-emerald-50 border-emerald-100',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    ring: 'bg-amber-50 border-amber-100',
  },
  info: {
    icon: <Info className="w-4 h-4 text-blue-500" />,
    ring: 'bg-blue-50 border-blue-100',
  },
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) setNotifs(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const unread = notifs.filter((n) => !n.read).length;

  async function handleMarkAll() {
    await Promise.all(
      notifs.filter((n) => !n.read).map((n) =>
        fetch(`/api/notifications/${n.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true }),
        })
      )
    );
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function handleClear() {
    await fetch('/api/notifications', { method: 'DELETE' });
    setNotifs([]);
  }

  async function handleRead(id: string) {
    await fetch(`/api/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    });
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-blue-600 transition-colors"
        aria-label="Bildirimler"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              Bildirimler
              {unread > 0 && (
                <span className="ml-2 text-xs font-semibold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                  {unread} yeni
                </span>
              )}
            </span>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  title="Tümünü okundu işaretle"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              {notifs.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  title="Tümünü temizle"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 p-1 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                <Bell className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs font-medium">Henüz bildirim yok</p>
              </div>
            ) : (
              notifs.map((n) => {
                const style = TYPE_STYLE[n.type];
                return (
                  <button
                    key={n.id}
                    onClick={() => handleRead(n.id)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${style.ring}`}>
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'} leading-snug`}>
                          {n.title}
                        </p>
                        {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.time)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
