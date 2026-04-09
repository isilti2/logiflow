import { Check } from 'lucide-react';

interface CheckmarkItemProps {
  text: string;
  className?: string;
}

export default function CheckmarkItem({ text, className = '' }: CheckmarkItemProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
        <Check className="w-3 h-3 text-blue-600 stroke-[3]" />
      </div>
      <span className="text-gray-700 dark:text-gray-200 text-sm md:text-base">{text}</span>
    </div>
  );
}
