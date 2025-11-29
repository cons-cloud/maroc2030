import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, Home, Maximize, Bed, Bath, DollarSign, Phone, Mail, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Immobilier {
  id: string;
  title: string;
  description: string;
  type_bien: string;
  transaction_type: string;
  price: number;
  surface: number;
  chambres?: number;
  salles_bain?: number;
  city: string;
  quartier?: string;
  images: string[];
  contact_phone?: string;
  contact_email?: string;
  available: boolean;
  created_at: string;
}

const Immobilier = () => {
  const { toast } = useToast();
  const [biens, setBiens] = useState<Immobilier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');

  useEffect(() => {
    loadBiens();
  }, []);

  const loadBiens = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('immobilier')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBiens(data || []);
    } catch (error) {
      console.error('Error loading immobilier:', error);
      toast.error('Erreur', 'Une erreur est survenue lors du chargement des biens');
    } finally {
      setIsLoading(false);
    }
  };

  const cities = ['all', ...new Set(biens.map(b => b.city))];
  const types = ['all', ...new Set(biens.map(b => b.type_bien))];
  const transactions = ['all', ...new Set(biens.map(b => b.transaction_type))];

  const filteredBiens = biens.filter(b => {
    const cityMatch = selectedCity === 'all' || b.city === selectedCity;
    const typeMatch = selectedType === 'all' || b.type_bien === selectedType;
    const transactionMatch = selectedTransaction === 'all' || b.transaction_type === selectedTransaction;
    
    let priceMatch = true;
    if (priceRange !== 'all') {
      const price = b.price;
      switch (priceRange) {
        case '0-500000':
          priceMatch = price <= 500000;
          break;
        case '500000-1000000':
          priceMatch = price > 500000 && price <= 1000000;
          break;
        case '1000000-2000000':
          priceMatch = price > 1000000 && price <= 2000000;
          break;
        case '2000000+':
          priceMatch = price > 2000000;
          break;
      }
    }
    
    return cityMatch && typeMatch && transactionMatch && priceMatch;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-green-700 text-white py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Immobilier au Maroc
              </h1>
              <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                Trouvez votre bien immobilier idéal
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Filtres */}
          <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Filtres</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">Toutes</option>
                  {cities.filter(c => c !== 'all').map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">Tous</option>
                  {types.filter(t => t !== 'all').map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction</label>
                <select
                  value={selectedTransaction}
                  onChange={(e) => setSelectedTransaction(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">Tous</option>
                  {transactions.filter(t => t !== 'all').map(transaction => (
                    <option key={transaction} value={transaction}>{transaction}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">Tous</option>
                  <option value="0-500000">0 - 500K MAD</option>
                  <option value="500000-1000000">500K - 1M MAD</option>
                  <option value="1000000-2000000">1M - 2M MAD</option>
                  <option value="2000000+">+ 2M MAD</option>
                </select>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              {filteredBiens.length} bien{filteredBiens.length > 1 ? 's' : ''} disponible{filteredBiens.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Liste des biens */}
          {filteredBiens.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Aucun bien disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBiens.map((bien) => (
                <motion.div
                  key={bien.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Image */}
                  <div className="h-64 overflow-hidden relative">
                    <img
                      src={bien.images?.[0] || '/assets/hero/hero1.jpg'}
                      alt={bien.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-indigo-600 text-white rounded-full text-sm font-medium">
                      {bien.transaction_type}
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-600">{bien.type_bien}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {bien.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{bien.quartier ? `${bien.quartier}, ` : ''}{bien.city}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Maximize className="w-4 h-4 mr-2" />
                        <span className="text-sm">{bien.surface} m²</span>
                      </div>
                      {(bien.chambres || bien.salles_bain) && (
                        <div className="flex items-center gap-4 text-gray-600">
                          {bien.chambres && (
                            <div className="flex items-center">
                              <Bed className="w-4 h-4 mr-1" />
                              <span className="text-sm">{bien.chambres}</span>
                            </div>
                          )}
                          {bien.salles_bain && (
                            <div className="flex items-center">
                              <Bath className="w-4 h-4 mr-1" />
                              <span className="text-sm">{bien.salles_bain}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {bien.description}
                    </p>

                    {/* Prix et contact */}
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-2xl font-bold text-indigo-600">
                            {formatPrice(bien.price)} MAD
                          </span>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="space-y-2">
                        {bien.contact_phone && (
                          <a
                            href={`tel:${bien.contact_phone}`}
                            className="flex items-center justify-center w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Appeler
                          </a>
                        )}
                        {bien.contact_email && (
                          <a
                            href={`mailto:${bien.contact_email}`}
                            className="flex items-center justify-center w-full px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Immobilier;
