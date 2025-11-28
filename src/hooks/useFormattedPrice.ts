import { useCurrency } from '../contexts/CurrencyContext';

interface PriceOptions {
  showCurrencySymbol?: boolean;
  showOriginal?: boolean;
}
/**
 * Hook personnalisé pour formater les prix dans la devise sélectionnée
 * @param amount Montant à formater
 * @param options Options d'affichage
 * @returns Objet avec le prix formaté et d'autres utilitaires
 */
const useFormattedPrice = (
  amount: number,
  options: PriceOptions = { showCurrencySymbol: true, showOriginal: false }
) => {
  const { format, convert, currency } = useCurrency();
  
  // Formater le montant dans la devise sélectionnée
  const formattedPrice = format(amount, options.showCurrencySymbol);
  
  // Convertir le montant dans l'autre devise si demandé
  const getConvertedPrice = (targetCurrency: 'MAD' | 'EUR') => {
    if (currency === targetCurrency) return formattedPrice;
    return format(convert(amount, currency), options.showCurrencySymbol);
  };

  return {
    formattedPrice,
    originalPrice: options.showOriginal ? format(amount, options.showCurrencySymbol) : null,
    convertedPrice: currency === 'MAD' 
      ? getConvertedPrice('EUR') 
      : getConvertedPrice('MAD'),
    currency,
    isMAD: currency === 'MAD',
    isEUR: currency === 'EUR',
  };
};

export default useFormattedPrice;
