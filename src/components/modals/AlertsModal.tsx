import React from 'react';
import { X, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface AlertsModalProps {
  onClose: () => void;
}

const AlertsModal: React.FC<AlertsModalProps> = ({ onClose }) => {
  // Pas de données de test - les alertes réelles viendront de la base de données
  const alerts: any[] = [];

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 mr-3" />
            <h2 className="text-2xl font-bold">Alertes et notifications</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune alerte pour le moment</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <div
                  key={alert.id}
                  className={`p-4 bg-${alert.color}-50 border-l-4 border-${alert.color}-500 rounded-lg hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 p-2 bg-${alert.color}-100 rounded-full`}>
                      <Icon className={`h-5 w-5 text-${alert.color}-600`} />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className={`font-semibold text-${alert.color}-900`}>{alert.title}</h3>
                      <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertsModal;
