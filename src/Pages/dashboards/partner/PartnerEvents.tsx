import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Users,
  DollarSign,
  MapPin,
  Eye,
  CheckCircle
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  price: number;
  max_participants: number;
  images: string[];
  available: boolean;
  registration_required: boolean;
  created_at: string;
}

interface EventRegistration {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  number_of_people: number;
  total_amount: number;
  registration_status: string;
  created_at: string;
}

const PartnerEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    price: 0,
    max_participants: 0,
    registration_required: true,
    available: true
  });

  useEffect(() => {
    if (user) {
      loadEvents();
      loadRegistrations();
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('evenements')
        .select('*')
        .eq('partner_id', user?.id)
        .eq('is_partner_event', true)
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('partner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error: any) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const eventData = {
        ...formData,
        partner_id: user?.id,
        is_partner_event: true,
        images: []
      };

      if (selectedEvent) {
        const { error } = await supabase
          .from('evenements')
          .update(eventData)
          .eq('id', selectedEvent.id);

        if (error) throw error;
        toast.success('Événement modifié avec succès');
      } else {
        const { error } = await supabase
          .from('evenements')
          .insert([eventData]);

        if (error) throw error;
        toast.success('Événement créé avec succès');
      }

      setShowForm(false);
      setSelectedEvent(null);
      resetForm();
      loadEvents();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      location: event.location,
      price: event.price,
      max_participants: event.max_participants,
      registration_required: event.registration_required,
      available: event.available
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    try {
      const { error } = await supabase
        .from('evenements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Événement supprimé');
      loadEvents();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleAvailability = async (event: Event) => {
    try {
      const { error } = await supabase
        .from('evenements')
        .update({ available: !event.available })
        .eq('id', event.id);

      if (error) throw error;
      toast.success(event.available ? 'Événement désactivé' : 'Événement activé');
      loadEvents();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      location: '',
      price: 0,
      max_participants: 0,
      registration_required: true,
      available: true
    });
  };

  const stats = {
    total: events.length,
    active: events.filter(e => e.available).length,
    totalRegistrations: registrations.length,
    confirmedRegistrations: registrations.filter(r => r.registration_status === 'confirmed').length,
    totalRevenue: registrations.reduce((sum, r) => sum + r.total_amount, 0)
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Événements</h1>
          <p className="text-gray-600 mt-1">Gérez vos événements et inscriptions</p>
        </div>
        <button
          onClick={() => {
            setSelectedEvent(null);
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Créer un événement
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inscriptions</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalRegistrations}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmées</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.confirmedRegistrations}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalRevenue} MAD</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {selectedEvent ? 'Modifier l\'événement' : 'Créer un événement'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de l'événement *
                </label>
                <input
                  type="datetime-local"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix par personne (MAD)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre maximum de participants
                </label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.registration_required}
                  onChange={(e) => setFormData({ ...formData, registration_required: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Inscription obligatoire</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Disponible</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedEvent(null);
                  resetForm();
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-colors"
              >
                {selectedEvent ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des événements */}
      {events.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun événement pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    event.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.available ? 'Actif' : 'Inactif'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-emerald-600 hover:text-emerald-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleAvailability(event)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.event_date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  {event.price > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-bold text-emerald-600">{event.price} MAD</span>
                    </div>
                  )}
                  {event.max_participants > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Max: {event.max_participants} personnes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
  );
};

export default PartnerEvents;
