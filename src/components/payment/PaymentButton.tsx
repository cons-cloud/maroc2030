import React from 'react';
import { Loader2 } from 'lucide-react';

interface PaymentButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  children,
  isLoading = false,
  icon,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={`
        w-full flex items-center justify-center px-4 py-2 rounded-md
        bg-blue-600 text-white font-medium
        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
          Traitement...
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default PaymentButton;
