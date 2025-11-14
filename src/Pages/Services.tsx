import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCar, FaHome, FaUmbrellaBeach, FaHotel, FaRoute } from 'react-icons/fa';
import ServiceCard from "../components/ServiceCard";
import CallModal from "../components/CallModal";

const serviceCategories = [
  {
    id: 'voitures',
    title: 'Location de Voitures',
    icon: <FaCar className="text-4xl mb-4 text-emerald-500" />,
    gradient: 'from-emerald-500 to-cyan-400',
    hover: 'hover:from-emerald-600 hover:to-cyan-500',
    description: 'Explorez le Maroc à votre rythme avec nos véhicules de location haut de gamme.',
    images: ['/VOITURE/1.jpg', '/VOITURE/2.jpg', '/VOITURE/3.jpg'],
    price: 200,
    duration: 'par jour'
  },
  {
    id: 'appartements',
    title: 'Appartements',
    icon: <FaHome className="text-4xl mb-4 text-green-500" />,
    gradient: 'from-green-500 to-emerald-400',
    hover: 'hover:from-green-600 hover:to-emerald-500',
    description: 'Des appartements confortables et bien équipés pour un séjour agréable.',
    images: ['/assets/APT/TANGER/apt2/5.jpg','/assets/APT/TANGER/apt1/2.jpg','/assets/APT/TANGER/apt1/3.jpg'],
    price: 150,
    duration: 'par nuit'
  },
  {
    id: 'villas',
    title: 'Villas de Luxe',
    icon: <FaUmbrellaBeach className="text-4xl mb-4 text-amber-500" />,
    gradient: 'from-amber-500 to-yellow-400',
    hover: 'hover:from-amber-600 hover:to-yellow-500',
    description: 'Expérimentez le luxe ultime dans nos villas exclusives en bord de mer.',
    images: ['/assets/APT/TANGER/apt2/6.jpg','/assets/APT/TANGER/apt2/7.jpg','/assets/APT/AGADIR/APPART1/6.jpg'],
    price: 2500,
    duration: 'par nuit'
  },
  {
    id: 'hotels',
    title: 'Hôtels & Riads',
    icon: <FaHotel className="text-4xl mb-4 text-rose-500" />,
    gradient: 'from-rose-500 to-pink-400',
    hover: 'hover:from-rose-600 hover:to-pink-500',
    description: 'Séjournez dans des hôtels et riads authentiques chargés d\'histoire.',
    images: ['/assets/APT/MARRAKECH/apt1/2.jpg','/assets/APT/MARRAKECH/apt1/3.jpg','/assets/APT/MARRAKECH/apt2/7.jpg'],
    price: 100,
    duration: 'par nuit'
  },
  {
    id: 'tourisme',
    title: 'Tours & Excursions',
    icon: <FaRoute className="text-4xl mb-4 text-purple-500" />,
    gradient: 'from-purple-500 to-indigo-400',
    hover: 'hover:from-purple-600 hover:to-indigo-500',
    description: 'Découvrez les trésors cachés du Maroc avec nos guides experts.',
    images: ['/voyages/vyg/es/1.jpg','/voyages/vyg/casa/1.webp','/voyages/vyg/Villebeu/4.webp'],
    price: 50,
    duration: 'par personne'
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 10
    }
  }
};

const Services = () => {
  const [showCallModal, setShowCallModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      {/* Hero Section */}
      <div className="relative h-screen min-h-[600px] overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/assets/hero/marrakech.jpg')`,
              backgroundAttachment: 'fixed'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-white max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Découvrez le Maroc sous son plus beau jour
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto my-8 rounded-full"></div>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                Des expériences uniques, des paysages à couper le souffle et un accueil chaleureux vous attendent
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-col sm:flex-row justify-center gap-4 mt-10"
              >
                <Link 
                  to="/contact"
                  className="inline-flex items-center bg-green-500 text-white px-6 py-3 rounded-full font-medium hover:bg-green-600 transition-all duration-300 transform hover:scale-105"                >
                  Réserver Maintenant
                </Link>
                <Link 
                  to="/services/tourisme"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                  Explorer nos Services
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'loop'
            }}
            className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center p-1"
          >
            <motion.div 
              className="w-1 h-2 bg-white rounded-full"
              animate={{
                y: [0, 10],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'loop'
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Services Grid */}
      <div id="categories" className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Explorez Nos Services</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sélectionnez une catégorie pour découvrir nos offres exceptionnelles
            </p>
          </motion.div>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {serviceCategories.map((service) => (
            <motion.div 
              key={service.id}
              variants={item}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <ServiceCard
                id={service.id}
                title={service.title}
                description={service.description}
                images={service.images}
                price={service.price}
                duration={service.duration}
                link={`/services/${service.id}`}
                className="h-full"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <Outlet />
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-black/30 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Prêt à vivre l'aventure à Meknès ?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Notre équipe est à votre disposition pour créer le voyage de vos rêves à Meknès
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/contact"
              className="px-8 py-3 bg-black/30 text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contactez-nous
            </Link>
            <button 
              onClick={() => setShowCallModal(true)}
              className="px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              Appelez-nous
            </button>
          </div>
        </div>
      </section>

      {/* Modal d'appel */}
      <CallModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} />
    </div>
  );
};

export default Services;
