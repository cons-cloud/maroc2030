import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AuthGuard from '../../components/AuthGuard';
import UniversalBookingForm from '../../components/UniversalBookingForm';
import { MapPin, Calendar, Clock, Users, Tag, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';

interface Evenement {
  id: string;
  title: string;
  description: string;
  type: string;
  date_debut: string;
  date_fin?: string;
  lieu: string;
  city: string;
  price: number;
  max_participants?: number;
  images: string[];
  available: boolean;
  organizer?: string;
  created_at: string;
}

const Evenements = () => {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvenement, setSelectedEvenement] = useState<Evenement | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadEvenements();
  }, []);

  const loadEvenements = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('evenements')
        .select('*')
        .eq('available', true)
        .order('date_debut', { ascending: true });

      if (error) throw error;
      setEvenements(data || []);
    } catch (error) {
      console.error('Error loading evenements:', error);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setIsLoading(false);
    }
  };

  const cities = ['all', ...new Set(evenements.map(e => e.city))];
  const types = ['all', ...new Set(evenements.map(e => e.type))];
  
  const filteredEvenements = evenements.filter(e => {
    const cityMatch = selectedCity === 'all' || e.city === selectedCity;
    const typeMatch = selectedType === 'all' || e.type === selectedType;
    return cityMatch && typeMatch;
  });

  const handleBookEvenement = (evenement: Evenement) => {
    setSelectedEvenement(evenement);
    setShowBookingForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
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
        <div className="bg-gradient-to-r from-purple-600 to-pink-700 text-white py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Événements au Maroc
              </h1>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                Découvrez les événements culturels et festifs
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Filtres */}
          <div className="mb-8 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="font-medium text-gray-700">Ville :</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Toutes</option>
                {cities.filter(c => c !== 'all').map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-medium text-gray-700">Type :</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Tous</option>
                {types.filter(t => t !== 'all').map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <span className="text-gray-600">
              {filteredEvenements.length} événement{filteredEvenements.length > 1 ? 's' : ''} disponible{filteredEvenements.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Liste des événements */}
          {filteredEvenements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Aucun événement disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvenements.map((evenement) => (
                <motion.div
                  key={evenement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Image */}
                  <div className="h-64 overflow-hidden relative">
                    <img
                      src={evenement.images?.[0] || '/assets/hero/hero1.jpg'}
                      alt={evenement.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {isUpcoming(evenement.date_debut) && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                        À venir
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-600">{evenement.type}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {evenement.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm">{formatDate(evenement.date_debut)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{evenement.lieu}, {evenement.city}</span>
                      </div>
                      {evenement.max_participants && (
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span className="text-sm">Max {evenement.max_participants} personnes</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {evenement.description}
                    </p>

                    {evenement.organizer && (
                      <div className="mb-4 text-sm text-gray-500">
                        Organisé par : <span className="font-medium">{evenement.organizer}</span>
                      </div>
                    )}

                    {/* Prix et bouton */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <span className="text-2xl font-bold text-purple-600">
                          {evenement.price} MAD
                        </span>
                        <span className="text-gray-500 text-sm"> / billet</span>
                      </div>
                      <AuthGuard>
                        <button
                          onClick={() => handleBookEvenement(evenement)}
                          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                        >
                          <Ticket className="w-4 h-4" />
                          Réserver
                        </button>
                      </AuthGuard>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Formulaire de réservation */}
      {showBookingForm && selectedEvenement && (
        <UniversalBookingForm
          service={{
            id: selectedEvenement.id,
            title: selectedEvenement.title,
            price: selectedEvenement.price,
          }}
          serviceType="evenement"
          onClose={() => {
            setShowBookingForm(false);
            setSelectedEvenement(null);
          }}
        />
      )}

      <Footer />
    </>
  );
};

export default Evenements;
