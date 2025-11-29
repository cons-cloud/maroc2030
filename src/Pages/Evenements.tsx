import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiClock } from 'react-icons/fi';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import UniversalBookingForm from '../components/UniversalBookingForm';
import AuthGuard from '../components/AuthGuard';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const stripePromise = loadStripe(import.meta.env['VITE_STRIPE_PUBLIC_KEY'] || 'pk_test_51QKxxx');

interface Event {
  id: string;
  title: string;
  event_date?: string;  // Nom de colonne Supabase
  date?: string;        // Alias pour compatibilité
  location: string;
  event_time?: string;  // Nom de colonne Supabase
  time?: string;        // Alias pour compatibilité
  description: string;
  image: string;
  category: string;
  price: number;
  available_seats?: number;
}

// Données statiques en attendant la création de la table Supabase
const staticEvents: Event[] = [
  {
    id: '1',
    title: "Festival des Roses à Kelaa M'Gouna",
    date: "15-17 Mai 2024",
    location: "Vallée des Roses, Maroc",
    time: "Toute la journée",
    description: "Célébrez la récolte des roses dans la magnifique vallée du Dadès avec des défilés, des danses traditionnelles et des expositions d'artisanat local.",
    image: "./assets/events/T0.jpeg",
    category: "Festival",
    price: 250,
    available_seats: 200
  },
  {
    id: '2',
    title: "Marathon des Sables",
    date: "12-22 Avril 2024",
    location: "Désert du Sahara, Maroc",
    time: "06:00 - 18:00",
    description: "Participez à l'une des courses à pied les plus difficiles au monde à travers les paysages époustouflants du désert marocain.",
    image: "./assets/events/1.jpg",
    category: "Sport",
    price: 3500,
    available_seats: 500
  },
  {
    id: '3',
    title: "Festival des Arts Populaires de Marrakech",
    date: "22-30 Juin 2024",
    location: "Marrakech, Maroc",
    time: "18:00 - Minuit",
    description: "Découvrez la richesse du patrimoine culturel marocain à travers des spectacles de musique, de danse et d'art traditionnels.",
    image: "./assets/events/2.jpg",
    category: "Culture",
    price: 150,
    available_seats: 300
  },
  {
    id: '4',
    title: "Festival Gnaoua et Musiques du Monde",
    date: "20-23 Juin 2024",
    location: "Essaouira, Maroc",
    time: "20:00 - 02:00",
    description: "Le plus grand festival de musique Gnaoua au monde, avec des artistes internationaux et locaux.",
    image: "./assets/events/mrkc.jpg",
    category: "Musique",
    price: 200,
    available_seats: 1000
  },
  {
    id: '5',
    title: "Festival International du Film de Marrakech",
    date: "1-9 Décembre 2024",
    location: "Marrakech, Maroc",
    time: "18:00 - 23:00",
    description: "Découvrez les meilleurs films du monde entier dans la ville rouge.",
    image: "./assets/events/2.jpg",
    category: "Cinéma",
    price: 300,
    available_seats: 500
  },
  {
    id: '6',
    title: "Moussem de Tan-Tan",
    date: "15-20 Mai 2024",
    location: "Tan-Tan, Maroc",
    time: "Toute la journée",
    description: "Patrimoine culturel immatériel de l'UNESCO, célébrant les traditions nomades.",
    image: "./assets/events/T0.jpeg",
    category: "Culture",
    price: 180,
    available_seats: 250
  }
];

const Evenements = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('evenements')
        .select('*')
        .eq('available', true)
        .order('event_date', { ascending: true });

      if (error) {
        // Si la table n'existe pas encore, utiliser des données statiques
        console.warn('Table evenements non trouvée, utilisation des données statiques');
        setEvents(staticEvents);
      } else {
        setEvents(data || []);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des événements:', error);
      // Utiliser des données statiques en cas d'erreur
      setEvents(staticEvents);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowBookingForm(true);
  };

  const handleCloseBookingForm = () => {
    setShowBookingForm(false);
    setSelectedEvent(null);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Erreur', 'Veuillez entrer votre email');
      return;
    }

    try {
      setIsSubscribing(true);
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email: email,
          subscribed_at: new Date().toISOString(),
          source: 'evenements_page'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Erreur', 'Cet email est déjà inscrit à notre newsletter');
        } else {
          throw error;
        }
      } else {
        toast.success('Succès', 'Merci de votre inscription à notre newsletter !');
        setEmail('');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      toast.error('Erreur', 'Une erreur est survenue lors de l\'inscription à la newsletter');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: 'url(./assets/events/mrkc.jpg)' }}>
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Événements au Maroc</h1>
            <p className="text-xl md:text-2xl">Découvrez les événements les plus captivants à travers le royaume</p>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Événements à Venir</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Vivez des expériences uniques à travers les festivals, concerts et événements culturels du Maroc
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <motion.div
              key={event.id}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    {event.category}
                  </span>
                  <span className="text-sm text-gray-500">{event.event_date || event.date}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <FiMapPin className="mr-2" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <FiClock className="mr-2" />
                  <span>{event.event_time || event.time}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-emerald-600">{event.price} MAD</span>
                  <span className="text-sm text-gray-500">/personne</span>
                </div>
                <AuthGuard>
                  <button 
                    onClick={() => handleBookEvent(event)}
                    className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Réserver maintenant
                  </button>
                </AuthGuard>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="px-15 py-5 bg-black/30 text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors mx-auto mt-10">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Ne manquez aucun événement</h3>
            <p className="text-black/90 mb-8 max-w-2xl mx-auto">
              Inscrivez-vous à notre newsletter pour recevoir les dernières actualités sur les événements à venir au Maroc.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col md:flex-row gap-5 max-w-xl mx-auto">
              <input 
                type="email" 
                placeholder="Votre adresse email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <button 
                type="submit"
                disabled={isSubscribing}
                className="bg-white text-primary px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? 'Inscription...' : 'S\'abonner'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedEvent && (
        <Elements stripe={stripePromise}>
          <UniversalBookingForm
            serviceType="circuit"
            service={{
              id: selectedEvent.id,
              title: selectedEvent.title,
              price_per_person: selectedEvent.price,
              max_participants: selectedEvent.available_seats || 100
            }}
            onClose={handleCloseBookingForm}
          />
        </Elements>
      )}
    </div>
  );
};

export default Evenements;