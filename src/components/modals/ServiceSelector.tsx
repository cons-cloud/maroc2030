import React from 'react';
import { X, Hotel, Home, Building2, Car, MapPin, Map, UserCheck, Activity, Calendar, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ServiceSelectorProps {
  onClose: () => void;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const services = [
    { name: 'Hôtel', icon: Hotel, path: '/admin/hotels', color: 'blue' },
    { name: 'Appartement', icon: Home, path: '/admin/appartements', color: 'green' },
    { name: 'Villa', icon: Building2, path: '/admin/villas', color: 'purple' },
    { name: 'Location voiture', icon: Car, path: '/admin/locations-voitures', color: 'orange' },
    { name: 'Immobilier', icon: Building2, path: '/admin/immobilier', color: 'red' },
    { name: 'Circuit', icon: Map, path: '/admin/circuits-touristiques', color: 'indigo' },
    { name: 'Guide', icon: UserCheck, path: '/admin/guides-touristiques', color: 'teal' },
    { name: 'Activité', icon: Activity, path: '/admin/activites-touristiques', color: 'pink' },
    { name: 'Événement', icon: Calendar, path: '/admin/evenements', color: 'yellow' },
    { name: 'Annonce', icon: Megaphone, path: '/admin/annonces', color: 'cyan' },
  ];

  const handleServiceClick = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center">
            <MapPin className="h-6 w-6 mr-3" />
            <h2 className="text-2xl font-bold">Choisir un type de service</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">Sélectionnez le type de service que vous souhaitez ajouter</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <button
                  key={service.name}
                  onClick={() => handleServiceClick(service.path)}
                  className={`group relative p-6 bg-${service.color}-50 hover:bg-${service.color}-100 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                >
                  <div className={`flex flex-col items-center text-center space-y-3`}>
                    <div className={`p-3 bg-${service.color}-100 group-hover:bg-${service.color}-200 rounded-full transition`}>
                      <Icon className={`h-8 w-8 text-${service.color}-600`} />
                    </div>
                    <span className={`font-semibold text-${service.color}-900`}>{service.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelector;
