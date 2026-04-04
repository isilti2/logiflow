interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
  };
  return (
    <div
      role="status"
      aria-label="Yükleniyor"
      className={`${sizes[size]} border-blue-600/20 border-t-blue-600 rounded-full animate-spin ${className}`}
    />
  );
}
