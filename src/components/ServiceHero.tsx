import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface ServiceHeroProps {
  title: string;
  subtitle: string;
  images: string[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

const ServiceHero: React.FC<ServiceHeroProps> = ({ 
  title, 
  subtitle, 
  images,
  searchPlaceholder = "Rechercher...",
  onSearch
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Préchargement des images
  useEffect(() => {
    images.forEach((image) => {
      const img = new Image();
      img.src = image;
    });
  }, [images]);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;
    
    const timer = setTimeout(() => {
      nextSlide();
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentSlide, isAutoPlaying, images.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <section className="relative h-[70vh] overflow-hidden">
      {/* Images en arrière-plan */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${image})`,
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
            }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: index === currentSlide ? 1 : 0,
              scale: index === currentSlide ? 1 : 1.05,
            }}
            transition={{ 
              duration: 1.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        ))}
        {/* Overlay avec dégradé */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60"></div>
        
        {/* Effet de particules flottantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -80, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation buttons (seulement si plusieurs images) */}
      {images.length > 1 && (
        <>
          <button 
            onClick={() => {
              setIsAutoPlaying(false);
              prevSlide();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-green-500/90 text-gray-800 hover:bg-green-500 transition-all duration-300 shadow-lg hover:shadow-xl"
            aria-label="Précédent"
          >
            <FiChevronLeft size={24} />
          </button>
          
          <button 
            onClick={() => {
              setIsAutoPlaying(false);
              nextSlide();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-green-500/90 text-gray-800 hover:bg-green-500 transition-all duration-300 shadow-lg hover:shadow-xl"
            aria-label="Suivant"
          >
            <FiChevronRight size={24} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  goToSlide(index);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 shadow-md ${
                  currentSlide === index 
                    ? 'bg-green-500 w-8 shadow-lg' 
                    : 'bg-green-500/60 hover:bg-green-500/90'
                }`}
                aria-label={`Aller au slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              {title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 drop-shadow-md max-w-3xl mx-auto">
              {subtitle}
            </p>
          </motion.div>
          
          {onSearch && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-grow px-6 py-4 rounded-full text-gray-800 bg-white/95 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white border-2 border-white/50 shadow-lg"
                />
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  Rechercher
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServiceHero;
