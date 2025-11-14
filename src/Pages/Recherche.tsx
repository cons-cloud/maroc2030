import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Filter, MapPin, Car, Building, Plane, Loader } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'tourism' | 'car' | 'property';
  title: string;
  subtitle: string;
  price: number;
  image: string;
  location: string;
}

const Recherche = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchTerm = `%${query}%`;
      const allResults: SearchResult[] = [];

      // Recherche dans les circuits touristiques
      if (selectedFilters.includes('all') || selectedFilters.includes('tourism')) {
        const { data: circuits } = await supabase
          .from('circuits_touristiques')
          .select('*')
          .or(`title.ilike.${searchTerm},destination.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .eq('status', 'active')
          .limit(20);

        if (circuits) {
          allResults.push(...circuits.map(c => ({
            id: c.id,
            type: 'tourism' as const,
            title: c.title,
            subtitle: c.destination,
            price: c.price,
            image: c.images?.[0] || '/placeholder.jpg',
            location: c.destination
          })));
        }

        // Recherche dans les activités touristiques
        const { data: activities } = await supabase
          .from('activites_touristiques')
          .select('*')
          .or(`title.ilike.${searchTerm},location.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .eq('status', 'active')
          .limit(20);

        if (activities) {
          allResults.push(...activities.map(a => ({
            id: a.id,
            type: 'tourism' as const,
            title: a.title,
            subtitle: a.location,
            price: a.price,
            image: a.images?.[0] || '/placeholder.jpg',
            location: a.location
          })));
        }
      }

      // Recherche dans les voitures
      if (selectedFilters.includes('all') || selectedFilters.includes('car')) {
        const { data: cars } = await supabase
          .from('locations_voitures')
          .select('*')
          .or(`brand.ilike.${searchTerm},model.ilike.${searchTerm},city.ilike.${searchTerm}`)
          .eq('status', 'active')
          .limit(20);

        if (cars) {
          allResults.push(...cars.map(c => ({
            id: c.id,
            type: 'car' as const,
            title: `${c.brand} ${c.model}`,
            subtitle: `${c.year} • ${c.fuel_type}`,
            price: c.price_per_day,
            image: c.images?.[0] || '/placeholder.jpg',
            location: c.city
          })));
        }
      }

      // Recherche dans les propriétés
      if (selectedFilters.includes('all') || selectedFilters.includes('property')) {
        // Appartements
        const { data: apartments } = await supabase
          .from('appartements')
          .select('*')
          .or(`title.ilike.${searchTerm},city.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .eq('status', 'active')
          .limit(20);

        if (apartments) {
          allResults.push(...apartments.map(a => ({
            id: a.id,
            type: 'property' as const,
            title: a.title,
            subtitle: `Appartement • ${a.bedrooms} chambres`,
            price: a.price_per_night,
            image: a.images?.[0] || '/placeholder.jpg',
            location: a.city
          })));
        }

        // Villas
        const { data: villas } = await supabase
          .from('villas')
          .select('*')
          .or(`title.ilike.${searchTerm},city.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .eq('status', 'active')
          .limit(20);

        if (villas) {
          allResults.push(...villas.map(v => ({
            id: v.id,
            type: 'property' as const,
            title: v.title,
            subtitle: `Villa • ${v.bedrooms} chambres`,
            price: v.price_per_night,
            image: v.images?.[0] || '/placeholder.jpg',
            location: v.city
          })));
        }

        // Hôtels
        const { data: hotels } = await supabase
          .from('hotels')
          .select('*')
          .or(`name.ilike.${searchTerm},city.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .eq('status', 'active')
          .limit(20);

        if (hotels) {
          allResults.push(...hotels.map(h => ({
            id: h.id,
            type: 'property' as const,
            title: h.name,
            subtitle: `Hôtel ${h.stars}★`,
            price: h.price_per_night,
            image: h.images?.[0] || '/placeholder.jpg',
            location: h.city
          })));
        }
      }

      setResults(allResults);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    }
  };

  const toggleFilter = (filter: string) => {
    if (filter === 'all') {
      setSelectedFilters(['all']);
    } else {
      const newFilters = selectedFilters.includes(filter)
        ? selectedFilters.filter(f => f !== filter)
        : [...selectedFilters.filter(f => f !== 'all'), filter];
      
      setSelectedFilters(newFilters.length === 0 ? ['all'] : newFilters);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [selectedFilters]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'tourism': return Plane;
      case 'car': return Car;
      case 'property': return Building;
      default: return MapPin;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tourism': return 'Tourisme';
      case 'car': return 'Voiture';
      case 'property': return 'Hébergement';
      default: return '';
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Résultats de recherche
              </h1>
              
              {/* Barre de recherche */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une destination, un service..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Rechercher
                  </button>
                </div>
              </form>

              {/* Filtres */}
              <div className="flex items-center space-x-4 mb-6">
                <Filter className="h-5 w-5 text-gray-600" />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedFilters.includes('all')
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-primary'
                    }`}
                  >
                    Tout
                  </button>
                  <button
                    onClick={() => toggleFilter('tourism')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedFilters.includes('tourism')
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-primary'
                    }`}
                  >
                    <Plane className="h-4 w-4 inline mr-2" />
                    Tourisme
                  </button>
                  <button
                    onClick={() => toggleFilter('car')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedFilters.includes('car')
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-primary'
                    }`}
                  >
                    <Car className="h-4 w-4 inline mr-2" />
                    Voitures
                  </button>
                  <button
                    onClick={() => toggleFilter('property')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedFilters.includes('property')
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-primary'
                    }`}
                  >
                    <Building className="h-4 w-4 inline mr-2" />
                    Hébergements
                  </button>
                </div>
              </div>

              {/* Nombre de résultats */}
              {!loading && searchQuery && (
                <p className="text-gray-600">
                  {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''} pour "{searchQuery}"
                </p>
              )}
            </div>

            {/* Résultats */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : results.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? `Aucun résultat pour "${searchQuery}". Essayez avec d'autres mots-clés.`
                    : 'Commencez votre recherche en tapant un mot-clé ci-dessus.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result) => {
                  const Icon = getIcon(result.type);
                  return (
                    <div key={`${result.type}-${result.id}`} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative h-48">
                        <img
                          src={result.image}
                          alt={result.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                            {getTypeLabel(result.type)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start space-x-2 mb-2">
                          <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{result.title}</h3>
                            <p className="text-sm text-gray-600">{result.subtitle}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          {result.location}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-primary">
                            {result.price.toLocaleString()} MAD
                            <span className="text-sm font-normal text-gray-500">
                              {result.type === 'car' ? '/jour' : result.type === 'property' ? '/nuit' : ''}
                            </span>
                          </p>
                          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
                            Voir détails
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Recherche;
