import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  className?: string;
}

const variants = {
  primary:   'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm focus:ring-blue-500',
  secondary: 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 focus:ring-gray-400',
  outline:   'border border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-500',
  ghost:     'text-gray-600 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-400',
  danger:    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm focus:ring-red-500',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

const BASE = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  disabled = false,
  type = 'button',
  'aria-label': ariaLabel,
  className = '',
}: ButtonProps) {
  const cls = `${BASE} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cls}
    >
      {children}
    </button>
  );
}
