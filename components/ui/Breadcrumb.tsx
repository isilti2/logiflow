import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="Sayfa yolu" className={`flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 ${className}`}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300" aria-hidden="true" />}
            {isLast || !item.href ? (
              <span className={isLast ? 'font-semibold text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-blue-600 transition-colors">
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
