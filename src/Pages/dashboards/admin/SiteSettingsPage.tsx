import React from 'react';
import { SiteSettings } from './SiteSettings';

export const SiteSettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres du site</h1>
      <SiteSettings />
    </div>
  );
};

export default SiteSettingsPage;
