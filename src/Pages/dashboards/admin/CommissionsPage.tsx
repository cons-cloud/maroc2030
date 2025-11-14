import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Download } from 'lucide-react';

type Commission = {
  payment_id: string;
  booking_id: string;
  service_title: string;
  partner_id: string;
  partner_name: string;
  total_amount: number;
  admin_commission: number;
  partner_amount: number;
  payment_status: string;
  paid_at: string;
  is_commission_paid: boolean;
};

export const CommissionsPage: React.FC = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCommissions, setTotalCommissions] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadCommissions();
  }, []);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('commission_reports')
        .select('*')
        .order('paid_at', { ascending: false });

      if (error) throw error;

      setCommissions(data || []);
      
      // Calculer les totaux
      const total = data?.reduce((sum: number, item: Commission) => sum + (item.admin_commission || 0), 0) || 0;
      const paid = data
        ?.filter((item: Commission) => item.is_commission_paid)
        .reduce((sum: number, item: Commission) => sum + (item.admin_commission || 0), 0) || 0;
      
      setTotalCommissions(Number(total.toFixed(2)));
      setTotalPaid(Number(paid.toFixed(2)));
      setTotalPending(Number((total - paid).toFixed(2)));
    } catch (error) {
      console.error('Erreur lors du chargement des commissions:', error);
      toast.error('Erreur lors du chargement des commissions');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ is_commission_paid: true })
        .eq('id', paymentId);

      if (error) throw error;

      toast.success('Commission marquée comme payée');
      loadCommissions();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de la commission:', error);
      toast.error('Erreur lors de la mise à jour du statut de la commission');
    }
  };

  const exportToCSV = () => {
    try {
      setIsExporting(true);
      
      // Créer l'en-tête du CSV
      const headers = [
        'ID Paiement',
        'ID Réservation',
        'Service',
        'Partenaire',
        'Montant Total (MAD)',
        'Commission (10%)',
        'Montant Partenaire',
        'Statut Paiement',
        'Date Paiement',
        'Statut Commission'
      ];

      // Créer les lignes de données
      const csvRows = commissions.map(commission => [
        `"${commission.payment_id}"`,
        `"${commission.booking_id}"`,
        `"${commission.service_title || 'N/A'}"`,
        `"${commission.partner_name || 'N/A'}"`,
        commission.total_amount?.toFixed(2) || '0.00',
        commission.admin_commission?.toFixed(2) || '0.00',
        commission.partner_amount?.toFixed(2) || '0.00',
        `"${commission.payment_status || 'N/A'}"`,
        `"${commission.paid_at ? format(parseISO(commission.paid_at), 'PPpp', { locale: fr }) : 'N/A'}"`,
        `"${commission.is_commission_paid ? 'Payée' : 'En attente'}"`
      ]);

      // Créer le contenu CSV
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Créer un objet Blob avec le contenu CSV
      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      
      // Créer un lien de téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `commissions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Export CSV réussi');
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      toast.error('Erreur lors de l\'export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des commissions</h1>
          <button
            onClick={exportToCSV}
            disabled={isExporting || commissions.length === 0}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              isExporting || commissions.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Export en cours...
              </>
            ) : (
              <>
                <Download className="-ml-1 mr-2 h-4 w-4" />
                Exporter en CSV
              </>
            )}
          </button>
        </div>
        
        {/* Cartes de résumé */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total des commissions</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">
              {totalCommissions.toFixed(2)} MAD
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-700">Commissions payées</h3>
            <p className="mt-1 text-3xl font-semibold text-green-900">
              {totalPaid.toFixed(2)} MAD
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-700">Commissions en attente</h3>
            <p className="mt-1 text-3xl font-semibold text-yellow-900">
              {totalPending.toFixed(2)} MAD
            </p>
          </div>
        </div>

        {/* Tableau des commissions */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partenaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission (10%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Versé au partenaire
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
            <tbody className="bg-white divide-y divide-gray-200">
              {commissions.map((commission) => (
                <tr key={commission.payment_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {commission.service_title || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {commission.partner_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {commission.total_amount?.toFixed(2)} MAD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">
                    {commission.admin_commission?.toFixed(2)} MAD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {commission.partner_amount?.toFixed(2)} MAD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      commission.is_commission_paid 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {commission.is_commission_paid ? 'Payée' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {commission.paid_at 
                      ? format(new Date(commission.paid_at), 'PPpp', { locale: fr }) 
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!commission.is_commission_paid && (
                      <button
                        onClick={() => markAsPaid(commission.payment_id)}
                        className="text-emerald-600 hover:text-emerald-900 mr-4"
                      >
                        Marquer comme payée
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {commissions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune commission trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommissionsPage;
