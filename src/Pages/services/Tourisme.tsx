import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import ServiceHero from '../../components/ServiceHero';
import ServiceCard from '@/components/ServiceCard';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Voyage {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  rating: number;
  duration: string;
  tags: string[];
  city: string;
}

interface Ville {
  id: string;
  name: string;
  image: string;
  description: string;
  voyages: Voyage[];
}

const ImageSlider = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative h-48 w-full overflow-hidden">
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Slide ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
        />
      ))}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}
            aria-label={`Aller à l'image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const Tourisme = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [villes, setVilles] = useState<Ville[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCircuits();
  }, []);

  const loadCircuits = async () => {
    try {
      setIsLoading(true);
      
      // Charger les circuits de la table circuits_touristiques
      const { data: circuitsData, error: circuitsError } = await supabase
        .from('circuits_touristiques')
        .select('*')
        .eq('available', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (circuitsError) throw circuitsError;

      // Charger les circuits des partenaires depuis partner_products
      const { data: partnerCircuits, error: partnerError } = await supabase
        .from('partner_products')
        .select(`
          *,
          partner:profiles(company_name)
        `)
        .eq('available', true)
        .eq('product_type', 'circuit')
        .order('created_at', { ascending: false });

      if (partnerError) throw partnerError;

      // Grouper les circuits par ville
      const villesMap: { [key: string]: Ville } = {};
      
      // Ajouter les circuits de la table circuits_touristiques
      circuitsData?.forEach((circuit: any) => {
        const cityName = circuit.city || 'Autres';
        
        if (!villesMap[cityName]) {
          villesMap[cityName] = {
            id: cityName.toLowerCase(),
            name: cityName,
            image: circuit.images?.[0] || '/assets/hero/hero1.jpg',
            description: `Découvrez ${cityName}`,
            voyages: []
          };
        }

        villesMap[cityName].voyages.push({
          id: circuit.id,
          title: circuit.title,
          description: circuit.description || '',
          images: circuit.images || ['/assets/hero/hero1.jpg'],
          price: circuit.price_per_person,
          rating: 4.5,
          duration: `${circuit.duration_days} jours`,
          tags: circuit.highlights || [],
          city: cityName.toLowerCase()
        });
      });

      // Ajouter les circuits des partenaires
      partnerCircuits?.forEach((product: any) => {
        const cityName = product.city || 'Autres';
        
        if (!villesMap[cityName]) {
          villesMap[cityName] = {
            id: cityName.toLowerCase(),
            name: cityName,
            image: product.main_image || '/assets/hero/hero1.jpg',
            description: `Découvrez ${cityName}`,
            voyages: []
          };
        }

        villesMap[cityName].voyages.push({
          id: product.id,
          title: product.title,
          description: product.description || '',
          images: [product.main_image, ...(product.images || [])].filter(Boolean),
          price: product.price,
          rating: 4.5,
          duration: '3 jours', // Durée par défaut pour les circuits partenaires
          tags: product.amenities || [],
          city: cityName.toLowerCase()
        });
      });

      setVilles(Object.values(villesMap));
    } catch (error: any) {
      console.error('Erreur lors du chargement des circuits:', error);
      toast.error('Erreur lors du chargement des circuits');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Données remplacées par Supabase - CODE SUPPRIMÉ
  /*
  const villes_OLD: Ville[] = [
    {
      id: '²',
      name: 'Marrakech',
      image: 'public/voyages/vyg/marack/0.jpg',
      description: 'La ville ocre, joyau impérial au pied des montagnes de l\'Atlas',
      voyages: [
        {
          id: '1',
          title: 'Découverte de Marrakech',
          description: 'Visite des jardins Majorelle, de la place Jemaa el-Fna et des souks animés',
          images: [
            '/voyages/vyg/marack/1.jpg',
            '/voyages/vyg/marack/2.jpg',
            '/voyages/vyg/marack/3.jpg'
          ],
          price: 800,
          rating: 4.7,
          duration: '2 jours / 1 nuit',
          tags: ['culture', 'histoire', 'marché'],
          city: 'marrakech'
        },
        {
          id: '1-2',
          title: 'Séjour luxe à la Palmeraie',
          description: 'Séjour dans un riad de luxe avec spa et excursions privées',
          images: [
            '/voyages/vyg/marack/4.jpg',
            '/voyages/vyg/marack/5.jpg',
            '/voyages/vyg/marack/6.jpg'
          ],
          price: 2500,
          rating: 4.9,
          duration: '4 jours / 3 nuits',
          tags: ['luxe', 'détente', 'bien-être'],
          city: 'marrakech'
        },
        {
          id: '1-3',
          title: 'Atlas et Vallée de l\'Ourika',
          description: 'Randonnée dans les montagnes de l\'Atlas et visite des villages berbères',
          images: [
            '/voyages/vyg/marack/7.jpg',
            '/voyages/vyg/marack/8.jpg',
            '/voyages/vyg/marack/9.jpg'
            
          ],
          price: 950,
          rating: 4.6,
          duration: '1 jour',
          tags: ['randonnée', 'nature', 'aventure'],
          city: 'marrakech'
        }
        
      ]
    },
    {
      id: 'fes',
      name: 'Fès',
      image: '/voyages/vyg/Fes/IM.jpeg',
      description: 'La capitale spirituelle et culturelle du Maroc',
      voyages: [
        {
          id: '3',
          title: 'Médina de Fès',
          description: 'Exploration de la plus grande médina du monde classée au patrimoine de l\'UNESCO',
          images: [
            '/voyages/vyg/Fes/1.jpeg',
            '/voyages/vyg/Fes/2.jpeg',
            '/voyages/vyg/Fes/4.jpg'
          ],
          price: 700,
          rating: 4.6,
          duration: '2 jours / 1 nuit',
          tags: ['histoire', 'culture', 'médina'],
          city: 'fes'
        },
        {
          id: '3-2',
          title: 'Fès Impériale',
          description: 'Découverte des palais royaux et des médersas historiques',
          images: [
            '/voyages/vyg/Fes/3.webp',
            '/voyages/vyg/Fes/5.jpg',
            '/voyages/vyg/Fes/7d.jpg'
          ],
          price: 850,
          rating: 4.5,
          duration: '2 jours / 1 nuit',
          tags: ['histoire', 'architecture', 'culture'],
          city: 'fes'
        },
        {
          id: '3-3',
          title: 'Artisanat de Fès',
          description: 'Visite des ateliers d\'artisanat et cours de cuisine marocaine',
          images: [
            '/voyages/vyg/Fes/11.jpg',
            '/voyages/vyg/Fes/13.jpg',
            '/voyages/vyg/Fes/fes.webp'
          ],
          price: 650,
          rating: 4.7,
          duration: '1 jour',
          tags: ['artisanat', 'cuisine', 'expérience locale'],
          city: 'fes'
        }
      ]
    },
    {
      id: 'chefchaouen',
      name: 'Chefchaouen',
      image: '/assets/tourisme/chefchaouen.jpg',
      description: 'La ville bleue nichée dans les montagnes du Rif',
      voyages: [
        {
          id: '5',
          title: 'Découverte de la Perle Bleue',
          description: 'Balade dans les ruelles bleues et visite des points de vue panoramiques',
          images: [
            '/voyages/vyg/Villebeu/1.jpg',
            '/voyages/vyg/Villebeu/2.jpg',
            '/voyages/vyg/Villebeu/3.jpg'
          ],
          price: 750,
          rating: 4.8,
          duration: '2 jours / 1 nuit',
          tags: ['photographie', 'culture', 'nature'],
          city: 'chefchaouen'
        },
        {
          id: '5-2',
          title: 'Randonnée dans le Parc de Talassemtane',
          description: 'Randonnée à travers les forêts de cèdres et les cascades',
          images: [
            '/voyages/vyg/Villebeu/4.webp',
            '/voyages/vyg/Villebeu/5.jpeg',
            '/voyages/vyg/Villebeu/6.jpeg'
          ],
          price: 900,
          rating: 4.9,
          duration: '3 jours / 2 nuits',
          tags: ['randonnée', 'nature', 'aventure'],
          city: 'chefchaouen'
        },
        {
          id: '5-3',
          title: 'Expérience artisanale à Chefchaouen',
          description: 'Ateliers de tissage et de teinture traditionnelle',
          images: [
            '/voyages/vyg/Villebeu/7.jpeg',
            '/voyages/vyg/Villebeu/8.jpeg',
            '/voyages/vyg/Villebeu/9.jpeg'
          ],
          price: 600,
          rating: 4.6,
          duration: '1 jour',
          tags: ['artisanat', 'culture', 'expérience locale'],
          city: 'chefchaouen'
        }
      ]
    },
    {
      id: 'essaouira',
      name: 'Essaouira',
      image: '/voyages/vyg/es/1.jpg',
      description: 'Cité balnéaire au charme bohème et à l\'architecture portugaise',
      voyages: [
        {
          id: '6',
          title: 'Week-end à Essaouira',
          description: 'Découverte de la médina et des plages de sable fin',
          images: [
            '/voyages/vyg/es/1.jpg',
            '/voyages/vyg/marack/T15.jpeg',
            '/voyages/vyg/marack/T13.jpeg'
          ],
          price: 950,
          rating: 4.7,
          duration: '2 jours / 1 nuit',
          tags: ['plage', 'détente', 'culture'],
          city: 'essaouira'
        },
        {
          id: '6-2',
          title: 'Sports nautiques à Essaouira',
          description: 'Kitesurf, planche à voile et autres activités nautiques',
          images: [
            '/voyages/vyg/es/2.jpg',
            '/voyages/vyg/marack/mrkc.jpg',
            '/voyages/vyg/marack/T11.jpeg'
          ],
          price: 1100,
          rating: 4.8,
          duration: '3 jours / 2 nuits',
          tags: ['sports nautiques', 'aventure', 'plage'],
          city: 'essaouira'
        },
        {
          id: '6-3',
          title: 'Gastronomie d\'Essaouira',
          description: 'Dégustation de fruits de mer frais et cours de cuisine',
          images: [
            '/voyages/vyg/es/3.jpg',
            '/voyages/vyg/marack/marrakech.jpeg',
            '/voyages/vyg/marack/T12.jpeg'
          ],
          price: 850,
          rating: 4.9,
          duration: '1 jour',
          tags: ['gastronomie', 'cuisine', 'expérience locale'],
          city: 'essaouira'
        }
      ]
    },
    {
      id: 'ouarzazate',
      name: 'Ouarzazate',
      image: '/voyages/vyg/marack/T8.jpg',
      description: 'La porte du désert et la capitale du cinéma marocain',
      voyages: [
        {
          id: '7',
          title: 'Vallée du Drâa et Kasbahs',
          description: 'Circuit à travers les palmeraies et les anciennes forteresses',
          images: [
            '/voyages/vyg/ouar/1.jpg',
            '/voyages/vyg/marack/T14.jpeg',
            '/voyages/vyg/ouar/5.jpg'
          ],
          price: 1200,
          rating: 4.7,
          duration: '3 jours / 2 nuits',
          tags: ['désert', 'histoire', 'aventure'],
          city: 'ouarzazate'
        },
        {
          id: '7-2',
          title: 'Studios de cinéma et Aït Ben Haddou',
          description: 'Visite des studios Atlas et du célèbre village fortifié',
          images: [
            '/voyages/vyg/ouar/2.jpg',
            '/voyages/vyg/marack/mrkc.jpg',
            '/voyages/vyg/ouar/6.jpg'
          ],
          price: 850,
          rating: 4.8,
          duration: '1 jour',
          tags: ['cinéma', 'patrimoine', 'culture'],
          city: 'ouarzazate'
        },
        {
          id: '7-3',
          title: 'Dunes de Chegaga',
          description: 'Expédition dans le désert avec nuit en bivouac',
          images: [
            '/voyages/vyg/ouar/3.jpg',
            '/voyages/vyg/ouar/4.jpg',
            '/voyages/vyg/marack/T8.jpeg'
          ],
          price: 1500,
          rating: 4.9,
          duration: '2 jours / 1 nuit',
          tags: ['désert', 'aventure', 'randonnée'],
          city: 'ouarzazate'
        }
      ]
    },
    {
      id: 'tanger',
      name: 'Tanger',
      image: '/assets/tourisme/tanger.jpg',
      description: 'Ville mythique à la croisée de la Méditerranée et de l\'Atlantique',
      voyages: [
        {
          id: '8',
          title: 'Tanger et Cap Spartel',
          description: 'Découverte de la ville et du point de rencontre des deux mers',
          images: [
            '/voyages/vyg/Tg/1.jpg',
            '/voyages/vyg/Tg/2.webp',
            '/voyages/vyg/Tg/3.jpg'
          ],
          price: 900,
          rating: 4.6,
          duration: '2 jours / 1 nuit',
          tags: ['culture', 'histoire', 'mer'],
          city: 'tanger'
        },
        {
          id: '8-2',
          title: 'Tanger la cosmopolite',
          description: 'Sur les pas des écrivains et artistes internationaux',
          images: [
            '/voyages/vyg/Tg/4.jpg',
            '/voyages/vyg/Tg/5.jpg',
            '/voyages/vyg/Tg/6.jpg'
          ],
          price: 1100,
          rating: 4.5,
          duration: '2 jours / 1 nuit',
          tags: ['littérature', 'art', 'histoire'],
          city: 'tanger'
        },
        {
          id: '8-3',
          title: 'Détente à Tanger',
          description: 'Séjour balnéaire dans les plus beaux hôtels de la ville',
          images: [
            '/voyages/vyg/Tg/7.png',
            '/voyages/vyg/Tg/8.jpg',
            '/voyages/vyg/Tg/9.jpg'
          ],
          price: 2000,
          rating: 4.8,
          duration: '3 jours / 2 nuits',
          tags: ['luxe', 'détente', 'plage'],
          city: 'tanger'
        }
      ]
    },
    {
      id: 'merzouga',
      name: 'Merzouga',
      image: '/assets/tourisme/merzouga.jpg',
      description: 'Porte du désert du Sahara marocain',
      voyages: [
        {
          id: '2',
          title: 'Désert de Merzouga',
          description: 'Aventure inoubliable au cœur des dunes du Sahara avec nuit en bivouac sous les étoiles',
          images: [
            '/voyages/vyg/mer/1.jpg',
            '/voyages/vyg/mer/2.webp',
            '/voyages/vyg/mer/222.webp'
          ],
          price: 1200,
          rating: 4.8,
          duration: '3 jours / 2 nuits',
          tags: ['aventure', 'désert', 'randonnée'],
          city: 'merzouga'
        },
        {
          id: '2-2',
          title: 'Safari dans le désert',
          description: 'Excursion en 4x4 à travers les dunes et rencontre avec les nomades',
          images: [
            '/voyages/vyg/mer/4.jpg',
            '/voyages/vyg/mer/5.jpg',
            '/voyages/vyg/mer/3.webp'
          ],
          price: 1500,
          rating: 4.9,
          duration: '2 jours / 1 nuit',
          tags: ['safari', 'désert', 'aventure'],
          city: 'merzouga'
        },
        {
          id: '2-3',
          title: 'Nuit dans un luxueux camp de tentes',
          description: 'Expérience haut de gamme dans le désert avec dîner et animation berbère',
          images: [
            '/voyages/vyg/mer/6.jpg',
            '/voyages/vyg/mer/7.jpg',
            '/voyages/vyg/mer/9.jpg'
          ],
          price: 1800,
          rating: 5.0,
          duration: '2 jours / 1 nuit',
          tags: ['luxe', 'désert', 'expérience unique'],
          city: 'merzouga'
        }
      ]
    },
    {
      id: 'casa',
      name: 'Casablanca',
      image: '/assets/tourisme/casablanca.jpg',
      description: 'La capitale économique et la plus grande ville du Maroc',
      voyages: [
        {
          id: '4',
          title: 'Casablanca Moderne',
          description: 'Découverte de la mosquée Hassan II et de la corniche',
          images: [
            '/voyages/vyg/casa/1.webp',
            '/voyages/vyg/casa/2.webp',
            '/voyages/vyg/casa/3.jpg'
          ],
          price: 600,
          rating: 4.3,
          duration: '1 jour',
          tags: ['moderne', 'plage', 'architecture'],
          city: 'casa'
        },
        {
          id: '4-2',
          title: 'Art déco et histoire de Casablanca',
          description: 'Parcours architectural à travers le centre-ville historique',
          images: [
            '/voyages/vyg/casa/4.webp',
            '/voyages/vyg/casa/images.jpeg',
            '/voyages/vyg/casa/69.jpg'
          ],
          price: 750,
          rating: 4.5,
          duration: '1 jour',
          tags: ['architecture', 'histoire', 'culture'],
          city: 'casa'
        },
        {
          id: '4-3',
          title: 'Vie nocturne de Casablanca',
          description: 'Dîner gastronomique et découverte des lieux branchés de la ville',
          images: [
            '/voyages/vyg/casa/7.webp',
            '/voyages/vyg/casa/T9.jpeg',
            '/voyages/vyg/casa/tramway.jpeg'
          ],
          price: 900,
          rating: 4.4,
          duration: '1 jour',
          tags: ['nuit', 'gastronomie', 'divertissement'],
          city: 'casa'
        }
      ]
    }
  ];
  */

  // Fonction pour ajouter une nouvelle ville
  const ajouterVille = (nouvelleVille: Omit<Ville, 'id'>) => {
    const id = nouvelleVille.name.toLowerCase().replace(/\s+/g, '-');
    setVilles([...villes, { ...nouvelleVille, id }]);
  };
  

  // Fonction pour ajouter un voyage à une ville
  const ajouterVoyage = (villeId: string, nouveauVoyage: Omit<Voyage, 'id' | 'city'>) => {
    setVilles(villes.map(ville => {
      if (ville.id === villeId) {
        const id = `${villeId}-${ville.voyages.length + 1}`;
        return {
          ...ville,
          voyages: [...ville.voyages, { ...nouveauVoyage, id, city: villeId }]
        };
      }
      return ville;
    }));
  };

  // Filtrer les villes et voyages en fonction de la recherche
  const filteredVilles = villes.filter(ville => 
    ville.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ville.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ville.voyages.some(voyage => 
      voyage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voyage.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voyage.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

// Obtenir les voyages de la ville sélectionnée ou tous les voyages
const voyagesAAfficher = selectedCity
  ? villes.find(v => v.id === selectedCity)?.voyages || []
  : filteredVilles.flatMap(ville => ville.voyages);

// Images pour le hero (comme la page d'accueil)
const heroImages = [
  '/assets/hero/A.jpg',
  '/assets/hero/B.jpg',
  '/assets/hero/C.jpg',
  '/assets/hero/D.jpg'
];

const handleHeroSearch = (query: string) => {
  setSearchTerm(query);
};

return (
  <div className="min-h-screen bg-gray-50">
    <ServiceHero
      title="Découvrez le Maroc"
      subtitle="Explorez nos circuits touristiques à travers les plus belles villes du Maroc. Des expériences authentiques et inoubliables vous attendent."
      images={heroImages}
      searchPlaceholder="Rechercher une destination, un circuit..."
      onSearch={handleHeroSearch}
    />
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <SearchBar 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher des destinations..."
          />
        </div>

        {/* Filtres par ville */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <button
            onClick={() => setSelectedCity(null)}
            className={`px-4 py-2 rounded-full ${!selectedCity ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
          >
            Toutes les destinations
          </button>
          {villes.map(ville => (
            <button
              key={ville.id}
              onClick={() => setSelectedCity(ville.id)}
              className={`px-4 py-2 rounded-full ${selectedCity === ville.id ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
            >
              {ville.name}
            </button>
          ))}
        </div>

        {/* Affichage des voyages */}
        {!selectedCity ? (
          // Affichage par ville
          <div className="space-y-16">
            {filteredVilles.map((ville) => (
              <div key={ville.id} className="mb-12">
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{ville.name}</h2>
                  <button 
                    onClick={() => setSelectedCity(ville.id)}
                    className="ml-4 text-sm text-emerald-600 hover:text-emerald-800"
                  >
                    Voir tout ({ville.voyages.length})
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ville.voyages.slice(0, 3).map((voyage) => (
                    <div key={voyage.id} className="relative h-full">
                      <ServiceCard
                        id={voyage.id}
                        title={voyage.title}
                        description={voyage.description}
                        images={voyage.images}
                        price={voyage.price}
                        rating={voyage.rating}
                        duration={voyage.duration}
                        tags={voyage.tags}
                        link={`/tourisme/${voyage.id}/reserver`}
                        className="h-full flex flex-col"
                      />
                    </div>
                  ))}
                </div>
                {ville.voyages.length > 3 && (
                  <div className="text-center mt-6">
                    <button 
                      onClick={() => setSelectedCity(ville.id)}
                      className="px-6 py-2 border border-blue-600 text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
                    >
                      Voir les {ville.voyages.length - 3} autres offres à {ville.name}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Affichage des voyages d'une ville spécifique
          <div>
            <button 
              onClick={() => setSelectedCity(null)}
              className="flex items-center text-emerald-600 mb-6 hover:text-emerald-800"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour aux destinations
            </button>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Nos offres à {villes.find(v => v.id === selectedCity)?.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {voyagesAAfficher.map((voyage) => (
                <ServiceCard
                  key={voyage.id}
                  id={voyage.id}
                  title={voyage.title}
                  description={voyage.description}
                  images={voyage.images}
                  price={voyage.price}
                  rating={voyage.rating}
                  duration={voyage.duration}
                  tags={voyage.tags}
                  link={`/tourisme/${voyage.id}/reserver`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tourisme;
