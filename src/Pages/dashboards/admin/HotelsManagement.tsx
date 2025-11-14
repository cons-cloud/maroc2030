import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Hotel, Plus, Edit, Trash2, Star, MapPin, Phone, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import HotelForm from '../../../components/forms/HotelForm';
import ConfirmDialog from '../../../components/modals/ConfirmDialog';

interface Hotel {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  stars: number;
  price_per_night: number;
  city: string;
  region: string;
  images: string[];
  rooms_count: number;
  available: boolean;
  featured: boolean;
  contact_phone: string;
  created_at: string;
}

const HotelsManagement: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState<Hotel | null>(null);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHotels(data || []);
    } catch (error) {
      console.error('Error loading hotels:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (hotel: Hotel) => {
    setHotelToDelete(hotel);
    setShowConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!hotelToDelete) return;

    try {
      const { error } = await supabase.from('hotels').delete().eq('id', hotelToDelete.id);
      if (error) throw error;
      toast.success('Hôtel supprimé');
      setShowConfirm(false);
      setHotelToDelete(null);
      loadHotels();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setShowForm(true);
  };

  const handleNew = () => {
    setSelectedHotel(null);
    setShowForm(true);
  };

  const filteredHotels = hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec titre et actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Hôtels</h1>
            <p className="text-gray-600 mt-1">{filteredHotels.length} hôtel(s) enregistré(s)</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative grow max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un hôtel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <button
              onClick={handleNew}
              className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition whitespace-nowrap shadow-sm hover:shadow-md"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ajouter un hôtel
            </button>
          </div>
        </div>
      </div>

      {/* Liste des hôtels */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {filteredHotels.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <Hotel className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Aucun hôtel trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Aucun résultat pour votre recherche.' : 'Commencez par ajouter un nouvel hôtel.'}
            </p>
            <div className="mt-6">
              <button
                onClick={handleNew}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Ajouter un hôtel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <div key={hotel.id} className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
              {/* Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent z-10"></div>
                {hotel.images && hotel.images.length > 0 ? (
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Hotel className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                {hotel.featured && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded">
                    ⭐ En avant
                  </span>
                )}
                <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded ${
                  hotel.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {hotel.available ? '✓ Disponible' : '✗ Indisponible'}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="absolute top-2 right-2 z-20">
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(hotel);
                      }}
                      className="p-1.5 bg-white/90 rounded-full shadow hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(hotel);
                      }}
                      className="p-1.5 bg-white/90 rounded-full shadow hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">{hotel.name}</h3>
                    <div className="flex items-center text-yellow-500 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < hotel.stars ? 'fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[40px]">
                  {hotel.description || 'Aucune description disponible'}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                    <span className="truncate">{hotel.city}, {hotel.region}</span>
                  </div>
                  {hotel.contact_phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-emerald-600" />
                      <a href={`tel:${hotel.contact_phone}`} className="hover:text-emerald-600 transition-colors">
                        {hotel.contact_phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>{hotel.rooms_count} chambre{hotel.rooms_count > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="w-full">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-500">À partir de</div>
                        <span className="text-lg font-bold text-emerald-600">
                          {hotel.price_per_night?.toLocaleString('fr-MA')} DH
                          <span className="text-sm font-normal text-gray-500">/nuit</span>
                        </span>
                      </div>
                      <button
                        onClick={() => handleEdit(hotel)}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Voir détails
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Modals */}
      {showForm && (
        <HotelForm
          hotel={selectedHotel}
          onClose={() => {
            setShowForm(false);
            setSelectedHotel(null);
          }}
          onSuccess={() => {
            loadHotels();
          }}
        />
      )}

      {showConfirm && (
        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => {
            setShowConfirm(false);
            setHotelToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Supprimer l'hôtel"
          message={`Êtes-vous sûr de vouloir supprimer "${hotelToDelete?.name}" ? Cette action est irréversible.`}
          type="danger"
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      )}
    </div>
  );

  // Modals
  if (showForm) {
    return (
      <HotelForm
        hotel={selectedHotel}
        onClose={() => {
          setShowForm(false);
          setSelectedHotel(null);
        }}
        onSuccess={() => {
          loadHotels();
        }}
      />
    );
  }

  if (showConfirm) {
    return (
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setHotelToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'hôtel"
        message={`Êtes-vous sûr de vouloir supprimer "${hotelToDelete?.name}" ? Cette action est irréversible.`}
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    );
  }
};

export { HotelsManagement as default };
