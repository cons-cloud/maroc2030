import { X, FileText, Shield } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'mentions' | 'confidentialite' | 'cgv';
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getContent = () => {
    switch (type) {
      case 'mentions':
        return {
          icon: <FileText className="w-6 h-6" />,
          title: 'Mentions Légales',
          content: (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Éditeur du site</h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Maroc 2030</strong><br />
                  Avenue Mohammed VI<br />
                  Meknès 50000, Maroc<br />
                  Téléphone : +212 6 12 34 56 78<br />
                  Email : contact@maroc2030.ma
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Directeur de publication</h3>
                <p className="text-gray-700 leading-relaxed">
                  Le directeur de la publication du site est le représentant légal de Maroc 2030.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Hébergement</h3>
                <p className="text-gray-700 leading-relaxed">
                  Le site est hébergé par :<br />
                  <strong>Vercel Inc.</strong><br />
                  340 S Lemon Ave #4133<br />
                  Walnut, CA 91789, USA
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Propriété intellectuelle</h3>
                <p className="text-gray-700 leading-relaxed">
                  L'ensemble du contenu de ce site (textes, images, vidéos, etc.) est protégé par le droit d'auteur. 
                  Toute reproduction, même partielle, est interdite sans autorisation préalable de Maroc 2030.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Données personnelles</h3>
                <p className="text-gray-700 leading-relaxed">
                  Conformément à la loi marocaine relative à la protection des données personnelles, 
                  vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant. 
                  Pour exercer ce droit, contactez-nous à : contact@maroc2030.ma
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cookies</h3>
                <p className="text-gray-700 leading-relaxed">
                  Ce site utilise des cookies pour améliorer votre expérience de navigation. 
                  En continuant à naviguer sur ce site, vous acceptez l'utilisation de cookies.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Conception et développement</h3>
                <p className="text-gray-700 leading-relaxed">
                  Site réalisé par{' '}
                  <a 
                    href="https://marocgestionentreprendre.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Maroc Gestion Entreprendre
                  </a>
                </p>
              </section>
            </div>
          )
        };

      case 'confidentialite':
        return {
          icon: <Shield className="w-6 h-6" />,
          title: 'Politique de Confidentialité',
          content: (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Collecte des données</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Maroc 2030 collecte les données personnelles suivantes :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Informations de réservation</li>
                  <li>Données de navigation (cookies)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Utilisation des données</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Vos données personnelles sont utilisées pour :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Traiter vos réservations et demandes</li>
                  <li>Vous envoyer des informations sur nos services</li>
                  <li>Améliorer notre site et nos services</li>
                  <li>Respecter nos obligations légales</li>
                  <li>Vous envoyer notre newsletter (avec votre consentement)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Protection des données</h3>
                <p className="text-gray-700 leading-relaxed">
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées 
                  pour protéger vos données personnelles contre tout accès non autorisé, modification, 
                  divulgation ou destruction.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Partage des données</h3>
                <p className="text-gray-700 leading-relaxed">
                  Vos données personnelles ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
                  <li>Nos partenaires de services (hébergement, paiement)</li>
                  <li>Les autorités légales si requis par la loi</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Vos droits</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Conformément à la législation en vigueur, vous disposez des droits suivants :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Droit d'accès à vos données</li>
                  <li>Droit de rectification</li>
                  <li>Droit de suppression</li>
                  <li>Droit d'opposition au traitement</li>
                  <li>Droit à la portabilité des données</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Pour exercer ces droits, contactez-nous à : contact@maroc2030.ma
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cookies</h3>
                <p className="text-gray-700 leading-relaxed">
                  Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences 
                  de cookies dans les paramètres de votre navigateur.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Conservation des données</h3>
                <p className="text-gray-700 leading-relaxed">
                  Vos données personnelles sont conservées pendant la durée nécessaire aux finalités 
                  pour lesquelles elles ont été collectées, conformément à la législation en vigueur.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact</h3>
                <p className="text-gray-700 leading-relaxed">
                  Pour toute question concernant cette politique de confidentialité, contactez-nous :<br />
                  Email : contact@maroc2030.ma<br />
                  Téléphone : +212 6 12 34 56 78
                </p>
              </section>
            </div>
          )
        };

      case 'cgv':
        return {
          icon: <FileText className="w-6 h-6" />,
          title: 'Conditions Générales de Vente',
          content: (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Article 1 - Objet</h3>
                <p className="text-gray-700 leading-relaxed">
                  Les présentes conditions générales de vente régissent les relations contractuelles entre 
                  Maroc 2030 et ses clients concernant la vente de services touristiques.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Article 2 - Prix</h3>
                <p className="text-gray-700 leading-relaxed">
                  Les prix sont indiqués en dirhams marocains (MAD) toutes taxes comprises. 
                  Maroc 2030 se réserve le droit de modifier ses prix à tout moment, 
                  mais les services seront facturés sur la base des tarifs en vigueur au moment de la réservation.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Article 3 - Réservation</h3>
                <p className="text-gray-700 leading-relaxed">
                  Toute réservation implique l'acceptation des présentes conditions générales de vente. 
                  La réservation est confirmée après paiement d'un acompte ou du montant total.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Article 4 - Paiement</h3>
                <p className="text-gray-700 leading-relaxed">
                  Le paiement s'effectue par carte bancaire via notre plateforme sécurisée Stripe. 
                  Un acompte de 30% peut être demandé lors de la réservation.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Article 5 - Annulation</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Les conditions d'annulation sont les suivantes :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Plus de 30 jours avant : Remboursement intégral</li>
                  <li>Entre 15 et 30 jours : Remboursement à 50%</li>
                  <li>Moins de 15 jours : Aucun remboursement</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Article 6 - Responsabilité</h3>
                <p className="text-gray-700 leading-relaxed">
                  Maroc 2030 s'engage à fournir les services réservés dans les meilleures conditions. 
                  Notre responsabilité ne peut être engagée en cas de force majeure ou d'événements indépendants de notre volonté.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Article 7 - Réclamations</h3>
                <p className="text-gray-700 leading-relaxed">
                  Toute réclamation doit être adressée par écrit à contact@maroc2030.ma dans un délai de 30 jours 
                  suivant la fin de la prestation.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Article 8 - Droit applicable</h3>
                <p className="text-gray-700 leading-relaxed">
                  Les présentes conditions générales sont soumises au droit marocain. 
                  Tout litige sera de la compétence exclusive des tribunaux de Meknès.
                </p>
              </section>
            </div>
          )
        };

      default:
        return { icon: null, title: '', content: null };
    }
  };

  const { icon, title, content } = getContent();

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-green-600 p-6 text-white sticky top-0 z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              {icon}
            </div>
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {content}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 sticky bottom-0">
          <p className="text-sm text-gray-600 text-center">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LegalModal;
