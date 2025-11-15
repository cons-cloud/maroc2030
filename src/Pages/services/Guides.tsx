import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AuthGuard from '../../components/AuthGuard';
import UniversalBookingForm from '../../components/UniversalBookingForm';
import { MapPin, Star, Languages, Clock, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface Guide {
  id: string;
  name: string;
  description: string;
  languages: string[];
  specialties: string[];
  experience_years: number;
  rating: number;
  price_per_day: number;
  city: string;
  phone?: string;
  email?: string;
  images: string[];
  available: boolean;
  created_at: string;
}

const Guides = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('all');

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('guides_touristiques')
        .select('*')
        .eq('available', true)
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuides(data || []);
    } catch (error) {
      console.error('Error loading guides:', error);
      toast.error('Erreur lors du chargement des guides');
    } finally {
      setIsLoading(false);
    }
  };

  const cities = ['all', ...new Set(guides.map(g => g.city))];
  const filteredGuides = selectedCity === 'all' 
    ? guides 
    : guides.filter(g => g.city === selectedCity);

  const handleBookGuide = (guide: Guide) => {
    setSelectedGuide(guide);
    setShowBookingForm(true);
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
        <div className="bg-gradient-to-r from-emerald-600 to-indigo-700 text-white py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Guides Touristiques Professionnels
              </h1>
              <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
                Découvrez le Maroc avec nos guides expérimentés et passionnés
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Filtres */}
          <div className="mb-8 flex flex-wrap gap-4 items-center">
            <label className="font-medium text-gray-700">Filtrer par ville :</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les villes</option>
              {cities.filter(c => c !== 'all').map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <span className="text-gray-600">
              {filteredGuides.length} guide{filteredGuides.length > 1 ? 's' : ''} disponible{filteredGuides.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Liste des guides */}
          {filteredGuides.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Aucun guide disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGuides.map((guide) => (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Image */}
                  <div className="h-64 overflow-hidden">
                    <img
                      src={guide.images?.[0] || '/assets/hero/hero1.jpg'}
                      alt={guide.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{guide.name}</h3>
                      <div className="flex items-center bg-yellow-100 px-2 py-1 rounded">
                        <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                        <span className="font-semibold text-yellow-700">{guide.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{guide.city}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">{guide.experience_years} ans d'expérience</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Languages className="w-4 h-4 mr-2" />
                        <span className="text-sm">{guide.languages?.join(', ')}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {guide.description}
                    </p>

                    {/* Spécialités */}
                    {guide.specialties && guide.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {guide.specialties.slice(0, 3).map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Prix et bouton */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <span className="text-2xl font-bold text-emerald-600">
                          {guide.price_per_day} MAD
                        </span>
                        <span className="text-gray-500 text-sm"> / jour</span>
                      </div>
                      <AuthGuard>
                        <button
                          onClick={() => handleBookGuide(guide)}
                          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                        >
                          Réserver
                        </button>
                      </AuthGuard>
                    </div>

                    {/* Contact */}
                    {(guide.phone || guide.email) && (
                      <div className="mt-4 pt-4 border-t space-y-2">
                        {guide.phone && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <Phone className="w-4 h-4 mr-2" />
                            <a href={`tel:${guide.phone}`} className="hover:text-emerald-600">
                              {guide.phone}
                            </a>
                          </div>
                        )}
                        {guide.email && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <Mail className="w-4 h-4 mr-2" />
                            <a href={`mailto:${guide.email}`} className="hover:text-emerald-600">
                              {guide.email}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Formulaire de réservation */}
      {showBookingForm && selectedGuide && (
        <UniversalBookingForm
          service={{
            id: selectedGuide.id,
            title: selectedGuide.name,
            price: selectedGuide.price_per_day,
            price_per_day: selectedGuide.price_per_day
          }}
          serviceType="circuit"
          onClose={() => {
            setShowBookingForm(false);
            setSelectedGuide(null);
          }}
        />
      )}

      <Footer />
    </>
  );
};

export default Guides;
