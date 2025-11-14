// Configuration SEO optimisée pour Google - Maroc 2030
export const SEO_CONFIG = {
  // Informations principales
  siteName: 'Maroc 2030 - Plateforme Touristique N°1 au Maroc',
  siteUrl: 'https://maroc2030.ma', // Remplacer par votre domaine
  defaultTitle: 'Maroc 2030 | Réservation Hôtels, Circuits, Voitures & Immobilier au Maroc',
  defaultDescription: 'Découvrez le Maroc avec Maroc 2030 : Réservation d\'hôtels, appartements, villas, circuits touristiques, location de voitures, guides professionnels. Meilleurs prix garantis. Paiement sécurisé.',
  defaultKeywords: [
    // Mots-clés principaux (high volume)
    'maroc tourisme',
    'voyage maroc',
    'hotel maroc',
    'réservation maroc',
    'vacances maroc',
    
    // Mots-clés spécifiques services
    'location voiture maroc',
    'circuit touristique maroc',
    'appartement maroc',
    'villa maroc',
    'riad maroc',
    'guide touristique maroc',
    
    // Mots-clés villes principales
    'hotel marrakech',
    'hotel casablanca',
    'hotel agadir',
    'hotel fes',
    'hotel tanger',
    'hotel rabat',
    'hotel essaouira',
    'hotel chefchaouen',
    
    // Mots-clés longue traîne
    'réserver hotel maroc pas cher',
    'meilleur circuit maroc',
    'location voiture maroc aéroport',
    'appartement vacances maroc',
    'villa avec piscine maroc',
    'guide francophone maroc',
    'excursion desert maroc',
    'weekend maroc',
    
    // Mots-clés immobilier
    'immobilier maroc',
    'acheter maison maroc',
    'location appartement maroc',
    'villa a vendre maroc',
    
    // Mots-clés activités
    'activités maroc',
    'que faire au maroc',
    'tourisme maroc 2024',
    'voyage organisé maroc',
    'séjour tout compris maroc',
  ],
  
  // Open Graph (Facebook, LinkedIn)
  ogImage: '/assets/og-image.jpg', // 1200x630px
  ogType: 'website',
  
  // Twitter Card
  twitterCard: 'summary_large_image',
  twitterSite: '@Maroc2030',
  twitterCreator: '@Maroc2030',
  
  // Informations de contact
  contact: {
    email: 'contact@maroc2030.ma',
    phone: '+212 XXX XXX XXX',
    address: 'Maroc',
  },
  
  // Réseaux sociaux
  social: {
    facebook: 'https://facebook.com/maroc2030',
    instagram: 'https://instagram.com/maroc2030',
    twitter: 'https://twitter.com/maroc2030',
    linkedin: 'https://linkedin.com/company/maroc2030',
  },
  
  // Langues disponibles
  languages: ['fr', 'ar', 'en'],
  defaultLanguage: 'fr',
  
  // Données structurées
  organization: {
    '@type': 'TravelAgency',
    name: 'Maroc 2030',
    description: 'Plateforme de réservation touristique au Maroc',
    url: 'https://maroc2030.ma',
    logo: 'https://maroc2030.ma/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+212-XXX-XXX-XXX',
      contactType: 'customer service',
      areaServed: 'MA',
      availableLanguage: ['French', 'Arabic', 'English']
    },
    sameAs: [
      'https://facebook.com/maroc2030',
      'https://instagram.com/maroc2030',
      'https://twitter.com/maroc2030',
    ]
  }
};

// Mots-clés par page
export const PAGE_SEO = {
  home: {
    title: 'Maroc 2030 | Réservation Hôtels, Circuits & Voitures au Maroc',
    description: 'Plateforme N°1 de réservation touristique au Maroc. Hôtels, circuits, location voitures, appartements, villas. Meilleurs prix garantis. Réservation en ligne sécurisée.',
    keywords: 'maroc tourisme, voyage maroc, hotel maroc, réservation maroc, circuit maroc, location voiture maroc',
  },
  
  hotels: {
    title: 'Hôtels au Maroc | Réservation en Ligne - Meilleurs Prix Garantis',
    description: 'Réservez votre hôtel au Maroc : Marrakech, Casablanca, Agadir, Fès, Tanger. Large choix d\'hôtels 3, 4 et 5 étoiles. Annulation gratuite. Paiement sécurisé.',
    keywords: 'hotel maroc, réservation hotel maroc, hotel marrakech, hotel casablanca, hotel pas cher maroc, riad maroc',
  },
  
  appartements: {
    title: 'Location Appartements au Maroc | Vacances & Séjours',
    description: 'Louez un appartement au Maroc pour vos vacances. Appartements meublés à Marrakech, Casablanca, Agadir. Locations courte et longue durée. Prix attractifs.',
    keywords: 'appartement maroc, location appartement maroc, appartement vacances maroc, location meublée maroc',
  },
  
  villas: {
    title: 'Location Villas de Luxe au Maroc | Avec Piscine Privée',
    description: 'Villas de luxe au Maroc avec piscine privée. Marrakech, Essaouira, Agadir. Villas haut de gamme pour vacances inoubliables. Réservation en ligne.',
    keywords: 'villa maroc, location villa maroc, villa avec piscine maroc, villa luxe maroc, villa marrakech',
  },
  
  voitures: {
    title: 'Location Voiture Maroc | Aéroport & Villes - Prix Pas Cher',
    description: 'Location de voiture au Maroc : aéroports, Marrakech, Casablanca, Agadir. Large choix de véhicules. Prix compétitifs. Réservation en ligne simple et rapide.',
    keywords: 'location voiture maroc, location voiture marrakech, location voiture casablanca, location voiture aéroport maroc, voiture pas cher maroc',
  },
  
  circuits: {
    title: 'Circuits Touristiques au Maroc | Voyages Organisés & Excursions',
    description: 'Circuits touristiques au Maroc : désert, villes impériales, montagnes. Circuits 3, 5, 7 jours. Guides francophones. Tout compris. Réservation en ligne.',
    keywords: 'circuit maroc, circuit touristique maroc, voyage organisé maroc, excursion maroc, circuit desert maroc, circuit villes impériales',
  },
  
  guides: {
    title: 'Guides Touristiques Professionnels au Maroc | Francophones',
    description: 'Guides touristiques professionnels au Maroc. Guides francophones, anglophones, arabophones. Visites guidées personnalisées. Réservation en ligne.',
    keywords: 'guide touristique maroc, guide francophone maroc, visite guidée maroc, guide marrakech, guide fes',
  },
  
  activites: {
    title: 'Activités & Excursions au Maroc | Que Faire au Maroc',
    description: 'Activités touristiques au Maroc : quad, chameau, randonnée, surf, cuisine. Excursions d\'une journée. Réservation en ligne. Meilleurs prix.',
    keywords: 'activités maroc, que faire au maroc, excursion maroc, quad maroc, randonnée maroc, surf maroc',
  },
  
  evenements: {
    title: 'Événements au Maroc | Festivals, Concerts & Spectacles',
    description: 'Événements culturels au Maroc : festivals, concerts, spectacles. Réservation de billets en ligne. Agenda complet des événements.',
    keywords: 'événements maroc, festival maroc, concert maroc, spectacle maroc, culture maroc',
  },
  
  immobilier: {
    title: 'Immobilier au Maroc | Achat, Vente & Location',
    description: 'Immobilier au Maroc : appartements, villas, maisons. Achat, vente, location. Marrakech, Casablanca, Rabat, Tanger. Annonces vérifiées.',
    keywords: 'immobilier maroc, acheter maison maroc, villa a vendre maroc, appartement maroc, immobilier marrakech',
  },
  
  contact: {
    title: 'Contact Maroc 2030 | Service Client & Réservations',
    description: 'Contactez Maroc 2030 pour vos réservations et questions. Service client disponible 7j/7. Email, téléphone, formulaire de contact.',
    keywords: 'contact maroc 2030, service client maroc, réservation maroc, assistance tourisme maroc',
  },
};

// Fonction pour générer les meta tags
export const generateMetaTags = (page: keyof typeof PAGE_SEO) => {
  const pageSEO = PAGE_SEO[page] || PAGE_SEO.home;
  
  return {
    title: pageSEO.title,
    description: pageSEO.description,
    keywords: pageSEO.keywords,
    canonical: `${SEO_CONFIG.siteUrl}/${page === 'home' ? '' : page}`,
    ogTitle: pageSEO.title,
    ogDescription: pageSEO.description,
    ogUrl: `${SEO_CONFIG.siteUrl}/${page === 'home' ? '' : page}`,
    ogImage: SEO_CONFIG.ogImage,
  };
};
