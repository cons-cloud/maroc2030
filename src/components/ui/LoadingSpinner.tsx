import { Loader2 } from 'lucide-react';
import type { FC } from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  text?: string;
}

const sizeMap = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
} as const;

const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text = 'Chargement...',
}) => {
  const loaderSize = typeof size === 'string' ? sizeMap[size] : size;

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 
        className="animate-spin text-emerald-600" 
        size={loaderSize}
      />
      {text && <span className="text-sm text-gray-500">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
export { LoadingSpinner as Spinner };
