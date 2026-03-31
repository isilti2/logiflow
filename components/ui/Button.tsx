import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  className?: string;
}

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
  ghost: 'text-gray-600 hover:text-blue-600',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className = '',
}: ButtonProps) {
  const base = `inline-flex items-center justify-center font-medium rounded-lg transition-colors ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return <Link href={href} className={base}>{children}</Link>;
  }

  return (
    <button onClick={onClick} className={base}>
      {children}
    </button>
  );
}
