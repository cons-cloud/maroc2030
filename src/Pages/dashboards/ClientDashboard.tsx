import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Home from '../Home';
import { BookingModal } from '../../components/BookingModal';
import { ROUTES } from '../../config/routes';

// Type pour l'appartement sélectionné
interface Apartment {
  id: string;
  type: 'car' | 'tourism' | 'property';
  title: string;
  price: number;
  partnerId?: string;
  image?: string;
}

const ClientDashboard: React.FC = () => {
  const [selectedService, setSelectedService] = useState<Apartment | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleOpenBooking = (service: Apartment) => {
    // Si l'utilisateur n'est pas connecté, le rediriger vers la page de connexion
    if (!user) {
      navigate(ROUTES.LOGIN, {
        state: {
          from: window.location.pathname,
          message: 'Veuillez vous connecter pour effectuer une réservation'
        }
      });
      return;
    }
    
    // Si l'utilisateur est connecté, ouvrir le modal de réservation
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingModalOpen(false);
    setSelectedService(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Home onOpenBooking={handleOpenBooking} />
      {selectedService && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={handleCloseBooking}
          service={{
            id: selectedService.id,
            type: selectedService.type || 'property',
            title: selectedService.title,
            price: selectedService.price,
            partnerId: selectedService.partnerId,
            image: selectedService.image
          }}
        />
      )}
    </div>
  );
};

export default ClientDashboard;
