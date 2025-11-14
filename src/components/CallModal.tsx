import { X, Phone, Mail, MapPin, Clock } from 'lucide-react';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-primary to-green-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Contactez-nous</h2>
              <p className="text-white/90 text-sm">Nous sommes à votre écoute</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Téléphone */}
          <a
            href="tel:+212612345678"
            className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-primary/5 rounded-xl transition-all group border border-gray-200 hover:border-primary"
          >
            <div className="bg-primary/10 group-hover:bg-primary p-3 rounded-full transition-colors">
              <Phone className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium">Téléphone</p>
              <p className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                +212 6 12 34 56 78
              </p>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:contact@maroc2030.ma"
            className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-primary/5 rounded-xl transition-all group border border-gray-200 hover:border-primary"
          >
            <div className="bg-primary/10 group-hover:bg-primary p-3 rounded-full transition-colors">
              <Mail className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium">Email</p>
              <p className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors">
                contact@maroc2030.ma
              </p>
            </div>
          </a>

          {/* Adresse */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="bg-primary/10 p-3 rounded-full">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium mb-1">Adresse</p>
              <p className="text-sm text-gray-900">
                Avenue Mohammed VI<br />
                Meknès 50000, Maroc
              </p>
            </div>
          </div>

          {/* Horaires */}
          <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-primary/5 to-green-50 rounded-xl border border-primary/20">
            <div className="bg-primary/10 p-3 rounded-full">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium mb-2">Horaires d'ouverture</p>
              <div className="space-y-1 text-sm text-gray-700">
                <p className="flex justify-between">
                  <span className="font-medium">Lun - Ven :</span>
                  <span>9h00 - 18h00</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Samedi :</span>
                  <span>9h00 - 13h00</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Dimanche :</span>
                  <span className="text-red-600">Fermé</span>
                </p>
              </div>
            </div>
          </div>

          {/* Message d'encouragement */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              Notre équipe est prête à répondre à toutes vos questions !
            </p>
          </div>
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

export default CallModal;
