import React from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { FileText } from 'lucide-react';

const AnnouncementsManagement: React.FC = () => {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Annonces</h1>
          <p className="text-gray-600 mt-1">Gérez les annonces publicitaires du site</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Module en développement</h3>
          <p className="text-gray-600">
            La gestion des annonces sera bientôt disponible
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnnouncementsManagement;
