import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Hero from "../components/Hero";
import CallModal from "../components/CallModal";
import { Outlet } from 'react-router-dom';

interface Service {
  title: string;
  description: string;
  image: string;
  link: string;
}

interface HomeProps {
  onOpenBooking: (apartment: any) => void;
}

const Home: React.FC<HomeProps> = ({ onOpenBooking }) => {
  const [activeService, setActiveService] = useState<number>(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  const services: Service[] = [
    {
      title: "Location de voitures",
      description: "Trouvez la voiture idéale pour vos déplacements à travers le Maroc.",
      image: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1631&q=80",
      link: "/services/voitures"
    },
    {
      title: "Appartements",
      description: "Découvrez nos appartements et locations de vacances sélectionnés avec soin.",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      link: "/services/appartements"
    },
    {
      title: "Villas",
      description: "Profitez de nos villas de luxe pour des vacances inoubliables au Maroc.",
      image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1465&q=80",
      link: "/services/villas"
    },
    {
      title: "Hôtels",
      description: "Découvrez nos hôtels sélectionnés pour votre confort et votre détente.",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      link: "/services/hotels"
    },
    {
      title: "Tourisme & Excursions",
      description: "Découvrez le Maroc avec nos visites guidées et activités touristiques.",
      image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      link: "/services/tourisme"
    }
  ];

  const nextService = () => {
    setActiveService((prev) => (prev === services.length - 1 ? 0 : prev + 1));
  };

  const prevService = () => {
    setActiveService((prev) => (prev === 0 ? services.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (!isHovered) {
      const timer = setTimeout(nextService, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [activeService, isHovered]);

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
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const activeServiceData = services[activeService];

  return (
    <div className="overflow-x-hidden">
      <Hero />

      {/* Section Services */}
      <section className="relative py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Services Exceptionnels</h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez une gamme complète de services pour rendre votre séjour au Maroc inoubliable
            </p>
          </motion.div>

          <div 
            className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeService}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-black/30 z-10"></div>
                {activeServiceData && (
                  <img 
                    src={activeServiceData.image} 
                    alt={activeServiceData.title}
                    className="w-full h-full object-cover transition-transform duration-10000 ease-linear"
                    style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1.1)' }}
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20 text-white">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    {activeServiceData && (
                      <>
                        <h3 className="text-3xl md:text-5xl font-bold mb-4">{activeServiceData.title}</h3>
                        <p className="text-xl mb-6 max-w-2xl">{activeServiceData.description}</p>
                        <button 
                          onClick={() => onOpenBooking({
                            id: `home-${activeServiceData.title.toLowerCase().replace(/\\s+/g, '-')}`,
                            title: activeServiceData.title,
                            description: activeServiceData.description,
                            price: 500, // Prix par défaut
                            address: 'Maroc',
                            city: 'Marrakech',
                            images: [activeServiceData.image]
                          })}
                          className="inline-flex items-center bg-green-500 text-white px-6 py-3 rounded-full font-medium hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
                        >
                          Réserver maintenant <FiArrowRight className="ml-2" />
                        </button>
                      </>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button 
              onClick={prevService}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110"
              aria-label="Service précédent"
            >
              <FiChevronLeft size={24} />
            </button>
            <button 
              onClick={nextService}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110"
              aria-label="Service suivant"
            >
              <FiChevronRight size={24} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2 ">
              {services.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveService(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-30 ${
                    index === activeService ? 'bg-green-500 w-8' : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Aller au service ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Services Grid */}
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16"
          >
            {services.map((service) => (
              <motion.div 
                key={service.title}
                variants={item}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <a 
                    href={service.link}
                    className="text-primary font-medium hover:underline inline-flex items-center"
                  >
                    En savoir plus <FiArrowRight className="ml-1" />
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Événements à Venir</h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les événements incontournables qui vous attendent au Maroc
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Festival des Roses",
                date: "15-17 Mai 2024",
                location: "Vallée des Roses",
                image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxITEhUSEhIVFRUXFRUXFRUXFRYXFRUVFRUXFhYVFRUYHSggGBolHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lICUtLS8tLS0vLS01LS0tLS0vNS0tLy01LS0tLS0tLS0tLS0vLS0tLS0tLS0tLS0tLS0vL//AABEIAKEBOAMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAFBgMEAAIHAQj/xABIEAACAQMCAwUFBAYGBwkAAAABAgMABBESIQUGMRMiQVFhMnGBkbEHUnKhFCMzQmLBNHOz0eHwFRYkQ2OCsiU1RFNUksLi8f/EABoBAAIDAQEAAAAAAAAAAAAAAAMEAQIFAAb/xAA1EQACAgEEAAMECQMFAQAAAAAAAQIRAwQSITFBUXETImHwBRQyM4GRobHBQ9HhNEJScvEj/9oADAMBAAIRAxEAPwAA471GeE3OMUIuRvUlpLg0rJWhpOmdG4bd0cilyKR+FXfSmmxlzSUlTDdlyVaD31tmjqJmorq2FRRyYmXNtg1NbnTRi6s6GXNuRVrJCdhe6aY7O/DCkRWx16US4Zfgqro2VZQykdCCMg/KutohpMd+0rRsGlT/AFrhVmTMjlNn7KGaUIfus0aEBtx3eu/SiI5jtxD+kdpqiyqhkVpCWZxGqhEBYtrIXGM5om5sFtoJSQUOmtqlt+YIHSR8yoka6naW3nhULvvmVFyBjfGcVZvZkjUyOcKMZOCepAHTruRXOBKkBJ7ah89vjwozxHi0EUhiftS4VWIS3uJQquWClmijZVzpbqfCsh7OZBJE6upyAynIyDgg+RBBBB3Bqji0WUkxdWHeo7m3yKMsiF2jBBdVVmXxCuWCk+/Q3yqCWCo6LWLZsuu1Vm4dms4vzfawSNDiSV19tYU16MddRJA29M4q3DxaF7ZrpCzRKjue6Q2EBLABsb7e71onvrmiLiyrFw8A9KsHh48qiueYYI7Nb1lk7NtOAAuvvEgZGrHh51a4rxWOB4I3VyZ5OzTSAQGyu7ZIwO8OmahuRNxK01hmoP8ARlMgizSfcc826SGI291qywAES97STkqNeSNjUwcn0RPauwjFw70opacMyRtUV9xaK3ihmkSTTM8aKAq6g0ilhrBYYxg53NMB4lDDeW9k6uZZ1dkYBSgEYYtqJYEHuHoD4VNyZRtIK8F4aBjamaNMCkTj/wBo1pYXDWslvdSSIiyMYY43UIRnJJkBAGdyRTFbc1W0li3EImMkKxySHSO/iMEumliMMMEYJHvxvTWHHt5YvknYcrK55wz7XLWd41Szv8SMqq5gTs+8wUMWEh7ozuaaOIczww3tvYsshluVkaNgF7MCNSzayWBGynoDRwYYm6Uncww5zTjJ0oBxaHIpTP2HxHI+MQ4NBHO9OvMdmKWzZZq0JJoK4MscJVj0pps3I60L4bCY01Y2o3ZyLKp8DS+V2wseEaXZBFBJ7PV4USdtyvlUtrHVYvaiXyKt5w/HhWU1cQtBjasoscvAJwEy8XeoYTVm8qmhoq6BPsO8NmwabOG3dI9q9H7C4oGSIWDHmznFTvuaXbOc0dtpc0FFmSS24qheW4oi75qnOa5nISebWwghRWZpm0lU06+yG8xGplA7vdzkbuKH8FunQSwrG0ZTLwo+nIjkyVUaGZcLJrUDOy6aa72yTtO0xltGgHPRS2ogDwyQufPSPKhc9gusSY7yhlB/hfBYHzGVU/CrRkqo6ubIuAXIW1i7Iav1akAnSWY7vqJ6MWLEk+Oc1HfcUaWF1CCJ0vbRdyHQyfpNu5Y6dOrBcZ3ByDvUTcMQFipkj1ElhHIyKxPVtIOAx8WGCfOrcdhEYhDpKoCrDSzKwZXEgbWDq1agGznJPWp4Ts7mqCfMM1x/o697aSJwbWXT2cToQdDZ1apHz4eXxqXjUv6LDJasf1DlRaOT7BEik2jE+QyYz4qCvVBqrxWEbRyRO8rpKhRxJNI/dIIIXUx05z1FHJykqGOVQykgkHzVgykeRBAIPgRXRyUUlCy3a/066/qbT/quapW7ql5etkLEIbaSU7aVmxP2jN/F2S25PppqS64bFLIZS8yOyqrGK4li1KmorkRsNxrbfrvUw4Rb9g1uE/VucyDUxaQkgsZHJLOWwASxORsdqtuTK7WhOsZpEljvZLSeMzSsLiR+x0CCfSlsCFlLjs9FuN121SnbJpvurY4Onrg49/hV29tElR45F1I6sjr5qwKsNumxrx8KBk7AAZY/DcnqarJ2Wjwcv+yp4VtZI2YLcpLJ+khyBJqDbM2TkgDb0IajXMah7K4MRDqbebSUIYH9W3skdaIcwcl8PupO0uIFMh21BmjZ8fe0kajgdTvV+w4RBBGIoI1jQdFXxPiSTux26nJ2qZNN7iYp1Rx/i9yjcCgRXUsTGoUEFiwdsjT1z/hTBzr/AEjhuf8A1Yz846Yl5IsIpu3W3jR85UkkKGG+VjJ0gj0G3hipuNcrQXYRZ0LhSSuGZfaAye6RnoKtvja/H9Su11+RdAB6EH3EGlLjCf8AbfDx/wAGf+zmpk5d5RtLRna2TSWAV++z9DkDcnBouOB2xnju5F/XRBljcsQAHDAjTnBOGbrQ7UW65LSbaE/7V49NtaudlW+gLt4KumTc+QojxeZJOYuGiJ1fRBcM+ghgqskukkjpnI+Yp3uOFxTxtDNGskbjDIwyCM5HxBAIPUEAiouV+TLGxLNa26xswwzlnd9PXSGckhdhsOuBTOGqAZHycu53nvY+NX0tiyK8fDdcmsaiYV7PX2YwQXzpIztgGmPlbhscPLEvZOX7WzuJXPTEjxNrUD+Erp9dOfGnn/Vq2/SpLwx5mkh7F2LMVaLu93RnH7o3xWnDuVbWCzexjRhbusilC7k6ZQdYDE5GcnofGmwIg/ZMvFRBZlriz/QdB/V979I098KPYxnVjx6UQ5uYDmHhJJAHZ3W5/qpKIWf2S8JikSVLdg6Mrqe2lOGUhgcFt9wKLc08j2PEGR7uJnKKVXEjpgE5PskZrjg3JMpHdIPuINC787VW5f5TtOHLItpGUEhUvl2fJUED2ice0ag4pd4pLO+RvTwchW4+cnFAClFeJT6jVAChwfA/PFSGLhFmHiwaqXfDXj3XpVzlu58KKcUjJHdqjYu+GLkCefWrkceKjs4DnB60dgsMiqMhsFzRkispiXhx04xWV1Mjcjkd4tUAN6J3g3NDHp2IBlmA0ZsXxQGB6I28tRNExGq1novbXG1KVrPRuznpaUaCph5Jq8kbNV4WzUoqDiCRKoyrRN6qSRVBIKmiqHSRRJ0qBkzVkyDSOSp0uSKryJioO0qKJCtxxQxxs4Gogd1fvuxConxYqPjUvLd0wV4XaRmjwQ8ilXdJMtqIIHRxKvuVaEBxsTvg6h6EAjP5miFvcqWDfvAFQfHBIJHzUfKu6RDVlrhlwTHYbn9iCd+v+zjc+e5HzoZ9qkYk4eyHOGmt1OOuGmUHHrvV+ziiRtSLg4IHeYhQSCVRSSIwSASFABwPKrF8kUyaJVDrlWwempTlTt5EA1KnUkyu3ihGfgd3FfWD3lx2pS5a3twOhhWJ2Esn/FbCg+Pc3J2xB9onMvZcRhKOcWISR0CuxlecgSJkDSpEOTliOrAV0Vo45GRpFDNG2uMnqrYI1D1wTUsVhABMoiXE5YzDc9qWXS2vPXbbFXWRXbRVwdUhP+0yISnh+iBboNLKyxF9Cyr2God/w23HuFC7IyR8vxukpCSSLreMsWt7aSfTIiE5OUGV9Mn310qDhUAEIEa/7P8AsOv6ru6e7v8Ad2qzYcLhijMUcarGSxKAZU6927p2wcnbpvUqSpIhxd2c5vOE2VpccPbhbKJpbiONkimaQT2jKxleRdRBCjDavj4DF1+GWl3xS8i4kQ3YrD+iwySNHGIXjzJKgBGtixOTvj4DDrwjlqztnMlvbRROwILIgDYPUA+A2Gw22qxxbl20utP6TbxzafZLqCVz1AbqB6dKImrKMm4BaQRwRpbEGFVAjIcyAr4Yck6h8aLKKr2VokSLHGioijCooCqo8gBsKsijY4+IKTPaysrKMVMrUmvSagmkqk5UiUrK95JSpxlqP3U1LXFnzSE+TW0cKYt3I3qDFWp46rgUNOjVyY00XeFSYamy2lyMUo2q70xWFczLzRphGOxHWiNrDiqsL0Tg3q0UKSbLKx7VlSRispxQTQq5M4RxHqaCymjF6wNBpjUQCyPI33ojBJQsCr1s1TJHRYXtmoxaSUAheiNrLQJIImNNvLVpXoPay0RjehFizWaa0DVIhriSNo6gkhxV01WmauIBlytDpNqLSrQ+dPAVKJKTSVNDKaR+aOOsZDFCSgjLK7BiGdwcH3BcYx6E+WF+S6kb2pHb0LsR8iaYWByVgnlSdHWpeMwx/tJY09GdQflnNbcO5hgmYpFIHYAsQAw7o6kZAyB6Vx0JVrht68EqTR+0jZAPQjoyn0IJB99S9Mq7IWZ30dwtrner0t8kaNI7BUUZZj0AFLNlxOJohOHxFp1Fj+6B7St6g7e8Ug8z81SXJKISsQPdHi38Tev0/MrwxOToLOSijp9n9onDz7Uzp+KGUfRTRi2524a3/jYB+N+z/tMV87hKzTTX1eK6YB5JPwPoyXnvhi9b2I/gLSD5oCKZLO4SRFkjZXRgGVlIKsp3BBHUV8oV0P7Jebv0eYWsz/qZThMnuxyk7e4MTg+pHrXPHt5RW7O7LW9aitqNHoGzK8Ne1oxqW+CERyPVK5k2qeVqH3LUpN2NYog+6loLfHNErqhdwKAzXwJIHOKrlaty1WNCY94EkO1GrF6CIaL8OqUIaiIetqL2woXaCjEFFguTLyFlKyvVryno9CjPnq4kqgz1PO9VZDVIoM2eg1Yhaq0dTIK5nIIRPV63ehULVdhehtF0H7WWisEtL1vJRK3loMkXQbD1YQ7UOV+lWon2qhJPqqGavddeHeuJRTlFKHOPMJth2UR/XMN2H+5Q+I/4h8PIb9cUb5q48lpHk4aRs9lH546u3kg/M7Dxxx+eZnZndizMSzMepJ6mj4cW52+geTJSpGlSKtR1InSnGAj2eaa1NM/AOXxIoklyFz3V6ah5k+VW+beHr2SOiAaDpOBjCEbZx4A/Wh+0W6gzxOhTFy+jstR0atWnw1Yxn6fKpbaOPOZGIA6hRlz+Enuj3n5GpbXhsrjMcbOM4yBnfbY+XUdabuEclppzcElj+6hwFHkTjc+6onkjEmGNi63FoT3f0KDQOgJl7T/mlV1LH8vQVUv54nIMUIiGMFQ7uCfMFySPdmupWvLdlp0G3QjzOS3/AL86vzpR58s7CALHbgrPqywV2ZVTH7+onDdMAeufChwyxk6Vl5ppWxNasFaZr0GmaE2+Tvf2T85/pUX6NO3+0RL3STvNEMAN+IdD8D4nHQq+TOH3skMiTRMUkRgyMOoI+oxkEeIJFfR/I3NkfEINYwsqYE0f3W8180OCQfeOoNV64OfPIyE1DI1bs1VpmoeSRaESGZ6HzyVPPLQu5mpaTHsUDSc5oZcpRKOIsMih1yd8GhNpj2Ph0DpVqpIKvyVRmO9UG1I1Q0W4Y9CAavWEuDUgcsXJcDdZtReBqXrGbIozbSUSDMjLEKKa8rSN6ynIy4FGj5zuDVNzV2QVVkqUXZ7GasLVWMVbWoZaJstXIWqkKmjeqnBWB6IwS0FhersElDki6Ywo+wq9A+1CEfYVZSWgUEYS11Q45xhLaFpn3xsq/fc+yo/zsAa3Etcm5v421zOcH9UhKxjw67v6k/QCiY4b5UDnLagZxC9kmkaWVtTsdz4eiqPBQNgKrV6K2xT/AFwLVZpUlvLpYNpDAHdTnBHkcb14FopDy3dMARCQD94qv5MQahyS7JUX4B615yiIAkidPw4ZR+YI+VXF5ktW27TGeoZGA9xJGKXDylc4zpT3axn+786o3HB509qJveBqHzXNB2Y30w+/Iu0dEsnjWPMekRgM2UxpwN2bu+6ly/55fJEEYA+++ST6hQRj45patpJsNChbEmNUY/exv06+/HXxora8rSnBdlQeI9pvkNvzqPZwi7kXc5z4iitdcz3kmQZ3APgmI/zQA/nQk/4n1J6mnyy5YtVHeDOf4mIHyXFW15Zs2/3RHukf+ZNd7aEekd9VyS5bOcYrMU4cW5LYd62ftB/5b4Dj8LbK35fGle6tZIyVkRkI6hgRj50WOSMugE8MofaRAKPcm8yPYXKzqCy+zKgPtxnqB4ah1HqPU0CrKs+Si4PquzvkmjWWJgyOoZWHQg/56VHcvXLPsY5hC9pZu2MntIs+Z2dB+TfOumXEopLJLbKmM44+RRnkND5zU004qrKjn90/KgykaWONFvhlzjIoZxKbLkiiVjCUUlhigd83eNLRpzbQTHFObaIJJKpu1SytVSR6MhiiRDkgUctdK0uxN3tqMA4G/jQcrp0XcPdQbinU4xRS2lpVtbjwo1az0WD4MrUxSlQyQSVlULe4rKYUxFwOJTiqUlX5UqhLTSKM9jFSCquut0kriUWA1epJUJaou1xXUQ2Fomq5FJigkd0BUovahxOTGgXGwqeG4pcN13RVm1us0HZSCt2y1zXflLWTScFgEBH8RwfyzXMabucrrMaJ5uT8FH/2pSpjCqiByPk2Apq5d5QE6CSWQop9lVA1EeeTsPHwNLvD7ftJUTzIz7vH8q6hBMAMDYAAAeQ6AVXNNpcF8UE+yPh/ALeDeNMt99zqb4HovwAqwzVUj4hnIqI3VL02+Q6rwLytWki1WSerfD4mmkWJBksce4eJPoBk/CuouqoPcu8rduplkJUDZTgZPmcnoKWeOXUSylIfZG2rrqPiR6etMn2i8XFtClhAe+4zIc5KR9Pm2CPcD6UmW0OBltzihzXKXz8oc0SW2WWfXgMHBOBvKwywCY1M/kPL3/3VR4ncRxzMsZ1oviDudtzUMV46o0auQje0o6Gh08JwSmxx4eVVal4jOFY5TbfN9Lr5f6BZbpSAytkVdgvtutLHLrhleH9/JK+vnVpXwSDtjqKnbzRVVJALni0RZhLGAFkGWAGAHHtHHqCD780smnLmRdcBPipDfyP1pOan8LuPJj6zGoZOPHkIcAuzFcRSA40up+RzX0Ddy5bboelfN8L4IPrXfeE3naW8EnjoXPvAwfzBpPXe61IvpHar5+eBhgiGxZRW11eqFPSh0vEgRgdaW+LcRYNprMgr4Qxj0zm7kFL7i4YYFBJpc1T7etWlpqMFFUjQhBRXB5PLVN3ycVJIahU4YH1FE6QRK2hz4RwVVjDMMsd/dUNxYMXAx3aLC7Xs1OR0FCzxXD7kaayFOcm2xaEsjbZLxbhixoJE8MZqtaXO1GpJ0lgYqwYYO4pM4azOwReuce6ndJNyi0/ATlb77G2C59ayoJeHdmurtAfMf56VlMbgW05fNNVGc15PLVZpK00hJs3xWynFQNLXhkqaJTLRaqkjVna1La8PmlBMcZYDqRj+Z3ruF2RTlwiuJK3ElQSxshKspUjqCCD8q8DVYqFBP3RUtvd4oaZNsVNZRM52zjzxVGklyXVt0irzBc65APuqB8TufqKGipLmTUzN5k493h+VRrRUqQNu2F+XtnZ/IYHvY/3A0wJek+NL/DlIjJx1fr7h/jRGxkBDA9aDPzDw8EXjP5VA1waqLNWrPk1G07cEkvNq6Xy7CthZPfzjvsmUU7HB9hB/Exx+VcpsV1SIOuWX60a5n43NcziKRu5HgKg2XON2Pmd6FN06QxixPL6WVTNLPK88p1O7amP0A8gBgD3UVWddCq0ZLA+0D1FDbm5KdxfLeifCIxo1t1O+9KTTre+PI2oZMafsUrrssxWsJXVls/cxuT6VYN1HBEyi2btXGAznugfP8hWmkSDVAHZlGX0gnHqaP8JeG6t2glOJTnGRhvQjPiPKhNyfYPI8cFu23z+X+DmE0EiMJF2ZTke+jlw4niFyuA3SRPEEeNWp+ByxSGKcjSQdEg9lsfQ+n1pWguSrsozjJGfA4pmLcvVfsVk8fE4+JfZdaMv3lYfMbUkmm+CXela8TS7DyY/XanMXDZma17kmVhXY/s3ve0sdHUxuV+B7w/nXHKcvs448lvK0cjaVl0qDg4D6u6T5DcjPqKHrsbnhe3tci2lmozp+J1BLUg5NLXNTlWJGxxTeIWzuaS+dtm3+7WJpZXko3MUrb9GLvCeKs5KsckHHQDbw6UyQ2DsM1zvhk+m4U/xgfM11ee67NMlfDatLU+41XiU0uRzj8UB5rN161XuGAG5otwNBOzGVjpFDeMtC7lII264z4nFL22+R/HNRe2uT2C+yoBJ2qlxq/CofEnuj41OvD3UBSO83zoNxyLBCsQME5JPpVsUIyyI7VTUcTlEOcnXjshTUcEdPL0o3HaJEcq2/jS/9mDLhidyCR8OtNl7wsTgSQNhvLwPofL30pqZ7M7i3SEoZIuEXXgvzKHaZz51lD75mQlWGGHUVlGx421wwuSuOBU4rwpohq1A/Cg+qp5rhm2LE+8k1UzW1BSS95nm8ji37qo3JrUmvCaJ8D4DPdsVhQtpGWODgD1xVpSUVbIinJ0gfbxF2Cjx+njTdZTdkNKEqMeHifXNVrfgz2xYyY19F/wAn1+lbQwPgk0jmyrJ9l8HofovTrHFzyL/BvxeBZ4GY/to8kHzHUj4gfMUv8uA9urBA+g6ip6VvccQkGsBWAO2rB6UxcoWcCyRvG5ZmGGB93l4GrbnhxO/wFM8Meo1G7D6sYLZob2UaoljkXIA2yceHr4/KqPNHFxBbzwGApJpCKxA0trONSN44UMcVU4+TFdkr3SCpGPMePxpc505tkvSiPEI+yLjZslycAFhgacAHbfrS2LT+1lGT6776LaySwwW3x/cWK9Wtc1slbJiIOWs5WEIAMElj9P5VJZOBnNQxKCiYIyQdsjUMHOSOoBzsT1wcdDXsURyRQeOQ7btM9zXmqo5FPSslGMVJUYuS+HyTXI0AHQC5ydvIfX8qGzmZrt3ABPaHujpgHG3ypm5NjMNpc3ZIBKlU33OMj8z9KA8vq2sYG+dqUnOpSfkqNLSYt23mvEL23CTKJJnbTpO6HrsB1PhVsXKpucYHhUEsZ31nJJOa15a4I17ciMZCLvI33UB8PU9B/hQlH2vF8IYc/q8d7XLH/g7svD2mgi775bOBnTnr67ZoPZG3uGJmkMLnGkjujPgckbfGmPmviqwotpBhe6A2P3ExgKPIkfl7xSRc8qXjNr1IFG6jUenrtQpxip7b6+aIwyrE8klTk+K7r8fAc4OGq6fr7hZAGKpjGWwNs9cn3eVcm4tbGK8dABpD9fDB/wADT9wLgl1GyyyKg2IC5JznxGB+VI/NXDpo7hwyt1zkgjOd9vnVsNb6+BKS5qV9PwI+J2xibPgd/nSpxPJkYnG5yMdMeHhXT73hxmsUZkKSKux+8MVzPiQ3Gfd8jTmmnu4faE9bBVa6KBq9wS7EU8UhAIV1JBGQRncYPpmqJrAabktypmbF7XZ9F3t/BGRqlyWxjG438yKUefFR8FHDbZ23xQLgXFTKsUTDOVCg+q7Y9+2av3FkUJU5x0rz6xLDk54Z6bTY4OKkndr9znbLhic+NdAtuK9raRAklwCrk+ODgH5UjcYtmimZGBBGNvQ7ijPLT9118sH5/wD5WnqYqWNSEfo91n2v4nTOSbRHQqWAJ6+YFT8bubSyXs7dFeU+0x3x6s3ifSk7gkjMzKrY+NEOFTJHNmRNYGfn8az3Lbao0JafdNz3Nr/j5mWV0dZll6np/hSrzIvaTlVGc94ny60x8a4s8pyY9C76evTfx8aW7yRgrbAFlwD/AA75JPgKLpo1PcTq4r2Ny4fka8j3pid0AznceW21E+GcemtpSjHBzjzBB6ZpO4ReGOZX64PTzFGuPcRWaYOq47oBz1JFMZdOpZXcbTX6oysOesXD6fXmhj4ldmSTWTuwrKExzZANe0t7PbwjXg1KKYqyPRPgfA2uD7YUZ95qS7AaBUWM6xjw6Y6nPrU0PAbpIhLEXC+ODj4/On8mX3eHtfhZ5+GFRn7y3KvA6By19mNu3flcuB4DbPvp6iWzsU0IEiH3RgEnzJO5+NcEi4lex9J7hc7bSMPoaLWVorL20gZm377am734jtmlrnjhcncvPv8AJcJBYYVmntul5dBfmG8We6ZlPdzgfUmqMHGEEotlXLswXOBgEjPWteGQa3UDqxx86Z7T7LAZBcNOc6g4AAAyPf7qVhCLuLt8cGxrsv1eEIRaX9gUvDAtyq3Kq0JGrodycgal8sjpvS5x2+toLhjaoVXYjTsAcb6R4DOdq6px3ga4XW+w6nx2B8a5tx97PV2cYBPi3h8CetRppy31NPya/lisXHJ78Xz5gRuYNbEtuT59T8aW7pFDsFGFDHA64GdtzTHc8OiCNKh9ncj3UsMa18G3uIhr45I1HIa4rADXua3h6imLM5LkLWOtUCkFVJz4d4ke0cfIZ6Zq41owyc0QtYtWlNPgACeh28DRyPge2C4zSGTUKL5NvHpMe3v/ANEcsQd68nbpTBx/lSWJDMGDr4jxA8x50tlyR0o+PJHIrizOyQcG0xnvVVeHwJjvMxb55P8AMVHy8CGBGxqbmGPTHbx+Uf8AICpeX4c/KkMkv/m35t/ubukx018ET3DM5OAWYnAAGST5ACuicEtRw7h2vTiaQKWyN+0f2VPouenofOlrlqKSKdXRO0YhtI+przi3Md1cMEmjRFjZshSfaGRuD8arDMoxaj34AtRhebNFf7V2RXVu6oZnV3zks3Uknck+JpZPFZ7hxHECfugkk4Hx2pih54j7NoD6jURtiqHDJ7a0je6LZkJOge/ooHSqYYShe+PPgdk1M5cxaSXl88Dty1wKUdjPPcM8sY2RiCq5BBAHXO/X0pJ+0fiUz3TKzbLgKF2AGM/zoVb84Xc025yGZSVG2FBGfyorzvaFp9XQFVJ/z8KLUseRKXiCwP2rcrvil8OSHhvGZjb9kWyqnIB648s+VVvtNtLZEtDblWzE5kIxksWDZbyOWbb09K24NbEsUAO4yKD81ewg8QW+RxirYZJZ68w+swp6bd4r9b45FY15XpNa5rVPNsfvss4hbxySGddTIA0XoT3X9OhX866Dwa2FxcCZxlNRY49kEeyM+Q2+Vcd5KijkvYIpf2ckio+DjOo90Z/Fprt3NvH4raM2luAH06cLsIxj64rL1eD397f4efw/uaukySlH2cE9z4vyRyr7VZY24hKYyCoVFyOmVG+KE8tXapPGX3QsFceh2rfmmLS49RQWJ8Gm4JTxV8AU7wZqXgdZuLGJJwID3mIBA6b9M+VS8w8JaJhuCSM7eFBQXNsrwjcgEtnfPp61ejfXbB8ksDhiTk56bk1jvzfnRuwtSW1lTifEpHjWNwoCnbA3O2BmgnFwUjd3IGcBR44GwHvNEfHBpU5nudUzLnZTj4+NOaWNy4FvpF+zxpA61OXHvoo8Z14zQu3G9XIJTnfwNaEjHx1VM34hIyHAY1lQ8WlBbbyr2pguOQeabU2ovg6Nbe3TfH/Rf+T/AOVZWVk6rwNAWuIUwD/ukfib+0asrKL/AE0U/qx9UAeGe2v4hXU4f2Q91ZWVGL7yX/V/wF+lu4i/zJ+zNcnk9s/H+dZWVbR9yF/6cfU3P7KX3D/qFCDWVlP4vH58AWs7j6fyzyto6ysojE12OcH7Nf8Alr2T2/gKysrNXbNifQTu/wCjClQVlZXabp+p0/AI8xe2n4B9TVjg/Q+6srKrL7pDeLt+g3co/tB+BvqKDcb/AG0/42+tZWVV/YXq/wCAGH/US9F+4hirfEP2af58KysrQfaM1fYZnAvbPupt497Y/Av1rKylNT94hzRfZLPA/wBuPw/3Uoc0dfiaysoem+9QbUfdz9F+4vV4aysrWMJl7gX9Jg/rov7Rabr7+kSf1jfWsrKR1Xa9DW+i+5ALmf2x7qCVlZR8H3aFdX99IdOEf0dfj/Ordl+wf8VeVlZk/tS9TXx9R/AHt1HvpY4p+1f8R+tZWU7puxX6T6RFF1FTJ4++srKaZmxIbjrWVlZVl0Cl2f/Z"
              },
              {
                title: "Marathon des Sables",
                date: "12-22 Avril 2024",
                location: "Désert du Sahara",
                image: "data:image/jpeg;base64,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"
              },
              {
                title: "Festival des Arts",
                date: "22-30 Juin 2024",
                location: "Meknès",
                image: "data:image/jpeg;base64,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"
              }
            ].map((event, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ y: -5 }}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-500">{event.date}</span>
                    <span className="text-sm font-medium text-primary">{event.location}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{event.title}</h3>
                  <a 
                    href="/evenements"
                    className="inline-flex items-center text-primary font-medium hover:underline"
                  >
                    Voir tous les événements <FiArrowRight className="ml-2" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pourquoi Nous Choisir ?</h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez ce qui fait de nous le partenaire idéal pour votre voyage à Meknès
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Expérience Locale",
                description: "Notre équipe locale vous fait découvrir les trésors cachés de Meknès que seuls les initiés connaissent.",
                icon: "🌍"
              },
              {
                title: "Service Personnalisé",
                description: "Nous créons des itinéraires sur mesure qui correspondent parfaitement à vos envies et à votre budget.",
                icon: "✨"
              },
              {
                title: "Engagement Qualité",
                description: "Nous sélectionnons avec soin nos partenaires pour vous garantir des prestations de qualité supérieure.",
                icon: "🏆"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 p-8 rounded-xl text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a 
              href="/apropos"
              className="inline-flex items-center px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              En savoir plus sur nous <FiArrowRight className="ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r bg-black/30 to-indigo-700 text-white">
        <div className="container mx-auto px-3 text-center">
          <h2 className="text-4xl font-bold mb-6">Prêt à vivre l'aventure au Maroc ?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Notre équipe est à votre disposition pour créer le voyage de vos rêves au Maroc
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/contact"
              className="px-8 py-3 bg-black/30 text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contactez-nous
            </a>
            <button 
              onClick={() => setShowCallModal(true)}
              className="px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              Appelez-nous
            </button>
          </div>
        </div>
      </section>
      <Outlet />
      
      {/* Modal d'appel */}
      <CallModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} />
    </div>
  );
};

export default Home;
