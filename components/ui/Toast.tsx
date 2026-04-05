'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let _addToast: ((msg: string, type?: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = 'success') {
  _addToast?.(message, type);
}

const ICONS = {
  success: CheckCircle2,
  error:   AlertTriangle,
  info:    Info,
};

const COLORS = {
  success: 'bg-gray-900 border-green-500/40 text-white',
  error:   'bg-gray-900 border-red-500/40 text-white',
  info:    'bg-gray-900 border-blue-500/40 text-white',
};

const ICON_COLORS = {
  success: 'text-green-400',
  error:   'text-red-400',
  info:    'text-blue-400',
};

let _nextId = 0;

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = _nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  useEffect(() => {
    _addToast = addToast;
    return () => { _addToast = null; };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    /* Mobile: üst-sağ (butonları kapatmaz) | Desktop: alt-sağ */
    <div
      role="region"
      aria-live="polite"
      aria-label="Bildirimler"
      className="fixed z-[9999] flex flex-col gap-2 items-end pointer-events-none
        top-5 right-5
        sm:top-auto sm:bottom-5 sm:right-5"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            role="alert"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl text-sm font-medium pointer-events-auto max-w-xs w-full sm:w-auto animate-in slide-in-from-right-5 fade-in duration-300 ${COLORS[t.type]}`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${ICON_COLORS[t.type]}`} aria-hidden="true" />
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              aria-label="Bildirimi kapat"
              className="text-gray-500 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-white/30 rounded"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
