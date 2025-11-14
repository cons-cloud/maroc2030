import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { Users, Clock, MapPin, Star, Check } from 'lucide-react';
import CircuitBookingForm from '../components/CircuitBookingForm';
import AuthGuard from '../components/AuthGuard';
import LoadingSpinner from '../components/LoadingSpinner';
import { STRIPE_PUBLIC_KEY } from '../config/stripe';

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

interface Circuit {
  id: string;
  title: string;
  description: string;
  images: string[];
  price_per_person: number;
  duration_days: number;
  city: string;
  highlights: string[];
  included: string[];
  not_included: string[];
  itinerary: any[];
  max_participants: number;
  available: boolean;
}

const CircuitDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [circuit, setCircuit] = useState<Circuit | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadCircuit();
    }
  }, [id]);

  const loadCircuit = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('circuits_touristiques')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCircuit(data);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Circuit non trouvé');
      navigate('/services/tourisme');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!circuit) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Galerie d'images */}
      <div className="relative h-96 bg-gray-900">
        <img
          src={circuit.images[currentImageIndex] || '/assets/hero/hero1.jpg'}
          alt={circuit.title}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Navigation images */}
        {circuit.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {circuit.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentImageIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}

        {/* Titre sur l'image */}
        <div className="absolute bottom-8 left-0 right-0 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{circuit.title}</h1>
          <div className="flex items-center justify-center gap-4 text-lg">
            <span className="flex items-center gap-1">
              <MapPin className="w-5 h-5" />
              {circuit.city}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-5 h-5" />
              {circuit.duration_days} jours
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{circuit.description}</p>
            </div>

            {/* Points forts */}
            {circuit.highlights && circuit.highlights.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Points forts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {circuit.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inclus / Non inclus */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inclus */}
              {circuit.included && circuit.included.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Inclus</h3>
                  <ul className="space-y-2">
                    {circuit.included.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Non inclus */}
              {circuit.not_included && circuit.not_included.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Non inclus</h3>
                  <ul className="space-y-2">
                    {circuit.not_included.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 font-bold flex-shrink-0">✕</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Itinéraire */}
            {circuit.itinerary && circuit.itinerary.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Itinéraire</h2>
                <div className="space-y-4">
                  {circuit.itinerary.map((day: any, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <h4 className="font-bold text-lg text-gray-900">
                        Jour {index + 1}: {day.title}
                      </h4>
                      <p className="text-gray-700 mt-1">{day.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Réservation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-emerald-600 mb-2">
                  {circuit.price_per_person.toLocaleString()} MAD
                </div>
                <p className="text-gray-600">par personne</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-5 h-5" />
                    Durée
                  </span>
                  <span className="font-semibold">{circuit.duration_days} jours</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="flex items-center gap-2 text-gray-700">
                    <Users className="w-5 h-5" />
                    Max participants
                  </span>
                  <span className="font-semibold">{circuit.max_participants || 'Illimité'}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-5 h-5" />
                    Départ
                  </span>
                  <span className="font-semibold">{circuit.city}</span>
                </div>
              </div>

              <AuthGuard>
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Réserver maintenant
                </button>
              </AuthGuard>

              <p className="text-xs text-gray-500 text-center mt-4">
                Paiement sécurisé • Confirmation immédiate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de réservation */}
      {showBookingForm && (
        <Elements stripe={stripePromise}>
          <CircuitBookingForm
            circuit={circuit}
            onClose={() => setShowBookingForm(false)}
          />
        </Elements>
      )}
    </div>
  );
};

export default CircuitDetails;
