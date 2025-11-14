import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock, FiMessageSquare } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useSiteContent } from '../contexts/SiteContentContext';

const Contact = () => {
  const { settings } = useSiteSettings();
  const { getContent } = useSiteContent();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    subject: '',
    message: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          phone: formData.phone,
          name: `${formData.first_name} ${formData.last_name}`,
          is_read: false
        }]);

      if (error) throw error;

      toast.success(getContent('contact.form.success', 'Message envoyé avec succès ! Nous vous répondrons bientôt.'));
      
      // Réinitialiser le formulaire
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        subject: '',
        message: '',
        phone: ''
      });
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <FiMail className="h-6 w-6 text-primary" />,
      title: 'Email',
      description: settings?.email || 'contact@maroc2030.com',
      link: `mailto:${settings?.email || 'contact@maroc2030.com'}`
    },
    {
      icon: <FiPhone className="h-6 w-6 text-primary" />,
      title: 'Téléphone',
      description: settings?.phone_primary || '+212 6 12 34 56 78',
      link: `tel:${settings?.phone_primary?.replace(/\s/g, '') || '+212612345678'}`
    },
    {
      icon: <FiMapPin className="h-6 w-6 text-primary" />,
      title: 'Adresse',
      description: `${settings?.address || '123 Avenue Mohammed V'}, ${settings?.postal_code || '40000'} ${settings?.city || 'Marrakech'}, ${settings?.country || 'Maroc'}`,
      link: `https://maps.google.com/?q=${settings?.city || 'Marrakech'},${settings?.country || 'Maroc'}`
    },
    {
      icon: <FiClock className="h-6 w-6 text-primary" />,
      title: 'Heures d\'ouverture',
      description: getOpeningHoursText(settings?.opening_hours),
      link: ''
    }
  ];

  function getOpeningHoursText(hours: any): string {
    if (!hours) return 'Lundi - Vendredi: 9h00 - 18h00\nSamedi: 9h00 - 13h00';
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const lines: string[] = [];
    let currentRange = { start: 0, end: 0, hours: '' };
    
    days.forEach((day, index) => {
      const dayData = hours[day];
      if (!dayData || dayData.closed) return;
      const hoursText = `${dayData.open} - ${dayData.close}`;
      
      if (currentRange.hours === hoursText && currentRange.end === index - 1) {
        currentRange.end = index;
      } else {
        if (currentRange.hours) {
          const rangeText = currentRange.start === currentRange.end 
            ? dayNames[currentRange.start]
            : `${dayNames[currentRange.start]} - ${dayNames[currentRange.end]}`;
          lines.push(`${rangeText}: ${currentRange.hours}`);
        }
        currentRange = { start: index, end: index, hours: hoursText };
      }
    });
    
    if (currentRange.hours) {
      const rangeText = currentRange.start === currentRange.end 
        ? dayNames[currentRange.start]
        : `${dayNames[currentRange.start]} - ${dayNames[currentRange.end]}`;
      lines.push(`${rangeText}: ${currentRange.hours}`);
    }
    
    return lines.join('\n') || 'Lundi - Vendredi: 9h00 - 18h00';
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80)' }}>
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{getContent('contact.title', 'Contactez-nous')}</h1>
            <p className="text-xl">{getContent('contact.subtitle', 'Nous sommes là pour répondre à toutes vos questions')}</p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{settings?.site_name || 'Maroc 2030'} - Restons en contact</h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Que vous ayez des questions sur nos services ou que vous souhaitiez en savoir plus sur nos offres, n'hésitez pas à nous contacter.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white p-8 rounded-2xl shadow-xl"
              >
                <div className="flex items-center mb-6">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <FiMessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{getContent('contact.form.title', 'Envoyez-nous un message')}</h3>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                      <input
                        type="text"
                        id="first-name"
                        required
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div>
                      <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <input
                        type="text"
                        id="last-name"
                        required
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                      placeholder="votre@email.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                    <input
                      type="text"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                      placeholder="Objet de votre message"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition resize-none"
                      placeholder="Comment pouvons-nous vous aider ?"
                    ></textarea>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center px-8 py-4 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiSend className="mr-2" />
                      {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                    </button>
                  </div>
                </form>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-8"
              >
                {/* Contact Cards */}
                <div className="grid grid-cols-1 gap-6">
                  {contactInfo.map((item, index) => (
                    <motion.a
                      key={index}
                      href={item.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                      whileHover={{ y: -5 }}
                    >
                      <div className="bg-primary/10 p-3 rounded-full mr-4 flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-gray-600 whitespace-pre-line">{item.description}</p>
                      </div>
                    </motion.a>
                  ))}
                </div>

                {/* Map */}
                <div className="bg-white p-1 rounded-xl shadow-lg overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9 w-full h-64 md:h-80">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d105994.7791205954!2d-5.620421386965054!3d33.88097757686905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda044d23bfc49d1%3A0xfbbf80a99e4cde18!2zTWVrbsOocw!5e0!3m2!1sfr!2sma!4v1761441304461!5m2!1sfr!2sma"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title="Carte de localisation"
                    ></iframe>
                  </div>
                </div>

              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">
              Trouvez des réponses aux questions les plus courantes sur nos services et le tourisme au Maroc.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "Quelle est la meilleure période pour visiter le Maroc ?",
                answer: "Le printemps (mars à mai) et l'automne (septembre à novembre) sont les meilleures périodes pour visiter le Maroc, avec des températures agréables et des paysages magnifiques."
              },
              {
                question: "Avez-vous des guides francophones ?",
                answer: "Oui, tous nos guides sont parfaitement francophones et expérimentés. Certains parlent également anglais, espagnol et arabe."
              },
              {
                question: "Quels sont les moyens de paiement acceptés ?",
                answer: "Nous acceptons les cartes de crédit (Visa, Mastercard), les virements bancaires et les paiements en espèces en dirhams marocains (MAD)."
              },
              {
                question: "Proposez-vous des itinéraires personnalisés ?",
                answer: "Absolument ! Nous créons des itinéraires sur mesure selon vos intérêts, votre budget et la durée de votre séjour."
              },
              {
                question: "Quelles sont les mesures de sécurité en place ?",
                answer: "La sécurité de nos clients est notre priorité. Nous suivons toutes les directives sanitaires en vigueur et travaillons exclusivement avec des partenaires de confiance."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 mb-6">Vous ne trouvez pas de réponse à votre question ?</p>
            <a
              href="#contact-form"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              <FiMessageSquare className="mr-2" />
              Contactez-nous directement
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;