import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  image?: string; // ✅ nouveau champ accepté
  images?: string[]; // toujours possible
  price: number;
  rating?: number;
  duration?: string;
  tags?: string[];
  link?: string;
  className?: string;
  onBookNow?: () => void;
}

const ImageSlider = ({ images = [] }: { images?: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // S'assurer que images est toujours un tableau
  const safeImages = Array.isArray(images) && images.length > 0 ? images : ['/placeholder.jpg'];

  const formatImageUrl = (img: string) => {
    if (!img) return '/placeholder.jpg';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    if (img.startsWith('/')) return img; // Les chemins absolus fonctionnent avec la configuration de base de Vite
    return `/${img.replace(/^\/+/, '')}`;
  };

  return (
    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
      {safeImages.map((image, index) => {
        const imageUrl = formatImageUrl(image);
        return (
          <img
            key={index}
            src={imageUrl}
            alt={`${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== '/placeholder.jpg') {
                target.src = '/placeholder.jpg';
              }
            }}
          />
        );
      })}

      {safeImages.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
          {safeImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  title,
  description,
  image,
  images = [],
  price,
  rating,
  duration,
  tags,
  link = '#',
  className = '',
}) => {
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    guests: 1
  });

  const handleBookNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('handleBookNow appelé, affichage du formulaire de réservation');
    setIsBookingOpen(true);
  };
  
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Préparer les données de réservation
    const reservationData = {
      serviceType: link.split('/')[1] || 'service',
      serviceId: id,
      serviceTitle: title,
      servicePrice: price,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      guests: bookingData.guests,
      totalPrice: price * (bookingData.endDate && bookingData.startDate ? 
        Math.ceil((new Date(bookingData.endDate).getTime() - new Date(bookingData.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 1)
    };
    
    // Rediriger vers la page de connexion avec les données de réservation
    navigate('/login', {
      state: {
        from: window.location.pathname,
        reservationData,
        redirectTo: '/payment',
        message: 'Veuillez vous connecter pour finaliser votre réservation.'
      }
    });
    
    setIsBookingOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value, 10) : value
    }));
  };
  
  const handleLogin = () => {
    // Rediriger vers la page de connexion avec les informations de redirection
    navigate('/login', { 
      state: { 
        from: window.location.pathname,
        serviceType: link.split('/')[2] || title.toLowerCase(),
        serviceId: id,
        serviceTitle: title,
        servicePrice: price
      } 
    });
  };

  // Pour le tourisme, on ne veut pas de lien de navigation, juste la popup
  const cardLink = link && link.includes('tourisme') ? '#' : link;

  // Gestion sécurisée des images
  const safeImages = React.useMemo(() => {
    try {
      if (Array.isArray(images) && images.length > 0) {
        return images;
      }
      if (image) {
        return [image];
      }
      return ['/placeholder.jpg'];
    } catch (err) {
      console.error('Erreur lors du chargement des images:', err);
      return ['/placeholder.jpg'];
    }
  }, [images, image]);

  return (
    <div className={`group relative overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-lg ${className}`}>
      <Link
        to={cardLink}
        className="block h-full w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl"
        aria-label={`En savoir plus sur ${title}`}
        onClick={(e) => {
          // Empêcher la navigation si c'est pour le tourisme
          if (cardLink === '#') {
            e.preventDefault();
          }
        }}
      >
        <ImageSlider images={safeImages} />

        <div className="p-4">
          <h3 className="mb-2 text-lg font-bold text-gray-900 transition-colors duration-200 group-hover:text-primary-700">
            {title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>

          <div className="mt-4 flex justify-between items-center">
            <div>
              <span className="text-lg font-bold">{price} MAD</span>
              {duration && <span className="ml-2 text-sm text-gray-500">• {duration}</span>}
            </div>

            <button
              onClick={(e) => {
                console.log('Bouton Réserver cliqué');
                handleBookNow(e);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg z-10 relative"
              style={{ minWidth: '100px' }}
            >
              Réserver
            </button>
          </div>

          {rating && (
            <div className="mt-2 flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
            </div>
          )}

          {tags && tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      <AnimatePresence>
        {isBookingOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form onSubmit={handleBookingSubmit} className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Réservation - {title}</h3>
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Fermer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">{title}</h4>
                  <p className="text-gray-600">{description}</p>
                  <p className="mt-2 text-lg font-semibold text-emerald-600">{price} MAD par nuit</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Date d'arrivée</label>
                    <input
                      id="startDate"
                      name="startDate"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Date de départ</label>
                    <input
                      id="endDate"
                      name="endDate"
                      type="date"
                      required
                      min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                      value={bookingData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">Nombre de personnes</label>
                    <select 
                      id="guests"
                      name="guests"
                      value={bookingData.guests}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num} {num > 1 ? 'personnes' : 'personne'}</option>
                      ))}
                    </select>
                  </div>
                  
                  {bookingData.startDate && bookingData.endDate && (
                    <div className="bg-emerald-50 p-4 rounded-lg col-span-full">
                      <p className="font-medium text-gray-900">Récapitulatif</p>
                      <p className="text-sm text-gray-600">
                        Du {new Date(bookingData.startDate).toLocaleDateString('fr-FR')} 
                        au {new Date(bookingData.endDate).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {bookingData.guests} {bookingData.guests > 1 ? 'personnes' : 'personne'}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-emerald-600">
                        Total: {price * Math.ceil((new Date(bookingData.endDate).getTime() - new Date(bookingData.startDate).getTime()) / (1000 * 60 * 60 * 24))} MAD
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={!bookingData.startDate || !bookingData.endDate}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuer vers le paiement
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {false && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl border border-gray-100">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Connexion requise</h3>
                <p className="text-gray-600 mb-6">Veuillez vous connecter ou créer un compte pour effectuer une réservation.</p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={handleLogin}
                  className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Se connecter
                </button>
                
                <button
                  onClick={() => {
                    navigate('/inscription', { 
                      state: { 
                        from: window.location.pathname,
                        serviceType: link.split('/')[1] || 'service',
                        serviceId: id,
                        serviceTitle: title,
                        servicePrice: price
                      } 
                    });
                  }}
                  className="w-full px-6 py-3 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Créer un compte
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={() => {
                    // setShowLoginPrompt(false);
                  }}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  Continuer sans se connecter
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceCard;
