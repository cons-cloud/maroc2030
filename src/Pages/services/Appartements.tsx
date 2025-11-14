import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceHero from '../../components/ServiceHero';
import ServiceCard from '../../components/ServiceCard';
import { useFetchData } from '../../hooks/useFetchData';
import LoadingState from '../../components/LoadingState';

// Interface pour les données d'un appartement
interface Apartment {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  images: string[];
  available: boolean;
  capacity?: number;
  rating?: number;
  rooms?: number;
  type?: string;
  [key: string]: any;
}

const Appartements: React.FC = () => {
  // États locaux
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Récupération des données avec le hook personnalisé
  const { 
    data: apartments, 
    isLoading, 
    error 
  } = useFetchData<Apartment>('appartements', '*');
  
  // Gestion de la sélection d'une ville
  const handleCitySelect = (city: string | null) => {
    setSelectedCity(city);
  };
  
  // Filtrage des appartements par ville si une ville est sélectionnée
  const filteredApartments = selectedCity
    ? apartments.filter(apt => apt.city === selectedCity)
    : apartments;

  // Extraction des villes uniques pour les filtres
  const cities = Array.from(new Set(apartments.map(apt => apt.city))).filter(Boolean) as string[];

  // Gestion de la recherche
  const handleSearch = (query: string) => {
    console.log('Recherche:', query);
    // Implémentez la logique de recherche ici
  };

  // Gestion de la réservation
  const handleBookNow = (apartment: Apartment) => {
    // Rediriger vers la page de réservation avec les détails de l'appartement
    navigate(`/reservation/appartement/${apartment.id}`, {
      state: {
        service: {
          id: apartment.id,
          title: apartment.title,
          description: apartment.description,
          price: apartment.price,
          images: apartment.images,
          type: 'appartement',
          city: apartment.city,
          maxGuests: apartment.capacity || 4
        }
      }
    });
  };

  // Affichage du chargement ou des erreurs
  if (isLoading || error) {
    return (
      <div className="min-h-screen">
        <ServiceHero 
          title="Appartements de vacances"
          subtitle="Découvrez nos appartements confortables pour des séjours inoubliables"
          images={[
            '/assets/hero/A.jpg',
            '/assets/hero/B.jpg',
            '/assets/hero/C.jpg',
            '/assets/hero/D.jpg'
          ]}
        />
        <div className="container mx-auto px-4 py-12">
          <LoadingState 
            fullScreen={false}
            text={error ? 'Erreur lors du chargement' : 'Chargement des appartements...'}
            className={error ? 'text-red-500' : ''}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ServiceHero
        title="Nos Appartements"
        subtitle="Découvrez notre sélection d'appartements de qualité dans les plus belles villes du Maroc. Confort, modernité et authenticité pour des vacances réussies."
        images={[
          '/assets/hero/A.jpg',
          '/assets/hero/B.jpg',
          '/assets/hero/C.jpg',
          '/assets/hero/D.jpg'
        ]}
        searchPlaceholder="Rechercher un appartement, une ville..."
        onSearch={handleSearch}
      />
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto px-4">
          {/* Filtres par ville */}
          {cities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
              <button
                onClick={() => handleCitySelect(null)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  !selectedCity 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } transition-colors`}
              >
                Toutes les villes
              </button>
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                    selectedCity === city 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  } transition-colors`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}

          {/* Liste des appartements */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApartments.map((apartment) => (
              <ServiceCard
                key={apartment.id}
                id={apartment.id}
                title={apartment.title}
                description={apartment.description}
                images={apartment.images}
                price={apartment.price}
                rating={apartment.rating}
                tags={[`${apartment.rooms || 2} chambres`, apartment.city, apartment.type || 'Appartement']}
                link={`/appartements/${apartment.id}`}
                onBookNow={() => handleBookNow(apartment)}
              />
            ))}
          </div>

          {filteredApartments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun appartement disponible pour le moment.</p>
              {selectedCity && (
                <button
                  onClick={() => setSelectedCity(null)}
                  className="mt-4 text-emerald-600 hover:text-emerald-800 font-medium"
                >
                  Voir tous les appartements
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appartements;
