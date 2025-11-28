import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  hasConsent, 
  setCookie,
  clearAllAuthCookies
} from '../../utils/cookieManager';
import { toast } from 'react-hot-toast';

// Composants UI personnalisés (à remplacer par vos propres composants si nécessaire)
const Button = ({ children, onClick, variant = 'default', className = '' }: { children: React.ReactNode; onClick?: () => void; variant?: 'default' | 'outline'; className?: string }) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-2 rounded-md ${
      variant === 'outline' 
        ? 'border border-gray-300 hover:bg-gray-100' 
        : 'bg-blue-600 text-white hover:bg-blue-700'
    } ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 border-b border-gray-200">
    {children}
  </div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-semibold text-gray-900">{children}</h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-1 text-sm text-gray-500">{children}</p>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 bg-gray-50 border-t border-gray-200 ${className}`}>
    <div className="flex justify-end space-x-3">
      {children}
    </div>
  </div>
);

const Switch = ({ 
  checked, 
  onChange, 
  disabled = false,
  className = '' 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void; 
  disabled?: boolean;
  className?: string;
}) => (
  <button
    type="button"
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
      checked ? 'bg-blue-600' : 'bg-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const Label = ({ children, htmlFor, className = '' }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
);

type CookieType = 'necessary' | 'preferences' | 'analytics' | 'marketing';

const cookieDescriptions: Record<CookieType, { label: string; description: string }> = {
  necessary: {
    label: 'Cookies nécessaires',
    description: 'Ces cookies sont essentiels au bon fonctionnement du site et ne peuvent pas être désactivés.'
  },
  preferences: {
    label: 'Préférences',
    description: 'Ces cookies mémorisent vos choix et préférences pour améliorer votre expérience.'
  },
  analytics: {
    label: 'Analytique',
    description: 'Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site.'
  },
  marketing: {
    label: 'Marketing',
    description: 'Ces cookies sont utilisés pour vous montrer des publicités pertinentes.'
  }
};

export const CookiePreferences = () => {
  const [preferences, setPreferences] = useState<Record<CookieType, boolean>>({
    necessary: true,
    preferences: true,
    analytics: false,
    marketing: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Charger les préférences existantes
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const savedPrefs: Record<CookieType, boolean> = {
          necessary: true, // Toujours actif
          preferences: hasConsent('preferences'),
          analytics: hasConsent('analytics'),
          marketing: hasConsent('marketing')
        };
        
        setPreferences(savedPrefs);
      } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleToggle = (type: CookieType) => {
    if (type === 'necessary') return; // Ne pas permettre de désactiver les cookies nécessaires
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSave = () => {
    try {
      // Préparer les préférences pour le stockage
      const prefsToSave = {
        preferences: preferences.preferences,
        analytics: preferences.analytics,
        marketing: preferences.marketing
      };

      // Sauvegarder les préférences dans un cookie
      setCookie('cookie-preferences', JSON.stringify(prefsToSave), {
        expires: 365, // 1 an
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });

      // Mettre à jour le consentement global
      const allAccepted = Object.values(preferences).every(Boolean);
      setCookie('cookie-consent', allAccepted ? 'all' : 'custom', {
        expires: 365, // 1 an
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });

      toast.success('Vos préférences de confidentialité ont été enregistrées.');
      
      // Recharger la page pour appliquer les changements
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
      toast.error('Une erreur est survenue lors de la sauvegarde de vos préférences.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Préférences de confidentialité</CardTitle>
        <CardDescription>
          Gérez vos préférences en matière de cookies et de suivi.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {Object.entries(cookieDescriptions).map(([type, { label, description }]) => (
            <div key={type} className="flex items-start space-x-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Label htmlFor={type} className="font-medium">
                    {label}
                  </Label>
                  {type === 'necessary' && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Toujours actif
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
              <div className="mt-1">
                <Switch
                  checked={preferences[type as CookieType]}
                  onChange={() => handleToggle(type as CookieType)}
                  disabled={type === 'necessary'}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">À propos des cookies</h4>
          <p className="text-sm text-muted-foreground">
            Nous utilisons des cookies pour améliorer votre expérience sur notre site. 
            Vous pouvez en savoir plus sur notre utilisation des cookies dans notre 
            <a href="/privacy" className="text-primary hover:underline ml-1">Politique de confidentialité</a>.
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Annuler
        </Button>
        <Button onClick={handleSave}>
          Enregistrer les préférences
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CookiePreferences;
