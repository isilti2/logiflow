'use client';

import { AlertTriangle, X, CheckCircle, Info } from 'lucide-react';

type AlertType = 'error' | 'success' | 'info';

interface ErrorAlertProps {
  message: string;
  type?: AlertType;
  onDismiss?: () => void;
  className?: string;
}

const styles: Record<AlertType, { container: string; icon: string; text: string }> = {
  error: {
    container: 'bg-red-50 border-red-200 text-red-700',
    icon: 'text-red-500',
    text: 'text-red-700',
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-700',
    icon: 'text-green-500',
    text: 'text-green-700',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-700',
    icon: 'text-blue-500',
    text: 'text-blue-700',
  },
};

const icons: Record<AlertType, React.ReactNode> = {
  error: <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />,
  success: <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />,
  info: <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />,
};

export function ErrorAlert({ message, type = 'error', onDismiss, className = '' }: ErrorAlertProps) {
  const s = styles[type];
  return (
    <div
      role="alert"
      className={`border rounded-xl px-4 py-3 text-sm flex items-start gap-2 ${s.container} ${className}`}
    >
      <span className={s.icon}>{icons[type]}</span>
      <span className={`flex-1 ${s.text}`}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Uyarıyı kapat"
          className={`shrink-0 hover:opacity-70 transition-opacity ${s.icon}`}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
