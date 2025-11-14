import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import {
  DollarSign,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Search,
  Filter,
  Download
} from 'lucide-react';

interface PartnerEarning {
  id: string;
  partner_id: string;
  booking_id: string;
  amount: number;
  commission: number;
  partner_amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  partner: {
    company_name: string;
    email: string;
    phone: string;
  };
  booking: {
    service_title: string;
    client_name: string;
    start_date: string;
  };
}

const PartnerEarningsManagement: React.FC = () => {
  const [earnings, setEarnings] = useState<PartnerEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partner_earnings')
        .select(`
          *,
          partner:profiles!partner_id(company_name, email, phone),
          booking:bookings!booking_id(service_title, client_name, start_date)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEarnings(data || []);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des gains');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (earningId: string) => {
    if (!confirm('Confirmer le paiement de ce gain au partenaire ?')) return;

    try {
      const { error } = await supabase
        .rpc('mark_partner_paid', { p_earning_id: earningId });

      if (error) throw error;

      toast.success('Paiement confirmé avec succès');
      loadEarnings();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la confirmation du paiement');
    }
  };

  const filteredEarnings = earnings.filter(earning => {
    const matchesSearch = earning.partner.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         earning.booking.service_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || earning.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: earnings.reduce((sum, e) => sum + e.partner_amount, 0),
    pending: earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.partner_amount, 0),
    paid: earnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.partner_amount, 0),
    commission: earnings.reduce((sum, e) => sum + e.commission, 0)
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Paiements Partenaires</h1>
        <p className="text-gray-600 mt-1">Gérez les gains et paiements des partenaires</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Gains</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total.toLocaleString()} MAD
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {stats.pending.toLocaleString()} MAD
              </p>
            </div>
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Payés</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.paid.toLocaleString()} MAD
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Commission (10%)</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {stats.commission.toLocaleString()} MAD
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un partenaire ou service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Filtre par statut */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="paid">Payés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des gains */}
      {filteredEarnings.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun gain trouvé</p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partenaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission (10%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gain Partenaire (90%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/80 backdrop-blur-sm divide-y divide-gray-200">
                {filteredEarnings.map((earning) => (
                  <tr key={earning.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {earning.partner.company_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {earning.partner.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{earning.booking.service_title}</div>
                      <div className="text-sm text-gray-500">Client: {earning.booking.client_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {earning.amount.toLocaleString()} MAD
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-purple-600 font-medium">
                        {earning.commission.toLocaleString()} MAD
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-600 font-bold">
                        {earning.partner_amount.toLocaleString()} MAD
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {earning.status === 'paid' ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Payé
                        </span>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          <Clock className="w-4 h-4 mr-1" />
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(earning.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      {earning.paid_at && (
                        <div className="text-xs text-green-600 mt-1">
                          Payé le {new Date(earning.paid_at).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {earning.status === 'pending' && (
                        <button
                          onClick={() => markAsPaid(earning.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Marquer payé
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerEarningsManagement;
