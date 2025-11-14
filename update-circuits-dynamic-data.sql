-- ================================================
-- MISE À JOUR DES CIRCUITS TOURISTIQUES
-- Données dynamiques pour prix, durée, participants
-- ================================================

-- Vérifier la structure de la table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'circuits_touristiques'
ORDER BY ordinal_position;

-- ================================================
-- AJOUTER LES COLONNES SI ELLES N'EXISTENT PAS
-- ================================================

-- Ajouter max_participants si n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'circuits_touristiques' 
    AND column_name = 'max_participants'
  ) THEN
    ALTER TABLE circuits_touristiques 
    ADD COLUMN max_participants INTEGER DEFAULT 20;
  END IF;
END $$;

-- Ajouter highlights si n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'circuits_touristiques' 
    AND column_name = 'highlights'
  ) THEN
    ALTER TABLE circuits_touristiques 
    ADD COLUMN highlights TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Ajouter included si n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'circuits_touristiques' 
    AND column_name = 'included'
  ) THEN
    ALTER TABLE circuits_touristiques 
    ADD COLUMN included TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Ajouter not_included si n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'circuits_touristiques' 
    AND column_name = 'not_included'
  ) THEN
    ALTER TABLE circuits_touristiques 
    ADD COLUMN not_included TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Ajouter itinerary si n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'circuits_touristiques' 
    AND column_name = 'itinerary'
  ) THEN
    ALTER TABLE circuits_touristiques 
    ADD COLUMN itinerary JSONB DEFAULT '[]';
  END IF;
END $$;

-- ================================================
-- METTRE À JOUR LES CIRCUITS EXISTANTS
-- ================================================

-- Exemple 1 : Circuit Désert de Merzouga
UPDATE circuits_touristiques
SET 
  price_per_person = 1200,
  duration_days = 3,
  max_participants = 15,
  highlights = ARRAY[
    'Coucher de soleil sur les dunes',
    'Nuit en bivouac berbère',
    'Balade à dos de chameau',
    'Visite des villages berbères',
    'Musique traditionnelle autour du feu'
  ],
  included = ARRAY[
    'Transport en 4x4 climatisé',
    'Hébergement en bivouac',
    'Tous les repas (petit-déjeuner, déjeuner, dîner)',
    'Guide francophone',
    'Balade à dos de chameau',
    'Eau minérale'
  ],
  not_included = ARRAY[
    'Boissons alcoolisées',
    'Pourboires',
    'Dépenses personnelles'
  ],
  itinerary = '[
    {
      "day": 1,
      "title": "Marrakech - Ouarzazate - Merzouga",
      "description": "Départ de Marrakech à travers le Haut Atlas. Visite de la Kasbah Ait Ben Haddou. Arrivée à Merzouga en fin d''après-midi."
    },
    {
      "day": 2,
      "title": "Exploration du désert",
      "description": "Journée complète dans le désert. Balade à dos de chameau, visite des villages nomades, coucher de soleil sur les dunes. Nuit en bivouac."
    },
    {
      "day": 3,
      "title": "Merzouga - Marrakech",
      "description": "Lever de soleil sur les dunes. Retour vers Marrakech avec arrêts photos et déjeuner en route."
    }
  ]'::jsonb
WHERE title ILIKE '%merzouga%' OR title ILIKE '%désert%'
LIMIT 1;

-- Exemple 2 : Circuit Villes Impériales
UPDATE circuits_touristiques
SET 
  price_per_person = 2500,
  duration_days = 7,
  max_participants = 20,
  highlights = ARRAY[
    'Visite des 4 villes impériales',
    'Médinas classées UNESCO',
    'Palais et jardins royaux',
    'Souks traditionnels',
    'Gastronomie marocaine'
  ],
  included = ARRAY[
    'Transport en minibus climatisé',
    'Hébergement en riads 4*',
    'Petit-déjeuner quotidien',
    'Guide francophone',
    'Entrées aux monuments',
    'Taxes touristiques'
  ],
  not_included = ARRAY[
    'Déjeuners et dîners',
    'Boissons',
    'Pourboires',
    'Assurance voyage'
  ],
  itinerary = '[
    {
      "day": 1,
      "title": "Arrivée à Casablanca",
      "description": "Accueil à l''aéroport. Visite de la Mosquée Hassan II. Installation à l''hôtel."
    },
    {
      "day": 2,
      "title": "Casablanca - Rabat",
      "description": "Visite de Rabat : Tour Hassan, Kasbah des Oudayas, Mausolée Mohammed V."
    },
    {
      "day": 3,
      "title": "Rabat - Meknès - Fès",
      "description": "Découverte de Meknès et ses remparts. Route vers Fès."
    },
    {
      "day": 4,
      "title": "Fès",
      "description": "Journée complète dans la médina de Fès, la plus grande du monde arabe."
    },
    {
      "day": 5,
      "title": "Fès - Marrakech",
      "description": "Route vers Marrakech à travers le Moyen Atlas."
    },
    {
      "day": 6,
      "title": "Marrakech",
      "description": "Visite complète : Palais Bahia, Jardin Majorelle, Place Jemaa el-Fna."
    },
    {
      "day": 7,
      "title": "Départ",
      "description": "Transfert à l''aéroport selon l''horaire de votre vol."
    }
  ]'::jsonb
WHERE title ILIKE '%villes impériales%' OR title ILIKE '%imperial%'
LIMIT 1;

-- Exemple 3 : Circuit Vallée du Dadès
UPDATE circuits_touristiques
SET 
  price_per_person = 950,
  duration_days = 2,
  max_participants = 12,
  highlights = ARRAY[
    'Gorges du Dadès',
    'Vallée des Roses',
    'Kasbahs traditionnelles',
    'Paysages montagneux',
    'Cuisine berbère authentique'
  ],
  included = ARRAY[
    'Transport en 4x4',
    'Hébergement en auberge',
    'Tous les repas',
    'Guide local',
    'Eau minérale'
  ],
  not_included = ARRAY[
    'Boissons autres que l''eau',
    'Pourboires',
    'Achats personnels'
  ],
  itinerary = '[
    {
      "day": 1,
      "title": "Marrakech - Dadès",
      "description": "Départ tôt le matin. Traversée du Haut Atlas. Visite de Ouarzazate et des Gorges du Dadès. Nuit en auberge."
    },
    {
      "day": 2,
      "title": "Dadès - Marrakech",
      "description": "Exploration de la Vallée des Roses. Retour à Marrakech en fin d''après-midi."
    }
  ]'::jsonb
WHERE title ILIKE '%dadès%' OR title ILIKE '%dades%'
LIMIT 1;

-- Exemple 4 : Circuit Essaouira
UPDATE circuits_touristiques
SET 
  price_per_person = 450,
  duration_days = 1,
  max_participants = 25,
  highlights = ARRAY[
    'Médina fortifiée UNESCO',
    'Port de pêche',
    'Plages de l''Atlantique',
    'Artisanat local',
    'Dégustation de poissons frais'
  ],
  included = ARRAY[
    'Transport aller-retour',
    'Guide francophone',
    'Temps libre dans la médina',
    'Eau minérale'
  ],
  not_included = ARRAY[
    'Repas',
    'Entrées aux musées',
    'Activités nautiques',
    'Achats personnels'
  ],
  itinerary = '[
    {
      "day": 1,
      "title": "Marrakech - Essaouira - Marrakech",
      "description": "Départ matinal vers Essaouira (3h de route). Visite guidée de la médina, du port et des remparts. Temps libre pour le déjeuner et shopping. Retour à Marrakech en soirée."
    }
  ]'::jsonb
WHERE title ILIKE '%essaouira%'
LIMIT 1;

-- ================================================
-- METTRE À JOUR TOUS LES AUTRES CIRCUITS
-- ================================================

-- Pour tous les circuits sans max_participants
UPDATE circuits_touristiques
SET max_participants = 15
WHERE max_participants IS NULL OR max_participants = 0;

-- Pour tous les circuits sans highlights
UPDATE circuits_touristiques
SET highlights = ARRAY[
  'Découverte culturelle',
  'Paysages exceptionnels',
  'Guide expérimenté',
  'Expérience authentique'
]
WHERE highlights IS NULL OR array_length(highlights, 1) IS NULL;

-- Pour tous les circuits sans included
UPDATE circuits_touristiques
SET included = ARRAY[
  'Transport',
  'Guide francophone',
  'Eau minérale'
]
WHERE included IS NULL OR array_length(included, 1) IS NULL;

-- Pour tous les circuits sans not_included
UPDATE circuits_touristiques
SET not_included = ARRAY[
  'Repas non mentionnés',
  'Boissons',
  'Pourboires',
  'Dépenses personnelles'
]
WHERE not_included IS NULL OR array_length(not_included, 1) IS NULL;

-- ================================================
-- VÉRIFICATION FINALE
-- ================================================

-- Afficher tous les circuits avec leurs données
SELECT 
  id,
  title,
  price_per_person,
  duration_days,
  max_participants,
  array_length(highlights, 1) as nb_highlights,
  array_length(included, 1) as nb_included,
  array_length(not_included, 1) as nb_not_included,
  jsonb_array_length(itinerary) as nb_days_itinerary
FROM circuits_touristiques
ORDER BY created_at DESC;

-- Afficher un exemple complet
SELECT 
  title,
  price_per_person,
  duration_days,
  max_participants,
  highlights,
  included,
  not_included,
  itinerary
FROM circuits_touristiques
LIMIT 1;
