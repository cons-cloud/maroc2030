import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { CreditCard, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentsManagement: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      console.log('Chargement des paiements...');
      
      // D'abord, récupérer les paiements avec les informations de base
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;
      
      console.log('Paiements chargés:', paymentsData?.length);
      
      // Ensuite, pour chaque paiement, récupérer les informations de réservation
      const paymentsWithDetails = await Promise.all(
        (paymentsData || []).map(async (payment) => {
          let booking = null;
          
          try {
            // Récupérer les détails de la réservation
            if (payment.booking_id) {
              const { data: bookingData, error: bookingError } = await supabase
                .from('bookings')
                .select('*, client:client_id(*), service:service_id(*)')
                .eq('id', payment.booking_id)
                .single();
                
              if (!bookingError && bookingData) {
                booking = {
                  id: bookingData.id,
                  client: bookingData.client_id ? {
                    id: bookingData.client_id,
                    company_name: bookingData.client?.company_name || 'Client inconnu'
                  } : null,
                  service: bookingData.service_id ? {
                    id: bookingData.service_id,
                    title: bookingData.service?.title || 'Service inconnu'
                  } : null
                };
              }
            }
          } catch (error) {
            const err = error as Error;
            console.error('Erreur lors du chargement des détails:', {
              message: err.message,
              name: err.name,
              stack: err.stack
            });
          }
          
          return {
            ...payment,
            booking
          };
        })
      );
      
      setPayments(paymentsWithDetails);
    } catch (error) {
      const err = error as Error & {
        details?: string;
        code?: string;
        hint?: string;
      };
      
      console.error('Erreur lors du chargement des paiements:', {
        message: err.message,
        details: err.details,
        code: err.code,
        hint: err.hint
      });
      
      toast.error('Erreur lors du chargement des paiements. Veuillez vérifier votre connexion et réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.booking?.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.booking?.service?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Paiements</h1>
            <p className="text-gray-600 mt-1">{filteredPayments.length} paiement(s)</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="paid">Payé</option>
                <option value="failed">Échoué</option>
                <option value="refunded">Remboursé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/80 backdrop-blur-sm divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.booking?.client?.company_name || 'Client'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{payment.booking?.service?.title || 'Service'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {payment.amount} MAD
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <CreditCard className="h-4 w-4 mr-2" />
                        {payment.payment_method || 'Carte'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default PaymentsManagement;
