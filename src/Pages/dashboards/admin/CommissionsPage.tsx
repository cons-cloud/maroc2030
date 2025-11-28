import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Download, Filter, X, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Commission {
  payment_id: string;
  booking_id: string;
  service_name: string;
  service_type: string;
  partner_id: string;
  partner_name: string;
  total_amount: number;
  admin_commission: number;
  partner_amount: number;
  payment_status: string;
  paid_at: string;
  is_commission_paid: boolean;
}

export const CommissionsPage: React.FC = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: 'all',
    serviceType: 'all'
  });

  const loadCommissions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('commission_reports')
        .select('*')
        .order('paid_at', { ascending: false });

      // Appliquer les filtres
      if (filters.dateFrom) {
        query = query.gte('paid_at', `${filters.dateFrom}T00:00:00`);
      }
      if (filters.dateTo) {
        query = query.lte('paid_at', `${filters.dateTo}T23:59:59`);
      }
      if (filters.status !== 'all') {
        query = query.eq('is_commission_paid', filters.status === 'paid');
      }
      if (filters.serviceType !== 'all') {
        query = query.eq('service_type', filters.serviceType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCommissions(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des commissions:', error);
      toast.error('Erreur lors du chargement des commissions');
    } finally {
      setLoading(false);
    }
  };

  const toggleCommissionStatus = async (paymentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          metadata: { is_commission_paid: !currentStatus },
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;
      
      toast.success(`Commission marquée comme ${!currentStatus ? 'payée' : 'non payée'}`);
      loadCommissions();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const exportToCSV = () => {
    // En-têtes du CSV
    const headers = [
      'ID Paiement',
      'ID Réservation',
      'Service',
      'Type',
      'Partenaire',
      'Montant Total (MAD)',
      'Commission (10%)',
      'Montant Partenaire',
      'Statut Paiement',
      'Date Paiement',
      'Statut Commission'
    ];

    // Lignes de données
    const csvRows = commissions.map(commission => [
      `"${commission.payment_id}"`,
      `"${commission.booking_id}"`,
      `"${commission.service_name || 'N/A'}"`,
      `"${commission.service_type || 'N/A'}"`,
      `"${commission.partner_name || 'N/A'}"`,
      commission.total_amount?.toFixed(2) || '0.00',
      commission.admin_commission?.toFixed(2) || '0.00',
      commission.partner_amount?.toFixed(2) || '0.00',
      `"${commission.payment_status || 'N/A'}"`,
      `"${format(new Date(commission.paid_at), 'PPpp', { locale: fr })}"`,
      `"${commission.is_commission_paid ? 'Payée' : 'En attente'}"`
    ]);

    // Créer le contenu CSV
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `commissions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCommissions = commissions.reduce((sum, c) => sum + (c.admin_commission || 0), 0);
  const totalPaid = commissions
    .filter(c => c.is_commission_paid)
    .reduce((sum, c) => sum + (c.admin_commission || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Commissions</h1>
        <div className="flex space-x-4">
          <button
            onClick={exportToCSV}
            disabled={commissions.length === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Exporter en CSV
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="all">Tous</option>
              <option value="paid">Payées</option>
              <option value="unpaid">En attente</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de service</label>
            <select
              value={filters.serviceType}
              onChange={(e) => setFilters({...filters, serviceType: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="all">Tous</option>
              <option value="hotel">Hôtels</option>
              <option value="car">Voitures</option>
              <option value="tourism">Activités</option>
            </select>
          </div>
        </div>
        {(filters.dateFrom || filters.dateTo || filters.status !== 'all' || filters.serviceType !== 'all') && (
          <div className="mt-3">
            <button
              onClick={() => setFilters({
                dateFrom: '',
                dateTo: '',
                status: 'all',
                serviceType: 'all'
              })}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm font-medium">Total des commissions</div>
          <div className="text-2xl font-bold mt-1">
            {totalCommissions.toFixed(2)} MAD
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {commissions.length} transactions
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm font-medium">Commissions payées</div>
          <div className="text-2xl font-bold mt-1 text-green-600">
            {totalPaid.toFixed(2)} MAD
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {commissions.filter(c => c.is_commission_paid).length} transactions
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm font-medium">Commissions en attente</div>
          <div className="text-2xl font-bold mt-1 text-amber-600">
            {(totalCommissions - totalPaid).toFixed(2)} MAD
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {commissions.filter(c => !c.is_commission_paid).length} transactions
          </div>
        </div>
      </div>

      {/* Tableau des commissions */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partenaire
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission (10%)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pour le partenaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  </td>
                </tr>
              ) : commissions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    Aucune commission trouvée
                  </td>
                </tr>
              ) : (
                commissions.map((commission) => (
                  <tr key={commission.payment_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {commission.service_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {commission.service_type === 'hotel' && 'Hôtel'}
                        {commission.service_type === 'car' && 'Voiture'}
                        {commission.service_type === 'tourism' && 'Activité'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {commission.partner_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {Number(commission.total_amount).toFixed(2)} MAD
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-amber-600">
                        {Number(commission.admin_commission).toFixed(2)} MAD
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-green-600">
                        {Number(commission.partner_amount).toFixed(2)} MAD
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {format(new Date(commission.paid_at), 'PP', { locale: fr })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          commission.is_commission_paid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {commission.is_commission_paid ? 'Payée' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() =>
                          toggleCommissionStatus(
                            commission.payment_id,
                            commission.is_commission_paid
                          )
                        }
                        className={`${
                          commission.is_commission_paid
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {commission.is_commission_paid
                          ? 'Marquer non payée'
                          : 'Marquer payée'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommissionsPage;
