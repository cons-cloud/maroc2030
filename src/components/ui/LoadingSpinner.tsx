import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  text?: string;
}

export const LoadingSpinner = ({
  size = 24,
  className = '',
  text = 'Chargement...',
}: LoadingSpinnerProps) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 className="animate-spin text-emerald-600" size={size} />
      {text && <span className="text-sm text-gray-500">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
