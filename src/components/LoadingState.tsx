import React from 'react';

interface LoadingStateProps {
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  fullScreen = false, 
  text = "Chargement en cours...",
  className = ''
}) => (
  <div 
    className={`flex flex-col items-center justify-center ${
      fullScreen ? 'min-h-screen' : 'py-12'
    } ${className}`}
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div 
      className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"
      aria-hidden="true"
    />
    <p className="text-gray-600">{text}</p>
  </div>
);

export default LoadingState;
