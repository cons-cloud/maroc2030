import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceHero from '../../components/ServiceHero';
import ServiceCard from '../../components/ServiceCard';
import { useFetchData } from '../../hooks/useFetchData';
import LoadingState from '../../components/LoadingState';


// Interface pour les données d'un hôtel
interface Hotel {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  images: string[];
  stars: number;
  amenities?: string[];
  available?: boolean;
  featured?: boolean;
  [key: string]: any;
}

const Hotels: React.FC = () => {
  // États locaux
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  
  // Récupération des données avec le hook personnalisé
  const { 
    data: hotels, 
    isLoading, 
    error 
  } = useFetchData<Hotel>('hotels', '*');
  
  // Gestion de la sélection d'une ville
  const handleCitySelect = (city: string | null) => {
    setSelectedCity(city);
  };
  
  // Filtrage des hôtels par ville si une ville est sélectionnée
  const filteredHotels = selectedCity
    ? hotels.filter(hotel => hotel.city === selectedCity)
    : hotels;

  // Extraction des villes uniques pour les filtres
  const cities = Array.from(new Set(hotels.map(hotel => hotel.city))).filter(Boolean) as string[];
  
  // Gestion de la réservation
  const navigate = useNavigate();
  
  const handleBookNow = (hotel: Hotel) => {
    // Rediriger vers la page de réservation avec les détails de l'hôtel
    navigate(`/reservation/hotel/${hotel.id}`, {
      state: {
        service: {
          id: hotel.id,
          title: hotel.title,
          description: hotel.description,
          price: hotel.price,
          images: hotel.images,
          type: 'hotel',
          city: hotel.city,
          maxGuests: hotel.amenities?.includes('Famille') ? 6 : 2
        }
      }
    });
  };
  
  // Gestion de la recherche
  const handleSearch = (query: string) => {
    console.log('Recherche d\'hôtel:', query);
    // Implémentez la logique de recherche ici
  };

  if (isLoading || error) {
    return (
      <div className="min-h-screen">
        <ServiceHero 
          title="Hôtels de charme"
          subtitle="Découvrez nos hôtels soigneusement sélectionnés pour un séjour inoubliable"
          images={[
            '/assets/hero/hotels-1.jpg',
            '/assets/hero/hotels-2.jpg',
            '/assets/hero/hotels-3.jpg'
          ]}
        />
        <div className="container mx-auto px-4 py-12">
          <LoadingState 
            fullScreen={false}
            text={error ? 'Erreur lors du chargement' : 'Chargement des hôtels...'}
            className={error ? 'text-red-500' : ''}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ServiceHero
        title="Nos Hôtels"
        subtitle="Découvrez notre sélection d'hôtels de charme pour un séjour inoubliable au Maroc"
        images={[
          '/assets/hero/hotels-1.jpg',
          '/assets/hero/hotels-2.jpg',
          '/assets/hero/hotels-3.jpg'
        ]}
        searchPlaceholder="Rechercher un hôtel, une ville..."
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

          {/* Liste des hôtels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map((hotel) => (
              <ServiceCard
                key={hotel.id}
                id={hotel.id}
                title={hotel.title}
                description={hotel.description}
                images={hotel.images}
                price={hotel.price}
                rating={hotel.stars}
                tags={hotel.amenities}
                link={`/hotels/${hotel.id}`}
                onBookNow={() => handleBookNow(hotel)}
              />
            ))}
          </div>

          {filteredHotels.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun hôtel disponible pour le moment.</p>
              {selectedCity && (
                <button
                  onClick={() => setSelectedCity(null)}
                  className="mt-4 text-emerald-600 hover:text-emerald-800 font-medium"
                >
                  Voir tous les hôtels
                </button>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Hotels;
