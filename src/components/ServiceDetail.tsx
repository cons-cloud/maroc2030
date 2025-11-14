import React from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import ServiceCard from './ServiceCard';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  features?: string[];
  onBook?: () => void;
  bookingLabel?: string;
}

interface ServiceDetailProps {
  title: string;
  description: string;
  items: ServiceItem[];
  image: string;
  features?: string[];
  className?: string;
  bookingAction?: ReactNode;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({
  title,
  description,
  items,
  image,
  features = [],
  className = '',
  bookingAction
}) => {
  return (
    <div className={`container mx-auto px-4 py-12 ${className}`}>
      <div className="mb-8 mt-12">
        <Link 
          to="/services" 
          className="inline-flex items-center text-primary hover:text-primary-dark mb-8 transition-colors mt-8"
        >
          <FaArrowLeft className="mr-2 text-2xl" /> Retour aux services
        </Link>
        
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="md:w-1/2">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-xl text-gray-600 mb-6">{description}</p>
            
            {features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Nos avantages</h3>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {bookingAction && (
              <div className="mt-8">
                {bookingAction}
              </div>
            )}
          </div>
          
          <div className="md:w-1/2">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-auto rounded-lg shadow-xl object-cover"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, index) => (
          <div key={index} className="relative group">
            <ServiceCard 
              id={item.id}
              title={item.title}
              description={item.description}
              image={item.image}
              price={item.price}
              className="h-full"
            />
            {item.onBook && (
              <button
                onClick={item.onBook}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-primary text-emerald-500 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-primary-dark"
              >
                {item.bookingLabel || 'Réserver'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceDetail;
