import React, { useState, useEffect } from 'react';

type Currency = 'MAD' | 'EUR';
interface FormatOptions extends Intl.NumberFormatOptions {
  style: 'currency';
  currency: Currency;
}

// Taux de change (à mettre à jour via une API si nécessaire)
const EXCHANGE_RATE = 0.09; // 1 MAD = 0.09 EUR (exemple, à remplacer par le taux réel)

/**
 * Convertit un montant de MAD en EUR
 * @param amount Montant en MAD
 * @returns Montant converti en EUR
 */
export const madToEur = (amount: number): number => {
  return parseFloat((amount * EXCHANGE_RATE).toFixed(2));
};

/**
 * Formate un montant dans une devise donnée (par défaut MAD)
 * @param amount Montant à formater
 * @param currency Devise (MAD ou EUR)
 * @returns Montant formaté avec le symbole de la devise
 */
export const formatMad = (amount: number, currency: Currency = 'MAD'): string => {
  const options: FormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  
  const locale = currency === 'EUR' ? 'fr-FR' : 'fr-MA';
  return new Intl.NumberFormat(locale, options).format(amount);
};

/**
 * Formate un montant en EUR
 * @param amount Montant à formater
 * @returns Montant formaté avec le symbole €
 */
export const formatEur = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Affiche un prix dans les deux devises (MAD et EUR)
 * @param amountMontant en MAD
 * @returns JSX avec les deux formats de prix
 */
export const formatDualCurrency = (amount: number): React.ReactElement => {
  const eurAmount = madToEur(amount);
  return React.createElement(
    'div',
    { className: 'flex flex-col' },
    React.createElement('span', null, formatMad(amount)),
    React.createElement('span', { className: 'text-sm text-gray-500' }, `≈ ${formatEur(eurAmount)}`)
  );
};

/**
 * Hook personnalisé pour gérer les conversions de devise
 */
export const useCurrency = () => {
  const [exchangeRate, setExchangeRate] = useState(EXCHANGE_RATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour mettre à jour le taux de change depuis une API
  const updateExchangeRate = async () => {
    try {
      setLoading(true);
      // Ici, vous pourriez appeler une API pour obtenir le taux de change actuel
      // Par exemple: const response = await fetch('https://api.exchangerate-api.com/v4/latest/MAD');
      // const data = await response.json();
      // setExchangeRate(data.rates.EUR);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du taux de change:', err);
      setError('Impossible de mettre à jour le taux de change. Le taux par défaut sera utilisé.');
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le taux de change au chargement
  useEffect(() => {
    updateExchangeRate();
    // Mettre à jour le taux toutes les heures
    const interval = setInterval(updateExchangeRate, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    madToEur: (amount: number) => madToEur(amount),
    formatMad,
    formatEur,
    formatDualCurrency,
    exchangeRate,
    loading,
    error,
  };
};
