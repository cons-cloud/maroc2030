import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AuthGuard from '../../components/AuthGuard';
import UniversalBookingForm from '../../components/UniversalBookingForm';
import { MapPin, Clock, Users, Calendar, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

interface Activite {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: string;
  max_participants: number;
  price: number;
  city: string;
  images: string[];
  available: boolean;
  difficulty_level?: string;
  included?: string[];
  created_at: string;
}

const Activites = () => {
  const [activites, setActivites] = useState<Activite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActivite, setSelectedActivite] = useState<Activite | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadActivites();
  }, []);

  const loadActivites = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('activites_touristiques')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivites(data || []);
    } catch (error) {
      console.error('Error loading activites:', error);
      toast.error('Erreur lors du chargement des activités');
    } finally {
      setIsLoading(false);
    }
  };

  const cities = ['all', ...new Set(activites.map(a => a.city))];
  const types = ['all', ...new Set(activites.map(a => a.type))];
  
  const filteredActivites = activites.filter(a => {
    const cityMatch = selectedCity === 'all' || a.city === selectedCity;
    const typeMatch = selectedType === 'all' || a.type === selectedType;
    return cityMatch && typeMatch;
  });

  const handleBookActivite = (activite: Activite) => {
    setSelectedActivite(activite);
    setShowBookingForm(true);
  };

  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'facile': return 'bg-green-100 text-green-700';
      case 'moyen': return 'bg-yellow-100 text-yellow-700';
      case 'difficile': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
        <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Activités Touristiques
              </h1>
              <p className="text-xl text-green-100 max-w-2xl mx-auto">
                Vivez des expériences inoubliables au Maroc
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tous</option>
                {types.filter(t => t !== 'all').map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <span className="text-gray-600">
              {filteredActivites.length} activité{filteredActivites.length > 1 ? 's' : ''} disponible{filteredActivites.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Liste des activités */}
          {filteredActivites.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Aucune activité disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredActivites.map((activite) => (
                <motion.div
                  key={activite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Image */}
                  <div className="h-64 overflow-hidden relative">
                    <img
                      src={activite.images?.[0] || '/assets/hero/hero1.jpg'}
                      alt={activite.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {activite.difficulty_level && (
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(activite.difficulty_level)}`}>
                        {activite.difficulty_level}
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">{activite.type}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {activite.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{activite.city}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">{activite.duration}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="text-sm">Max {activite.max_participants} personnes</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {activite.description}
                    </p>

                    {/* Inclus */}
                    {activite.included && activite.included.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Inclus :</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {activite.included.slice(0, 3).map((item, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Prix et bouton */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          {activite.price} MAD
                        </span>
                        <span className="text-gray-500 text-sm"> / pers</span>
                      </div>
                      <AuthGuard>
                        <button
                          onClick={() => handleBookActivite(activite)}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
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
      {showBookingForm && selectedActivite && (
        <UniversalBookingForm
          service={{
            id: selectedActivite.id,
            title: selectedActivite.title,
            price: selectedActivite.price,
            description: selectedActivite.description,
            max_participants: selectedActivite.max_participants,
          }}
          serviceType="activite"
          onClose={() => {
            setShowBookingForm(false);
            setSelectedActivite(null);
          }}
        />
      )}

      <Footer />
    </>
  );
};

export default Activites;
