-- ================================================
-- MISE À JOUR DES CIRCUITS TOURISTIQUES - VERSION CORRIGÉE
-- Données dynamiques pour prix, durée, participants
-- ================================================

-- ================================================
-- AJOUTER LES COLONNES SI ELLES N'EXISTENT PAS
-- ================================================

-- Ajouter max_participants
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

-- Ajouter highlights
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

-- Ajouter included
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

-- Ajouter not_included
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

-- Ajouter itinerary
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
-- METTRE À JOUR TOUS LES CIRCUITS AVEC VALEURS PAR DÉFAUT
-- ================================================

-- Mettre à jour max_participants pour tous
UPDATE circuits_touristiques
SET max_participants = 15
WHERE max_participants IS NULL OR max_participants = 0;

-- Mettre à jour highlights pour tous
UPDATE circuits_touristiques
SET highlights = ARRAY[
  'Découverte culturelle',
  'Paysages exceptionnels',
  'Guide expérimenté',
  'Expérience authentique'
]
WHERE highlights IS NULL OR array_length(highlights, 1) IS NULL;

-- Mettre à jour included pour tous
UPDATE circuits_touristiques
SET included = ARRAY[
  'Transport',
  'Guide francophone',
  'Eau minérale'
]
WHERE included IS NULL OR array_length(included, 1) IS NULL;

-- Mettre à jour not_included pour tous
UPDATE circuits_touristiques
SET not_included = ARRAY[
  'Repas non mentionnés',
  'Boissons',
  'Pourboires',
  'Dépenses personnelles'
]
WHERE not_included IS NULL OR array_length(not_included, 1) IS NULL;

-- ================================================
-- EXEMPLES SPÉCIFIQUES (Optionnel - Décommentez si besoin)
-- ================================================

-- Circuit Désert (prix moyen)
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
    'Musique traditionnelle'
  ],
  included = ARRAY[
    'Transport en 4x4',
    'Hébergement en bivouac',
    'Tous les repas',
    'Guide francophone',
    'Balade à chameau'
  ],
  not_included = ARRAY[
    'Boissons alcoolisées',
    'Pourboires',
    'Dépenses personnelles'
  ]
WHERE (title ILIKE '%merzouga%' OR title ILIKE '%désert%' OR title ILIKE '%desert%')
AND price_per_person < 1000;

-- Circuit court (1 jour)
UPDATE circuits_touristiques
SET 
  price_per_person = 450,
  duration_days = 1,
  max_participants = 25,
  highlights = ARRAY[
    'Excursion d''une journée',
    'Découverte rapide',
    'Idéal pour weekend',
    'Transport inclus'
  ],
  included = ARRAY[
    'Transport aller-retour',
    'Guide francophone',
    'Eau minérale'
  ],
  not_included = ARRAY[
    'Repas',
    'Entrées musées',
    'Dépenses personnelles'
  ]
WHERE duration_days = 1 OR title ILIKE '%essaouira%';

-- Circuit moyen (2-3 jours)
UPDATE circuits_touristiques
SET 
  price_per_person = 950,
  duration_days = 2,
  max_participants = 12,
  highlights = ARRAY[
    'Weekend prolongé',
    'Découverte approfondie',
    'Hébergement confortable',
    'Cuisine locale'
  ],
  included = ARRAY[
    'Transport en 4x4',
    'Hébergement',
    'Tous les repas',
    'Guide local'
  ],
  not_included = ARRAY[
    'Boissons',
    'Pourboires',
    'Achats personnels'
  ]
WHERE duration_days = 2 OR (title ILIKE '%dadès%' OR title ILIKE '%dades%');

-- Circuit long (7+ jours)
UPDATE circuits_touristiques
SET 
  price_per_person = 2500,
  duration_days = 7,
  max_participants = 20,
  highlights = ARRAY[
    'Circuit complet',
    'Plusieurs villes',
    'Hébergement premium',
    'Expérience complète'
  ],
  included = ARRAY[
    'Transport en minibus',
    'Hébergement en riads',
    'Petits-déjeuners',
    'Guide francophone',
    'Entrées monuments'
  ],
  not_included = ARRAY[
    'Déjeuners et dîners',
    'Boissons',
    'Pourboires',
    'Assurance voyage'
  ]
WHERE duration_days >= 7 OR title ILIKE '%impérial%';

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
  available
FROM circuits_touristiques
ORDER BY duration_days, price_per_person;

-- Compter les circuits par durée
SELECT 
  duration_days,
  COUNT(*) as nombre_circuits,
  MIN(price_per_person) as prix_min,
  MAX(price_per_person) as prix_max,
  AVG(price_per_person)::INTEGER as prix_moyen
FROM circuits_touristiques
GROUP BY duration_days
ORDER BY duration_days;
