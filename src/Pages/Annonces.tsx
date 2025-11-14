import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, MapPin, DollarSign, Calendar, Phone, Mail, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

interface Annonce {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  contact_phone: string;
  contact_email: string;
  city: string;
  available: boolean;
  created_at: string;
  partner?: {
    company_name: string;
  };
}

const Annonces = () => {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Images pour le hero carrousel
  const heroImages = [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  ];

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'immobilier', label: 'Immobilier' },
    { value: 'vehicules', label: 'Véhicules' },
    { value: 'emploi', label: 'Emploi' },
    { value: 'services', label: 'Services' },
    { value: 'loisirs', label: 'Loisirs' },
    { value: 'autres', label: 'Autres' }
  ];

  useEffect(() => {
    loadAnnonces();
  }, []);

  // Carrousel automatique
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change toutes les 5 secondes

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const loadAnnonces = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('annonces')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur:', error);
        // Si la table n'existe pas encore, afficher un message
        setAnnonces([]);
      } else {
        setAnnonces(data || []);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      setAnnonces([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnonces = annonces.filter(annonce => {
    const matchesSearch = annonce.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         annonce.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || annonce.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section avec Carrousel */}
      <div className="relative h-96 overflow-hidden">
        {/* Images du carrousel */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        ))}

        {/* Contenu du Hero */}
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Annonces
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Découvrez les meilleures offres et annonces locales
            </p>
          </div>
        </div>

        {/* Boutons de navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
          aria-label="Image précédente"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
          aria-label="Image suivante"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicateurs */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-12">
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une annonce..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Catégorie */}
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des annonces */}
      {filteredAnnonces.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">Aucune annonce trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnonces.map((annonce) => (
            <div key={annonce.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              {annonce.images && annonce.images.length > 0 && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={annonce.images[0]}
                    alt={annonce.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Contenu */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                    {categories.find(c => c.value === annonce.category)?.label || annonce.category}
                  </span>
                  {annonce.partner && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Partenaire
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{annonce.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{annonce.description}</p>

                {/* Informations */}
                <div className="space-y-2 mb-4">
                  {annonce.price && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-bold text-emerald-600">{annonce.price} MAD</span>
                    </div>
                  )}
                  {annonce.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{annonce.city}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(annonce.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                {/* Contact */}
                <div className="border-t pt-3 space-y-2">
                  {annonce.contact_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${annonce.contact_phone}`} className="hover:text-emerald-600">
                        {annonce.contact_phone}
                      </a>
                    </div>
                  )}
                  {annonce.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${annonce.contact_email}`} className="hover:text-emerald-600">
                        {annonce.contact_email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default Annonces;