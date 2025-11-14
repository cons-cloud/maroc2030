import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceHero from "../../components/ServiceHero";
import ServiceCard from '../../components/ServiceCard';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import LoadingState from '../../components/LoadingState';

interface Villa {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  rating?: number;
  amenities?: string[];
  link?: string;
  [key: string]: any;
}

const Villas = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [villas, setVillas] = useState<Villa[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const navigate = useNavigate();

  // Gestion de la sélection d'une ville
  const handleCitySelect = (city: string | null) => {
    setSelectedCity(city);
  };

  // Gestion de la recherche
  const handleSearch = (query: string) => {
    console.log('Recherche de villa:', query);
    // Implémentez la logique de recherche ici
  };

  // Gestion de la réservation
  const handleBookNow = (villa: Villa) => {
    // Rediriger vers la page de réservation avec les détails de la villa
    navigate(`/reservation/villa/${villa.id}`, {
      state: {
        service: {
          id: villa.id,
          title: villa.title,
          description: villa.description,
          price: villa.price,
          images: villa.images,
          type: 'villa',
          city: villa.city,
          maxGuests: villa.bedrooms * 2 + 2, // Estimation du nombre de personnes
          details: {
            chambres: villa.bedrooms,
            sallesDeBain: villa.bathrooms,
            superficie: villa.area,
            équipements: villa.amenities || []
          }
        }
      }
    });
  };

  useEffect(() => {
    const loadVillas = async () => {
      try {
        setIsLoading(true);
        
        // Charger les villas de la table villas
        const { data: villasData, error: villasError } = await supabase
          .from('villas')
          .select('*')
          .eq('available', true)
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (villasError) throw villasError;

        // Charger les villas des partenaires depuis partner_products
        const { data: partnerVillas, error: partnerError } = await supabase
          .from('partner_products')
          .select('*')
          .eq('available', true)
          .eq('product_type', 'villa')
          .order('created_at', { ascending: false });

        if (partnerError) throw partnerError;

        // Combiner les villas
        const allVillas: Villa[] = [];
        
        // Ajouter les villas de la table villas
        if (villasData) {
          allVillas.push(...villasData.map((villa: any) => ({
            id: villa.id,
            title: villa.title,
            description: villa.description || '',
            price: villa.price_per_night || villa.price_sale || 0,
            address: villa.address || '',
            city: villa.city,
            bedrooms: villa.bedrooms || 0,
            bathrooms: villa.bathrooms || 0,
            area: villa.area_sqm || 0,
            amenities: villa.amenities || [],
            images: villa.images || ['/assets/hero/hero1.jpg'],
            rating: villa.rating
          })));
        }

        // Ajouter les villas des partenaires
        if (partnerVillas) {
          allVillas.push(...partnerVillas.map((villa: any) => ({
            id: `partner-${villa.id}`,
            title: villa.title,
            description: villa.description || '',
            price: villa.price || 0,
            address: villa.address || '',
            city: villa.city,
            bedrooms: villa.bedrooms || 0,
            bathrooms: villa.bathrooms || 0,
            area: villa.area || 0,
            amenities: villa.amenities || [],
            images: villa.images || ['/assets/hero/hero1.jpg'],
            rating: villa.rating
          })));
        }

        setVillas(allVillas);
      } catch (error) {
        console.error('Erreur lors du chargement des villas:', error);
        toast.error('Erreur lors du chargement des villas');
      } finally {
        setIsLoading(false);
      }
    };

    loadVillas();
  }, []);

  // Filtrer les villas par ville si une ville est sélectionnée
  const filteredVillas = selectedCity
    ? villas.filter(villa => villa.city === selectedCity)
    : villas;

  // Extraire les villes uniques pour les filtres
  const cities = Array.from(new Set(villas.map(villa => villa.city))).filter(Boolean) as string[];

  // Afficher le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ServiceHero 
          title="Villas de luxe"
          subtitle="Découvrez nos villas d'exception pour des séjours inoubliables"
          images={[
            '/assets/hero/villas-1.jpg',
            '/assets/hero/villas-2.jpg',
            '/assets/hero/villas-3.jpg'
          ]}
          searchPlaceholder="Rechercher une villa, une ville..."
          onSearch={handleSearch}
        />
        <div className="container mx-auto px-4 py-12">
          <LoadingState 
            fullScreen={false}
            text="Chargement des villas..."
          />
        </div>
      </div>
    );
  }

  // Rendu principal
  return (
    <div className="min-h-screen bg-gray-50">
      <ServiceHero 
        title="Villas de luxe"
        subtitle="Découvrez nos villas d'exception pour des séjours inoubliables"
        images={[
          '/assets/hero/villas-1.jpg',
          '/assets/hero/villas-2.jpg',
          '/assets/hero/villas-3.jpg'
        ]}
        searchPlaceholder="Rechercher une villa, une ville..."
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
        
        {/* Liste des villas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVillas.map((villa) => (
            <ServiceCard
              key={villa.id}
              id={villa.id}
              title={villa.title}
              description={villa.description}
              images={villa.images}
              price={villa.price}
              rating={villa.rating}
              tags={[
                `${villa.bedrooms} chambres`,
                `${villa.bathrooms} sdb`,
                `${villa.area} m²`,
                villa.city
              ]}
              link={`/villas/${villa.id}`}
              onBookNow={() => handleBookNow(villa)}
            />
          ))}
        </div>
        
        {filteredVillas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune villa disponible pour le moment.</p>
            {selectedCity && (
              <button
                onClick={() => setSelectedCity(null)}
                className="mt-4 text-emerald-600 hover:text-emerald-800 font-medium"
              >
                Voir toutes les villas
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Villas;
