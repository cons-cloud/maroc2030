import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { Euro, CircleDollarSign } from 'lucide-react';

const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, isLoading } = useCurrency();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
        <div className="animate-pulse h-6 w-20 bg-gray-300 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
      <button
        onClick={() => setCurrency('MAD')}
        className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          currency === 'MAD' 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        title="Afficher en Dirhams Marocains"
      >
        <CircleDollarSign className="w-4 h-4 mr-1.5" />
        MAD
      </button>
      
      <div className="h-5 w-px bg-gray-200"></div>
      
      <button
        onClick={() => setCurrency('EUR')}
        className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          currency === 'EUR' 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        title="Afficher en Euros"
      >
        <Euro className="w-4 h-4 mr-1.5" />
        EUR
      </button>
    </div>
  );
};

export default CurrencySelector;
