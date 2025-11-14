import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface HotelCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  images: string[];
  stars: number;
  amenities?: string[];
  onBook: (hotelId: string) => void;
}

const HotelCard = ({
  id,
  title,
  description,
  price,
  address,
  city,
  images = [],
  stars,
  amenities = [],
  onBook
}: HotelCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Render star rating
  const renderStars = () => {
    return Array(5).fill(0).map((_, i) => (
      <FiStar 
        key={i} 
        className={`${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'} w-5 h-5`} 
      />
    ));
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => onBook(id)}
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
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <div className="flex items-center">
            {renderStars()}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mt-1">{address}, {city}</p>
        
        <p className="text-gray-700 mt-3 line-clamp-2">{description}</p>
        
        {amenities && amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                {amenity}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="text-xs text-gray-500">+{amenities.length - 3} more</span>
            )}
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-emerald-600">{price} DH</span>
            <span className="text-gray-500 text-sm"> / nuit</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          <span 
            className="mt-2 inline-flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-800"
            aria-hidden="true"
          >
            Découvrir plus
            <svg 
              className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default HotelCard;
