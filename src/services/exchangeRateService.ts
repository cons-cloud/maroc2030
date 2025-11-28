import { supabase } from '../lib/supabase';

type ExchangeRates = {
  MAD: number;
  EUR: number;
  lastUpdated: string;
};

const EXCHANGE_RATE_KEY = 'exchange_rates';
const CACHE_DURATION = 3600000; // 1 heure en millisecondes

/**
 * Service pour gérer les taux de change
 */
export const exchangeRateService = {
  /**
   * Récupère les taux de change actuels depuis l'API ou le cache
   */
  async getExchangeRates(): Promise<ExchangeRates> {
    // Vérifier d'abord le cache local
    const cachedRates = this.getCachedRates();
    if (cachedRates && !this.isCacheExpired(cachedRates.lastUpdated)) {
      return cachedRates;
    }

    try {
      // Récupérer les taux depuis l'API (exemple avec une table Supabase)
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('base_currency', 'MAD')
        .single();

      if (error) throw error;

      const rates: ExchangeRates = {
        MAD: 1, // Taux de base
        EUR: data.eur_rate || 0.09, // Valeur par défaut si non définie
        lastUpdated: new Date().toISOString(),
      };

      // Mettre en cache les taux
      this.cacheRates(rates);
      return rates;
    } catch (error) {
      console.error('Erreur lors de la récupération des taux de change:', error);
      // Retourner les taux en cache même s'ils sont expirés en cas d'erreur
      return cachedRates || this.getDefaultRates();
    }
  },

  /**
   * Récupère le taux de change d'une devise spécifique
   */
  async getRate(currency: 'MAD' | 'EUR'): Promise<number> {
    const rates = await this.getExchangeRates();
    return rates[currency];
  },

  /**
   * Convertit un montant d'une devise à une autre
   */
  async convert(amount: number, from: 'MAD' | 'EUR', to: 'MAD' | 'EUR'): Promise<number> {
    if (from === to) return amount;
    
    const rates = await this.getExchangeRates();
    
    // Conversion via MAD comme devise de base
    if (from === 'MAD') {
      return parseFloat((amount * rates[to]).toFixed(2));
    } else {
      return parseFloat(((amount / rates[from]) * rates[to]).toFixed(2));
    }
  },

  // Méthodes utilitaires
  getCachedRates(): ExchangeRates | null {
    if (typeof window === 'undefined') return null;
    
    const cached = localStorage.getItem(EXCHANGE_RATE_KEY);
    return cached ? JSON.parse(cached) : null;
  },

  cacheRates(rates: ExchangeRates): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(EXCHANGE_RATE_KEY, JSON.stringify({
      ...rates,
      lastUpdated: new Date().toISOString(),
    }));
  },

  isCacheExpired(lastUpdated: string): boolean {
    if (!lastUpdated) return true;
    
    const lastUpdatedDate = new Date(lastUpdated);
    const now = new Date();
    return now.getTime() - lastUpdatedDate.getTime() > CACHE_DURATION;
  },

  getDefaultRates(): ExchangeRates {
    return {
      MAD: 1,
      EUR: 0.09, // Taux par défaut
      lastUpdated: new Date().toISOString(),
    };
  },
};

export default exchangeRateService;
