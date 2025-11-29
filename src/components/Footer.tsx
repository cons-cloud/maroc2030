import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, FaInstagram, FaTripadvisor, FaYoutube, FaArrowUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './ui/use-toast';
import LegalModal from './LegalModal';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 bg-primary text-white p-3 rounded-full shadow-lg transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-label="Retour en haut"
    >
      <FaArrowUp className="w-5 h-5" />
    </button>
  );
};

const Footer = () => {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'mentions' | 'confidentialite' | 'cgv' | null>(null);
  
  // Fonction pour gérer le clic sur les liens
  const handleLinkClick = () => {
    window.scrollTo(0, 0);
  };

  // Fonction pour gérer l'inscription à la newsletter
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Erreur', 'Veuillez entrer votre email');
      return;
    }

    try {
      setIsSubscribing(true);
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email: email,
          subscribed_at: new Date().toISOString(),
          source: 'footer'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Erreur', 'Cet email est déjà inscrit');
        } else {
          throw error;
        }
      } else {
        toast.success('Succès', 'Merci de votre inscription !');
        setEmail('');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      toast.error('Erreur', 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsSubscribing(false);
    }
  };
  
  return (
    <>
      <footer className="bg-gray-900 text-white pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* About Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-primary">2030<span className="text-green-500 font-bold text-2xl">Maroc</span></h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Découvrez la beauté intemporelle de Meknès avec nous. Nous proposons des expériences uniques et des séjours mémorables dans la ville impériale.
              </p>
              <div className="flex space-x-4 pt-2">
                <a href="https://www.facebook.com/share/1D4DDndpRA/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors" aria-label="Facebook">
                  <FaFacebook size={20} />
                </a>
                <a href="https://www.instagram.com/_2030maroc?igsh=MWdhZzJ5aXFhaTN3eQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors" aria-label="Instagram">
                  <FaInstagram size={20} />
                </a>
                <a href="https://tripadvisor.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors" aria-label="TripAdvisor">
                  <FaTripadvisor size={20} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors" aria-label="YouTube">
                  <FaYoutube size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Liens Rapides</h4>
              <ul className="space-y-2">
                <li><Link to="/" onClick={handleLinkClick} className="text-gray-300 hover:text-primary transition-colors">Accueil</Link></li>
                <li><Link to="/services" onClick={handleLinkClick} className="text-gray-300 hover:text-primary transition-colors">Nos Services</Link></li>
                <li><Link to="/evenements" onClick={handleLinkClick} className="text-gray-300 hover:text-primary transition-colors">Événements</Link></li>
                <li><Link to="/services/tourisme" onClick={handleLinkClick} className="text-gray-300 hover:text-primary transition-colors">Circuits Touristiques</Link></li>
                <li><Link to="/services/appartements" onClick={handleLinkClick} className="text-gray-300 hover:text-primary transition-colors">Hébergements</Link></li>
                <li><Link to="/annonces" onClick={handleLinkClick} className="text-gray-300 hover:text-primary transition-colors">Annonces</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Contactez-nous</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FaMapMarkerAlt className="mt-1 mr-3 text-primary" />
                  <span className="text-gray-300">Avenue Mohammed VI, Meknès 50000, Maroc</span>
                </li>
                <li className="flex items-center">
                  <FaPhone className="mr-3 text-primary" />
                  <a href="tel:+212669742780" className="text-gray-300 hover:text-primary transition-colors">+212 669-742780</a>
                </li>
                <li className="flex items-center">
                  <FaEnvelope className="mr-3 text-primary" />
                  <a href="mailto:Imam@orange.fr" className="text-gray-300 hover:text-primary transition-colors">Imam@orange.fr</a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Newsletter</h4>
              <p className="text-gray-300 text-sm mb-4">
                Abonnez-vous à notre newsletter pour recevoir nos offres spéciales et actualités.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <input 
                  type="email" 
                  placeholder="Votre adresse email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary text-white"
                  required
                />
                <button 
                  type="submit"
                  disabled={isSubscribing}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubscribing ? 'Inscription...' : 'S\'abonner'}
                </button>
              </form>
            </div>
          </div>

          {/* Copyright and Legal */}
          <div className="border-t border-gray-800 pt-6 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-gray-400 text-sm mb-2">
                  © {currentYear} 2030Maroc. Tous droits réservés.
                </p>
                <p className="text-gray-500 text-sm">
                  Réalisé par{' '}
                  <a 
                    href="https://marocgestionentreprendre.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors font-medium text-sm"
                  >
                    Maroc Gestion Entreprendre
                  </a>
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setLegalModalType('mentions')}
                  className="text-gray-400 hover:text-primary text-sm transition-colors"
                >
                  Mentions Légales
                </button>
                <button 
                  onClick={() => setLegalModalType('confidentialite')}
                  className="text-gray-400 hover:text-primary text-sm transition-colors"
                >
                  Politique de Confidentialité
                </button>
                <button 
                  onClick={() => setLegalModalType('cgv')}
                  className="text-gray-400 hover:text-primary text-sm transition-colors"
                >
                  CGV
                </button>
                <Link to="/contact" onClick={handleLinkClick} className="text-gray-400 hover:text-primary text-sm transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <ScrollToTopButton />
      
      {/* Modal légal */}
      {legalModalType && (
        <LegalModal 
          isOpen={true}
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      )}
    </>
  );
};

export default Footer;