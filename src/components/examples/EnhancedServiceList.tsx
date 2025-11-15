import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import ErrorBoundary from '../ErrorBoundary';
import LoadingState from '../LoadingState';
import LazyImage from '../LazyImage';
import usePagination from '../../hooks/usePagination';
import { validateBookingForm } from '../../utils/validation';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  type: string;
  duration?: string;
}

const EnhancedServiceList: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    guests: 1,
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configuration de la pagination
  const pagination = usePagination({
    initialPage: 1,
    itemsPerPage: 6,
    totalItems: services.length,
  });
  
  const { currentPage, totalPages, itemsPerPage, nextPage, prevPage, goToPage, setItemsPerPage } = pagination;
  
  // Calculer les index de début et de fin pour l'affichage
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, services.length);
  const canGoToNextPage = currentPage < totalPages;
  const canGoToPrevPage = currentPage > 1;
  
  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Moins de pages que le maximum à afficher, on les affiche toutes
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Plus de pages que le maximum à afficher, on affiche des points de suspension
      const leftSide = Math.floor(maxPagesToShow / 2);
      const rightSide = maxPagesToShow - leftSide - 1;
      
      if (currentPage <= leftSide + 1) {
        // Près du début
        for (let i = 1; i <= maxPagesToShow - 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - rightSide) {
        // Près de la fin
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - (maxPagesToShow - 2); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Au milieu
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - leftSide + 1; i <= currentPage + rightSide - 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Charger les services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setServices(data || []);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err instanceof Error ? err : new Error('Failed to load services'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Gérer la soumission du formulaire de réservation
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valider le formulaire
    const { isValid, errors } = validateBookingForm(formData);
    setFormErrors(errors);
    
    if (!isValid || !selectedService) return;
    
    try {
      setIsSubmitting(true);
      
      // Ici, vous ajouteriez la logique pour enregistrer la réservation
      // Par exemple, un appel à votre API ou à Supabase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simuler une requête
      
      // Réinitialiser le formulaire et fermer la modal
      setFormData({
        startDate: '',
        endDate: '',
        guests: 1,
        fullName: '',
        email: '',
        phone: '',
        specialRequests: '',
      });
      setSelectedService(null);
      setIsBookingModalOpen(false);
      
      // Afficher un message de succès
      toast.success('Réservation effectuée avec succès !');
    } catch (err) {
      console.error('Erreur lors de la réservation:', err);
      toast.error('Une erreur est survenue lors de la réservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value, 10) || 1 : value,
    }));
  };

  // Ouvrir la modal de réservation avec le service sélectionné
  const openBookingModal = (service: Service) => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  // Afficher un indicateur de chargement
  if (isLoading) {
    return <LoadingState fullScreen text="Chargement des services..." />;
  }

  // Afficher une erreur si le chargement a échoué
  if (error) {
    return (
      <ErrorBoundary>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600">
            Erreur lors du chargement des services
          </h2>
          <p className="mt-2 text-gray-600">
            {error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Réessayer
          </button>
        </div>
      </ErrorBoundary>
    );
  }

  // Afficher un message si aucun service n'est disponible
  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700">
          Aucun service disponible pour le moment
        </h2>
        <p className="mt-2 text-gray-600">
          Revenez plus tard pour découvrir nos offres.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Nos Services</h1>
      
      {/* Liste des services avec pagination */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {services.slice(startIndex, endIndex).map((service) => (
          <div 
            key={service.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="h-48 overflow-hidden">
              <LazyImage
                src={service.image_url}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{service.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-emerald-600">
                  {service.price.toFixed(2)} €
                  {service.duration && ` / ${service.duration}`}
                </span>
                <button
                  onClick={() => openBookingModal(service)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                >
                  Réserver
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
          <div className="text-sm text-gray-600">
            Affichage de {startIndex + 1} à {Math.min(endIndex, services.length)} sur {services.length} services
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-1 border rounded text-sm"
            >
              {[6, 12, 24, 48].map((num) => (
                <option key={num} value={num}>
                  {num} par page
                </option>
              ))}
            </select>

            <button
              onClick={prevPage}
              disabled={!canGoToPrevPage}
              className={`px-3 py-1 border rounded ${canGoToPrevPage ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
            >
              Précédent
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) =>
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2">
                    {page}
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page as number)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentPage === page
                        ? 'bg-emerald-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={nextPage}
              disabled={!canGoToNextPage}
              className={`px-3 py-1 border rounded ${canGoToNextPage ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Modal de réservation */}
      {isBookingModalOpen && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Réserver {selectedService.title}</h2>
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'arrivée *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData['startDate']}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full p-2 border rounded ${formErrors['startDate'] ? 'border-red-500' : 'border-gray-300'}`}
                      required
                    />
                    {formErrors['startDate'] && (
                      <p className="mt-1 text-sm text-red-600">{formErrors['startDate']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de départ *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData['endDate']}
                      onChange={handleInputChange}
                      min={formData['startDate'] || new Date().toISOString().split('T')[0]}
                      className={`w-full p-2 border rounded ${formErrors['endDate'] ? 'border-red-500' : 'border-gray-300'}`}
                      required
                    />
                    {formErrors['endDate'] && (
                      <p className="mt-1 text-sm text-red-600">{formErrors['endDate']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de personnes *
                    </label>
                    <input
                      type="number"
                      name="guests"
                      min="1"
                      max="20"
                      value={formData['guests']}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${formErrors['guests'] ? 'border-red-500' : 'border-gray-300'}`}
                      required
                    />
                    {formErrors['guests'] && (
                      <p className="mt-1 text-sm text-red-600">{formErrors['guests']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData['fullName']}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${formErrors['fullName'] ? 'border-red-500' : 'border-gray-300'}`}
                      required
                    />
                    {formErrors['fullName'] && (
                      <p className="mt-1 text-sm text-red-600">{formErrors['fullName']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData['email']}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${formErrors['email'] ? 'border-red-500' : 'border-gray-300'}`}
                      required
                    />
                    {formErrors['email'] && (
                      <p className="mt-1 text-sm text-red-600">{formErrors['email']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData['phone']}
                      onChange={handleInputChange}
                      placeholder="+212XXXXXXXXX ou 0XXXXXXXXX"
                      className={`w-full p-2 border rounded ${formErrors['phone'] ? 'border-red-500' : 'border-gray-300'}`}
                      required
                    />
                    {formErrors['phone'] && (
                      <p className="mt-1 text-sm text-red-600">{formErrors['phone']}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Demandes spéciales (facultatif)
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData['specialRequests']}
                    onChange={handleInputChange}
                    rows={3}
                    maxLength={500}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData['specialRequests']?.length || 0}/500 caractères
                  </p>
                  {formErrors['specialRequests'] && (
                    <p className="mt-1 text-sm text-red-600">{formErrors['specialRequests']}</p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Récapitulatif</h3>
                  <div className="flex justify-between mb-2">
                    <span>{selectedService.title}</span>
                    <span className="font-medium">{selectedService.price.toFixed(2)} €</span>
                  </div>
                  {formData['startDate'] && formData['endDate'] && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Durée du séjour:</span>
                      <span>
                        {new Date(formData['startDate']).toLocaleDateString()} -{' '}
                        {new Date(formData['endDate']).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>
                      {(() => {
                        if (!selectedService) return '0.00';
                        
                        const guests = formData['guests'] || 1;
                        let days = 1;
                        
                        if (formData['startDate'] && formData['endDate']) {
                          const start = new Date(formData['startDate']).getTime();
                          const end = new Date(formData['endDate']).getTime();
                          days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
                        }
                        
                        return (selectedService.price * guests * days).toFixed(2);
                      })()} €
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Traitement...' : 'Confirmer la réservation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedServiceList;
