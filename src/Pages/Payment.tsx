import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { stripeService } from '../services/stripeService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  CreditCard, 
  Banknote, 
  Building2, 
  CheckCircle, 
  Loader,
  ArrowLeft,
  Shield
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { MESSAGES } from '../constants/messages';
import { formatDualCurrency, formatMad, formatEur, madToEur } from '../utils/currency';

const Payment: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'bank_transfer'>('card');
  const [reservationData, setReservationData] = useState<any>(null);
  
  // Extraire les données de l'URL ou de l'état de navigation
  const { 
    bookingId, 
    bookingType, 
    totalPrice, 
    serviceTitle, 
    serviceType,
    serviceId,
    startDate,
    endDate,
    guests,
    customerInfo,
    fromLogin
  } = location.state || {};

  // Vérifier s'il y a une réservation en attente dans le sessionStorage
  const checkPendingReservation = useCallback(() => {
    try {
      const saved = sessionStorage.getItem('pendingReservation');
      if (saved) {
        const reservation = JSON.parse(saved);
        // Vérifier si la réservation a moins de 30 minutes
        const reservationTime = new Date(reservation.timestamp).getTime();
        const now = new Date().getTime();
        const thirtyMinutes = 30 * 60 * 1000; // 30 minutes en millisecondes

        if (now - reservationTime < thirtyMinutes) {
          setReservationData(reservation);
          return true;
        } else {
          // Supprimer la réservation expirée
          sessionStorage.removeItem('pendingReservation');
          toast.info('Information', MESSAGES.BOOKING.SESSION_EXPIRED);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des réservations en attente:', error);
      toast.error('Erreur', MESSAGES.ERROR.DEFAULT);
    }
    return false;
  }, []);

  useEffect(() => {
    // Si l'utilisateur vient de se connecter et qu'il y a des données de réservation
    if (fromLogin && location.state?.reservationData) {
      setReservationData(location.state.reservationData);
      // Nettoyer le sessionStorage après utilisation
      sessionStorage.removeItem('pendingReservation');
    } else if (!bookingId && location.state) {
      // Si on a des données de réservation mais pas encore de bookingId
      setReservationData(location.state);
    } else if (!bookingId) {
      // Vérifier s'il y a une réservation en attente
      checkPendingReservation();
    }
  }, [location.state, fromLogin, bookingId, checkPendingReservation]);

  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    // Si on a des données de réservation mais pas encore de bookingId
    if (reservationData && !bookingId) {
      createReservation();
    } else if (!bookingId || !totalPrice) {
      // Vérifier s'il y a une réservation en attente avant de rediriger
      if (!checkPendingReservation()) {
        toast.error('Erreur', MESSAGES.PAYMENT.MISSING_INFO);
        navigate('/');
      }
    }
  }, [reservationData, bookingId, totalPrice, navigate, checkPendingReservation]);

  const createReservation = async () => {
    if (!reservationData || !user) return;
    
    setLoading(true);
    
    try {
      const { data: reservation, error } = await supabase
        .from(`${reservationData.serviceType}_bookings`)
        .insert([{
          user_id: user.id,
          service_id: reservationData.serviceId,
          start_date: reservationData.startDate,
          end_date: reservationData.endDate,
          guests: reservationData.guests,
          total_price: reservationData.totalPrice,
          status: 'en_attente',
          customer_name: reservationData.customerInfo.fullName,
          customer_email: reservationData.customerInfo.email,
          customer_phone: reservationData.customerInfo.phone,
          special_requests: reservationData.customerInfo.specialRequests || ''
        }])
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour l'URL avec l'ID de réservation
      navigate(location.pathname, {
        state: {
          ...location.state,
          bookingId: reservation.id,
          bookingType: reservationData.serviceType,
          totalPrice: reservationData.totalPrice,
          serviceTitle: reservationData.serviceTitle
        },
        replace: true
      });

    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      toast.error('Erreur', 'Erreur lors de la création de la réservation');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Créer l'intention de paiement avec la commission de 10%
      const { clientSecret, paymentIntent } = await stripeService.createPaymentIntent({
        amount: totalPrice,
        currency: 'MAD',
        customerId: user?.id,
        description: `Paiement pour ${serviceTitle}`,
        metadata: {
          serviceType: bookingType,
          serviceId: serviceId,
          startDate,
          endDate,
          guests
        },
        bookingId,
        partnerId: location.state?.partnerId // Assurez-vous de passer le partnerId depuis le state de navigation
      });

      // 2. Confirmer le paiement
      const result = await stripeService.confirmPayment({
        paymentIntentId: paymentIntent.id,
        paymentMethod: {
          card: {
            number: cardData.cardNumber,
            exp_month: cardData.expiryDate.split('/')[0],
            exp_year: cardData.expiryDate.split('/')[1],
            cvc: cardData.cvv
          },
          billing_details: {
            name: cardData.cardName,
            email: profile?.email
          }
        },
        customerEmail: profile?.email
      });

      if (result.status === 'succeeded') {
        // 3. Mettre à jour le statut de la réservation
        const tableName = bookingType === 'car' ? 'car_bookings' :
                         bookingType === 'tourism' ? 'tourism_bookings' : 'property_bookings';

        const { error: bookingError } = await supabase
          .from(tableName)
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId);

        if (bookingError) throw bookingError;

        toast.success('Paiement effectué avec succès !');
        
        // Rediriger vers la page de confirmation
        navigate('/payment/success', {
          state: {
            paymentId: paymentIntent.id,
            bookingId,
            totalPrice,
            serviceTitle,
            commission: totalPrice * 0.10, // 10% de commission
            partnerAmount: totalPrice * 0.90 // 90% pour le partenaire
          }
        });
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error('Erreur', error.message || 'Erreur lors du traitement du paiement');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    {
      id: 'card',
      name: 'Carte bancaire',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express',
    },
    {
      id: 'cash',
      name: 'Espèces',
      icon: Banknote,
      description: 'Paiement en espèces à la livraison',
    },
    {
      id: 'bank_transfer',
      name: 'Virement bancaire',
      icon: Building2,
      description: 'Virement bancaire direct',
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Bouton retour */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formulaire de paiement */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Paiement sécurisé
                  </h1>

                  {/* Méthodes de paiement */}
                  <div className="space-y-4 mb-6">
                    <h2 className="font-semibold text-gray-900">Choisissez votre mode de paiement</h2>
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`w-full flex items-center p-4 border-2 rounded-lg transition-all ${
                            paymentMethod === method.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`h-6 w-6 mr-4 ${
                            paymentMethod === method.id ? 'text-primary' : 'text-gray-400'
                          }`} />
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{method.name}</p>
                            <p className="text-sm text-gray-500">{method.description}</p>
                          </div>
                          {paymentMethod === method.id && (
                            <CheckCircle className="h-6 w-6 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Formulaire carte bancaire */}
                  {paymentMethod === 'card' && (
                    <form onSubmit={handlePayment} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Numéro de carte
                        </label>
                        <input
                          type="text"
                          value={cardData.cardNumber}
                          onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom sur la carte
                        </label>
                        <input
                          type="text"
                          value={cardData.cardName}
                          onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
                          placeholder="JOHN DOE"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date d'expiration
                          </label>
                          <input
                            type="text"
                            value={cardData.expiryDate}
                            onChange={(e) => setCardData({ ...cardData, expiryDate: e.target.value })}
                            placeholder="MM/AA"
                            maxLength={5}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            value={cardData.cvv}
                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                            placeholder="123"
                            maxLength={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 mt-6"
                      >
                        {loading ? (
                          <>
                            <Loader className="h-5 w-5 mr-2 animate-spin" />
                            Traitement en cours...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-5 w-5 mr-2" />
                            Payer {formatMad(totalPrice || 0)}
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Paiement en espèces */}
                  {paymentMethod === 'cash' && (
                    <div className="space-y-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">
                          Vous pourrez payer en espèces lors de la prise en charge du service.
                        </p>
                      </div>
                      <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader className="h-5 w-5 mr-2 animate-spin" />
                            Confirmation...
                          </>
                        ) : (
                          <>
                            Confirmer pour {formatMad(totalPrice || 0)}
                            <div className="text-xs opacity-80 ml-1">
                              (≈ {formatEur(madToEur(totalPrice || 0))})
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Virement bancaire */}
                  {paymentMethod === 'bank_transfer' && (
                    <div className="space-y-4">
                      <div className="bg-emerald-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-emerald-800 mb-2 font-medium">
                          Coordonnées bancaires :
                        </p>
                        <p className="text-sm text-emerald-700">
                          Banque : Attijariwafa Bank<br />
                          IBAN : MA64 0011 0000 0000 0123 4567 89<br />
                          BIC/SWIFT : BCMAMAMC<br />
                          Référence : {bookingId}
                        </p>
                      </div>
                      <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader className="h-5 w-5 mr-2 animate-spin" />
                            Confirmation...
                          </>
                        ) : (
                          <>
                            Confirmer pour {formatMad(totalPrice || 0)}
                            <div className="text-xs opacity-80 ml-1">
                              (≈ {formatEur(madToEur(totalPrice || 0))})
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Sécurité */}
                  <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
                    <Shield className="h-4 w-4 mr-2" />
                    Paiement 100% sécurisé
                  </div>
                </div>
              </div>

              {/* Résumé de la commande */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Résumé</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Service</p>
                      <p className="font-medium text-gray-900">{serviceTitle}</p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Sous-total</span>
                        <div className="text-right">
                          {formatDualCurrency(totalPrice || 0)}
                        </div>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Frais de service</span>
                        <span className="font-medium">Inclus</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total</span>
                        <div className="text-right">
                          {formatDualCurrency(totalPrice || 0)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-800">
                      ✓ Annulation gratuite jusqu'à 24h avant<br />
                      ✓ Confirmation immédiate<br />
                      ✓ Support client 24/7
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Payment;
