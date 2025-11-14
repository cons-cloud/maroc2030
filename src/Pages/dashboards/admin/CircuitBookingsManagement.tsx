import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download
} from 'lucide-react';

interface Booking {
  id: string;
  circuit_id: string;
  circuit_title: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  number_of_people: number;
  custom_duration: number;
  start_date: string;
  total_price: number;
  payment_status: string;
  payment_method: string;
  special_requests: string;
  created_at: string;
}

const CircuitBookingsManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          circuits_touristiques (
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformer les données
      const formattedBookings = data?.map((booking: any) => ({
        ...booking,
        circuit_title: booking.circuits_touristiques?.title || 'Circuit inconnu'
      })) || [];

      setBookings(formattedBookings);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: status })
        .eq('id', bookingId);

      if (error) throw error;
      toast.success('Statut mis à jour');
      loadBookings();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.payment_status === filter;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.payment_status === 'pending').length,
    confirmed: bookings.filter(b => b.payment_status === 'confirmed').length,
    cancelled: bookings.filter(b => b.payment_status === 'cancelled').length,
    totalRevenue: bookings
      .filter(b => b.payment_status === 'confirmed')
      .reduce((sum, b) => sum + b.total_price, 0),
    totalPeople: bookings
      .filter(b => b.payment_status === 'confirmed')
      .reduce((sum, b) => sum + b.number_of_people, 0)
  };

  const exportToCSV = () => {
    const headers = [
      'Date Réservation',
      'Circuit',
      'Client',
      'Email',
      'Téléphone',
      'Personnes',
      'Durée',
      'Date Départ',
      'Prix Total',
      'Statut'
    ];

    const rows = filteredBookings.map(booking => [
      new Date(booking.created_at).toLocaleDateString('fr-FR'),
      booking.circuit_title,
      booking.client_name,
      booking.client_email,
      booking.client_phone,
      booking.number_of_people,
      `${booking.custom_duration} jours`,
      new Date(booking.start_date).toLocaleDateString('fr-FR'),
      `${booking.total_price} MAD`,
      booking.payment_status
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reservations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Réservations Circuits</h1>
          <p className="text-gray-600 mt-1">Gérez toutes les réservations de circuits</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Download className="w-5 h-5" />
          Exporter CSV
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmées</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Annulées</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenu</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.totalRevenue.toLocaleString()} MAD
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Voyageurs</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.totalPeople}</p>
            </div>
            <Users className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toutes ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'pending'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En attente ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'confirmed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Confirmées ({stats.confirmed})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'cancelled'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Annulées ({stats.cancelled})
          </button>
        </div>
      </div>

      {/* Liste des réservations */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Circuit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Détails</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white/80 backdrop-blur-sm divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(booking.created_at).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(booking.created_at).toLocaleTimeString('fr-FR')}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{booking.circuit_title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{booking.client_name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {booking.client_email}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {booking.client_phone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <Users className="w-4 h-4 inline mr-1" />
                    {booking.number_of_people} pers.
                  </div>
                  <div className="text-sm text-gray-500">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {booking.custom_duration} jours
                  </div>
                  <div className="text-xs text-gray-500">
                    Départ: {new Date(booking.start_date).toLocaleDateString('fr-FR')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-gray-900">
                    {booking.total_price.toLocaleString()} MAD
                  </span>
                  <div className="text-xs text-gray-500">{booking.payment_method}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={booking.payment_status}
                    onChange={(e) => updatePaymentStatus(booking.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${
                      booking.payment_status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.payment_status === 'pending'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="text-emerald-600 hover:text-emerald-900"
                    title="Voir détails"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune réservation pour le moment</p>
          </div>
        )}
      </div>

      {/* Modal détails */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl max-w-xs w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-2xl font-bold">Détails de la Réservation</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Circuit</p>
                  <p className="font-medium">{selectedBooking.circuit_title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date de réservation</p>
                  <p className="font-medium">
                    {new Date(selectedBooking.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Client</p>
                  <p className="font-medium">{selectedBooking.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedBooking.client_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium">{selectedBooking.client_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nombre de personnes</p>
                  <p className="font-medium">{selectedBooking.number_of_people}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Durée</p>
                  <p className="font-medium">{selectedBooking.custom_duration} jours</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date de départ</p>
                  <p className="font-medium">
                    {new Date(selectedBooking.start_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Prix total</p>
                  <p className="font-medium text-lg text-emerald-600">
                    {selectedBooking.total_price.toLocaleString()} MAD
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Méthode de paiement</p>
                  <p className="font-medium">{selectedBooking.payment_method}</p>
                </div>
              </div>

              {selectedBooking.special_requests && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Demandes spéciales</p>
                  <p className="bg-gray-50 p-3 rounded-lg">{selectedBooking.special_requests}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircuitBookingsManagement;
