import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import AuthGuard from './AuthGuard';


interface ApartmentCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  images: string[];
  onBook: (apartmentId: string) => void;
}

const ApartmentCard = ({
  id,
  title,
  description,
  price,
  address,
  city,
  images = [],
  onBook
}: ApartmentCardProps) => {

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleBookNow = (e: React.MouseEvent) => {
    e.preventDefault();
    onBook(id); // Appelle la fonction parent (Appartements.tsx)
  };
  
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Carousel */}
      <div className="relative h-64 overflow-hidden">
        {images.length > 0 ? (
          <div 
            className="w-full h-full bg-cover bg-center transition-transform duration-500"
            style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Aucune image disponible</span>
          </div>
        )}
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Image précédente"
            >
              <FiChevronLeft size={20} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Image suivante"
            >
              <FiChevronRight size={20} />
            </button>
          </>
        )}
        
        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
            {images.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full ${currentImageIndex === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
        
        {/* Price Tag */}
        <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full font-semibold text-sm">
          {price} DH / nuit
        </div>
      </div>
      
      {/* Apartment Info */}
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-gray-500 text-sm flex items-center mt-1">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {address}, {city}
            </p>
          </div>
        </div>
        
        <p className="text-gray-600 mt-3 line-clamp-2">{description}</p>
        
        <div className="mt-4 flex justify-between items-center">
          <AuthGuard>
            <button 
              onClick={handleBookNow}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-emerald-600 text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Réserver
            </button>
          </AuthGuard>
        </div>
      </div>
    </motion.div>
  );
};

export default ApartmentCard;
