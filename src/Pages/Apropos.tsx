import { motion } from 'framer-motion';
import { FiMapPin, FiAward, FiHeart, FiUsers } from 'react-icons/fi';

const Apropos = () => {
  const stats = [
    { id: 1, value: '10,000+', label: 'Voyageurs Satisfaits', icon: <FiUsers className="h-8 w-8 text-primary" /> },
    { id: 2, value: '50+', label: 'Destinations', icon: <FiMapPin className="h-8 w-8 text-primary" /> },
    { id: 3, value: '15', label: 'Années d\'Expérience', icon: <FiAward className="h-8 w-8 text-primary" /> },
    { id: 4, value: '100%', label: 'Engagement', icon: <FiHeart className="h-8 w-8 text-primary" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: 'url(public/about/mk.webp)' }}>
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">À Propos de Nous</h1>
            <p className="text-xl md:text-2xl">Découvrez la magie du Maroc à travers nos yeux</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Notre Histoire</h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 leading-relaxed">
              Fondée en 2010, Maroc 2030 est née d'une passion commune pour le partage des trésors cachés et des expériences authentiques que le Maroc a à offrir. 
              Notre mission est de créer des voyages qui vont au-delà des sentiers battus, en connectant les voyageurs à la richesse culturelle, aux paysages à couper le souffle et à l'hospitalité légendaire du peuple marocain.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat) => (
              <motion.div 
                key={stat.id}
                className="bg-white p-6 rounded-xl shadow-lg text-center"
                whileHover={{ y: -5 }}
              >
                <div className="flex justify-center mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div 
              className="bg-primary/5 p-8 rounded-2xl"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Notre Mission</h3>
              <p className="text-gray-600 mb-6">
                Offrir des expériences de voyage authentiques et mémorables qui célèbrent la diversité culturelle et la beauté naturelle du Maroc, tout en soutenant les communautés locales et en préservant notre héritage culturel.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-primary mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Voyages personnalisés et authentiques</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-primary mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Engagement envers le tourisme durable</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-primary mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Service client exceptionnel 24/7</span>
                </li>
              </ul>
            </motion.div>

            <motion.div 
              className="relative h-80 rounded-2xl overflow-hidden"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img 
                src="public/about/1.jpeg" 
                alt="Paysage marocain" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-2xl p-8 md:p-12 text-white text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Prêt à vivre l'aventure marocaine ?</h3>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Contactez-nous dès aujourd'hui pour créer l'itinéraire de voyage parfait pour votre prochaine aventure au Maroc.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-white text-primary px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Contactez-nous
              </button>
              <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
                Découvrez nos circuits
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Apropos;