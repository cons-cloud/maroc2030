import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, User, Mail, Phone, Building, Home, Car, Compass, ArrowLeftCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePhoneMaroc as validatePhone } from '../utils/validation';

interface FormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  entreprise: string;
  typeService: string;
  message: string;
}

const DevenirHote: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Rediriger vers la page d'inscription
  useEffect(() => {
    navigate('/inscription');
  }, [navigate]);

  const [formData, setFormData] = useState<FormData>({
    nom: '',
    prenom: '',
    email: user?.email || '',
    telephone: (user?.user_metadata as { phone?: string })?.phone || '',
    entreprise: '',
    typeService: 'hotel',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Veuillez entrer un email valide';
    }
    if (formData.telephone && !validatePhone(formData.telephone)) {
      newErrors.telephone = 'Numéro de téléphone invalide';
    }
    if (!formData.entreprise.trim()) newErrors.entreprise = 'Le nom de l\'entreprise est requis';
    if (!formData.message.trim()) newErrors.message = 'Veuvez décrire votre activité';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Ici, vous pourriez envoyer les données à votre backend ou à un service d'email
      // Par exemple :
      // await api.post('/api/devenir-hote', formData);
      
      // Simulation de délai pour l'envoi
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Votre demande a été envoyée avec succès ! Nous vous contacterons bientôt.');
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceTypes = [
    { value: 'hotel', label: 'Hôtel', icon: <Home className="w-5 h-5" /> },
    { value: 'appartement', label: 'Appartement', icon: <Building className="w-5 h-5" /> },
    { value: 'villa', label: 'Villa', icon: <Home className="w-5 h-5" /> },
    { value: 'voiture', label: 'Location de voiture', icon: <Car className="w-5 h-5" /> },
    { value: 'tourisme', label: 'Activité touristique', icon: <Compass className="w-5 h-5" /> },
    { value: 'autre', label: 'Autre', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-emerald-100 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-900 transition-colors"
          >
            <ArrowLeftCircle className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-4 py-2 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Devenir Hôte sur Maroc 2030</h1>
              <p className="text-gray-600">Rejoignez notre communauté de partenaires et commencez à gagner de l'argent avec vos biens ou services.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      className={`pl-10 block w-full rounded-lg border ${
                        errors.prenom ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                      } shadow-sm sm:text-sm`}
                      placeholder="Votre prénom"
                    />
                  </div>
                  {errors.prenom && <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>}
                </div>

                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className={`pl-10 block w-full rounded-lg border ${
                        errors.nom ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                      } shadow-sm sm:text-sm`}
                      placeholder="Votre nom"
                    />
                  </div>
                  {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`pl-10 block w-full rounded-lg border ${
                        errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                      } shadow-sm sm:text-sm`}
                      placeholder="votre@email.com"
                      disabled={!!user?.email}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      className={`pl-10 block w-full rounded-lg border ${
                        errors.telephone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                      } shadow-sm sm:text-sm`}
                      placeholder="+212 6 12 34 56 78"
                    />
                  </div>
                  {errors.telephone && <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="entreprise" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'établissement ou de l'entreprise <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="entreprise"
                    name="entreprise"
                    value={formData.entreprise}
                    onChange={handleChange}
                    className={`pl-10 block w-full rounded-lg border ${
                      errors.entreprise ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                    } shadow-sm sm:text-sm`}
                    placeholder="Le nom de votre établissement ou entreprise"
                  />
                </div>
                {errors.entreprise && <p className="mt-1 text-sm text-red-600">{errors.entreprise}</p>}
              </div>

              <div>
                <label htmlFor="typeService" className="block text-sm font-medium text-gray-700 mb-1">
                  Type de service proposé <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {serviceTypes.map((service) => (
                    <div key={service.value} className="flex items-center">
                      <input
                        id={`service-${service.value}`}
                        name="typeService"
                        type="radio"
                        value={service.value}
                        checked={formData.typeService === service.value}
                        onChange={handleChange}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                      />
                      <label htmlFor={`service-${service.value}`} className="ml-2 flex items-center text-sm text-gray-700">
                        <span className="mr-1">{service.icon}</span>
                        {service.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Décrivez votre activité <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className={`block w-full rounded-lg border ${
                    errors.message ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                  } shadow-sm sm:text-sm`}
                  placeholder="Décrivez votre établissement, vos services, votre localisation, etc."
                />
                {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-700">
                    J'accepte les <a href="/conditions-generales" className="text-emerald-600 hover:text-emerald-500">conditions d'utilisation</a> et la <a href="/politique-de-confidentialite" className="text-emerald-600 hover:text-emerald-500">politique de confidentialité</a>.
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                      Envoi en cours...
                    </>
                  ) : (
                    'Envoyer ma demande'
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Vous avez des questions ?</h3>
              <p className="text-gray-600 mb-4">Notre équipe est là pour vous aider.</p>
              <a
                href="mailto:partenaires@maroc2030.ma"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-emerald-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <Mail className="-ml-1 mr-2 h-5 w-5 text-emerald-500" />
                Contactez-nous
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevenirHote;
