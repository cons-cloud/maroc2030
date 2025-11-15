import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, LogIn, UserPlus } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  onAuthRequired?: () => void;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, onAuthRequired }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Vérifier si l'utilisateur s'est connecté pendant que la modale était ouverte
  useEffect(() => {
    if (user && pendingAction) {
      // Exécuter l'action en attente
      pendingAction();
      setPendingAction(null);
      setShowAuthModal(false);
    }
  }, [user, pendingAction]);

  // Empêcher le défilement du fond lorsque la modale est ouverte
  useEffect(() => {
    if (showAuthModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAuthModal]);

  
  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const childElement = child as React.ReactElement<any>;
          const originalOnClick = childElement.props.onClick;
          
          return React.cloneElement(childElement, {
            onClick: (e: React.MouseEvent) => {
              if (!user) {
                e.preventDefault();
                e.stopPropagation();
                setShowAuthModal(true);
                if (onAuthRequired) onAuthRequired();
              } else if (originalOnClick) {
                originalOnClick(e);
              }
            },
          });
        }
        return child;
      })}

      {/* Modal d'authentification requise */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-8 relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connexion requise
              </h2>
              <p className="text-gray-600">
                Vous devez être connecté pour effectuer une réservation
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  // Enregistrer l'action à effectuer après la connexion
                  setPendingAction(() => {
                    const pendingReservation = sessionStorage.getItem('pendingReservation');
                    if (pendingReservation) {
                      const { eventId } = JSON.parse(pendingReservation);
                      return () => {
                        // Recharger la page pour forcer la réinitialisation du formulaire
                        window.location.reload();
                      };
                    }
                    return () => {};
                  });
                  
                  // Rediriger vers la page de connexion avec l'état actuel
                  navigate('/login', { 
                    state: { 
                      from: location.pathname,
                      fromReservation: true
                    } 
                  });
                }}
                className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-md"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Se connecter
              </button>

              <button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/inscription', { state: { from: window.location.pathname } });
                }}
                className="w-full flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-emerald-600 bg-white rounded-lg hover:bg-emerald-50 transition-colors font-medium"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Créer un compte
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Créez un compte gratuitement en quelques secondes
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthGuard;
