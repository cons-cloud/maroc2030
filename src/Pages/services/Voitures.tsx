import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceHero from "../../components/ServiceHero";
import ServiceCard from '../../components/ServiceCard';
import { useFetchData } from '../../hooks/useFetchData';
import LoadingState from '../../components/LoadingState';

// Interface pour les données d'une voiture
interface Voiture {
  id: string;
  title: string;
  description: string;
  images: string[];
  price_per_day: number;
  brand: string;
  model: string;
  year: number;
  fuel_type: string;
  transmission: string;
  seats: number;
  doors: number;
  has_ac: boolean;
  city: string;
  available: boolean;
  rating?: number;
  features?: string[];
  [key: string]: any;
}


const Voitures = () => {
  // États locaux
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Récupération des données avec le hook personnalisé
  const { 
    data: voitures = [], 
    isLoading, 
    error 
  } = useFetchData<Voiture>('locations_voitures', '*');
  
  // Gestion de la sélection d'une ville
  const handleCitySelect = (city: string | null) => {
    setSelectedCity(city);
  };
  
  // Filtrage des voitures par ville si une ville est sélectionnée
  const filteredVoitures = selectedCity
    ? voitures.filter(voiture => voiture.city === selectedCity)
    : voitures;

  // Extraction des villes uniques pour les filtres
  const cities = Array.from(new Set(voitures.map(voiture => voiture.city))).filter(Boolean) as string[];
  
  // Gestion de la réservation
  const handleBookNow = (voiture: Voiture) => {
    // Rediriger vers la page de réservation avec les détails de la voiture
    navigate(`/reservation/voiture/${voiture.id}`, {
      state: {
        service: {
          id: voiture.id,
          title: `${voiture.brand} ${voiture.model}`,
          description: voiture.description,
          price: voiture.price_per_day,
          images: voiture.images,
          type: 'voiture',
          city: voiture.city,
          maxGuests: voiture.seats || 5,
          details: {
            marque: voiture.brand,
            modele: voiture.model,
            annee: voiture.year,
            carburant: voiture.fuel_type,
            transmission: voiture.transmission,
            places: voiture.seats,
            portes: voiture.doors,
            clim: voiture.has_ac ? 'Oui' : 'Non',
            caracteristiques: voiture.features || []
          }
        }
      }
    });
  };
  
  // Gestion de la recherche
  const handleSearch = (query: string) => {
    console.log('Recherche de voiture:', query);
    // Implémentez la logique de recherche ici
  };

  // Affichage du chargement ou des erreurs
  if (isLoading || error) {
    return (
      <div className="min-h-screen">
        <ServiceHero 
          title="Location de voitures"
          subtitle="Trouvez la voiture parfaite pour vos déplacements au Maroc"
          images={[
            '/assets/hero/cars-1.jpg',
            '/assets/hero/cars-2.jpg',
            '/assets/hero/cars-3.jpg'
          ]}
        />
        <div className="container mx-auto px-4 py-12">
          <LoadingState 
            fullScreen={false}
            text={error ? 'Erreur lors du chargement' : 'Chargement des véhicules...'}
            className={error ? 'text-red-500' : ''}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ServiceHero
        title="Location de Voitures"
        subtitle="Trouvez la voiture parfaite pour vos déplacements au Maroc"
        images={[
          '/assets/hero/cars-1.jpg',
          '/assets/hero/cars-2.jpg',
          '/assets/hero/cars-3.jpg'
        ]}
        searchPlaceholder="Rechercher une voiture, une marque, une ville..."
        onSearch={handleSearch}
      />
      
      <div className="container mx-auto px-4 py-12">
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

        {/* Liste des voitures */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVoitures.map((voiture) => (
            <ServiceCard
              key={voiture.id}
              id={voiture.id}
              title={`${voiture.brand} ${voiture.model}`}
              description={voiture.description}
              images={voiture.images}
              price={voiture.price_per_day}
              rating={voiture.rating}
              tags={[
                voiture.year.toString(),
                voiture.transmission,
                `${voiture.seats} places`,
                voiture.fuel_type
              ]}
              link={`/voitures/${voiture.id}`}
              onBookNow={() => handleBookNow(voiture)}
            />
          ))}
        </div>

        {filteredVoitures.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun véhicule disponible pour le moment.</p>
            {selectedCity && (
              <button
                onClick={() => setSelectedCity(null)}
                className="mt-4 text-emerald-600 hover:text-emerald-800 font-medium"
              >
                Voir tous les véhicules
              </button>
            )}
          </div>
        )}
      </div>

      {/* Formulaire de réservation */}
    </div>
  );
};

export default Voitures;
