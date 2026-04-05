import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-14 px-6 text-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-300" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-bold text-gray-700 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed max-w-xs mb-5">{description}</p>
      {action && (
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {action.href ? (
            <Link
              href={action.href}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {secondaryAction.label} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
