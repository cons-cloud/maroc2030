import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import exchangeRateService from '../services/exchangeRateService';

type Currency = 'MAD' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  format: (amount: number, showCurrencySymbol?: boolean) => string;
  convert: (amount: number, from: Currency) => number;
  getCurrencySymbol: () => string;
  isLoading: boolean;
  error: string | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('MAD');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger la devise sauvegardée au démarrage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency') as Currency | null;
    if (savedCurrency && (savedCurrency === 'MAD' || savedCurrency === 'EUR')) {
      setCurrency(savedCurrency);
    }
    setIsLoading(false);
  }, []);

  // Sauvegarder la devise sélectionnée
  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  // Formater un montant dans la devise sélectionnée
  const format = (amount: number, showCurrencySymbol = true): string => {
    if (isNaN(amount)) return '0,00';

    const formatter = new Intl.NumberFormat(currency === 'EUR' ? 'fr-FR' : 'fr-MA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (!showCurrencySymbol) {
      return formatter.format(amount).replace(/[^\d,.-]/g, '').trim();
    }
    
    return formatter.format(amount);
  };

  // Convertir un montant d'une devise à la devise sélectionnée
  const convert = (amount: number, from: Currency): number => {
    if (from === currency) return amount;
    
    // Pour l'instant on utilise une conversion simple
    // En production, il faudrait utiliser le service de taux de change
    if (from === 'MAD' && currency === 'EUR') {
      return amount * 0.09; // Exemple de conversion
    } else if (from === 'EUR' && currency === 'MAD') {
      return amount / 0.09; // Exemple de conversion
    }
    
    return amount;
  };

  // Obtenir le symbole de la devise
  const getCurrencySymbol = (): string => {
    return currency === 'MAD' ? 'MAD' : '€';
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        format,
        convert,
        getCurrencySymbol,
        isLoading,
        error,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;
