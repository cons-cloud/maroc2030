import { useState, useCallback } from 'react';
import { useToast } from '../components/ui/use-toast';

type ErrorHandlerOptions = {
  showToast?: boolean;
  logToConsole?: boolean;
  toastOptions?: {
    title?: string;
    [key: string]: any;
  };
};

export const useErrorHandler = (defaultOptions: ErrorHandlerOptions = {}) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleError = useCallback(
    (
      err: unknown, 
      customMessage?: string,
      options: ErrorHandlerOptions = {}
    ): string => {
      const {
        showToast = true,
        logToConsole = true,
        toastOptions = {}
      } = { ...defaultOptions, ...options };
      
      let message: string;
      
      if (err instanceof Error) {
        message = customMessage || err.message;
        if (logToConsole) {
          console.error('Error:', {
            message: err.message,
            name: err.name,
            stack: err.stack,
            cause: err.cause
          });
        }
      } else if (typeof err === 'string') {
        message = customMessage || err;
      } else {
        message = customMessage || 'Une erreur inattendue est survenue';
      }
      
      setError(message);
      setIsError(true);
      
      if (showToast) {
        toast.error('Erreur', message);
      }
      
      return message;
    },
    [defaultOptions]
  );

  const resetError = useCallback(() => {
    setError(null);
    setIsError(false);
  }, []);

  return { 
    error, 
    isError,
    handleError, 
    resetError 
  };
};

export default useErrorHandler;
