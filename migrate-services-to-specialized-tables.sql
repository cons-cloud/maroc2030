-- ============================================
-- MIGRATION DES DONNÉES EXISTANTES
-- De la table 'services' vers les tables spécialisées
-- ============================================

-- 1. MIGRER LES HÔTELS
INSERT INTO hotels (
  partner_id, name, description, price_per_night, city, region, 
  address, images, available, featured, contact_phone, contact_email, created_at
)
SELECT 
  partner_id,
  title as name,
  description,
  COALESCE(price_per_night, price) as price_per_night,
  city,
  region,
  location as address,
  images,
  available,
  featured, 
  contact_phone,
  contact_email,
  created_at
FROM services
WHERE type = 'hotel' OR category = 'hotel';

-- 2. MIGRER LES APPARTEMENTS
INSERT INTO appartements (
  partner_id, title, description, price_per_night, bedrooms, bathrooms,
  city, region, address, images, available, featured, 
  contact_phone, contact_email, created_at
)
SELECT 
  partner_id,
  title,
  description,
  COALESCE(price_per_night, price) as price_per_night,
  bedrooms,
  bathrooms,
  city,
  region,
  location as address,
  images,
  available,
  featured,
  contact_phone,
  contact_email,
  created_at
FROM services
WHERE type = 'apartment' OR category = 'apartment' OR category = 'appartement';

-- 3. MIGRER LES VILLAS
INSERT INTO villas (
  partner_id, title, description, price_per_night, bedrooms, bathrooms,
  city, region, address, images, available, featured,
  contact_phone, contact_email, created_at
)
SELECT 
  partner_id,
  title,
  description,
  COALESCE(price_per_night, price) as price_per_night,
  bedrooms,
  bathrooms,
  city,
  region,
  location as address,
  images,
  available,
  featured,
  contact_phone,
  contact_email,
  created_at
FROM services
WHERE type = 'villa' OR category = 'villa';

-- 4. MIGRER LES VOITURES
INSERT INTO locations_voitures (
  partner_id, brand, model, year, description, price_per_day,
  fuel_type, transmission, seats, city, images, available, featured,
  contact_phone, contact_email, created_at
)
SELECT 
  partner_id,
  COALESCE(
    SPLIT_PART(title, ' ', 1),
    'Marque'
  ) as brand,
  COALESCE(
    SUBSTRING(title FROM POSITION(' ' IN title) + 1),
    title
  ) as model,
  EXTRACT(YEAR FROM created_at)::INTEGER as year,
  description,
  COALESCE(price_per_day, price) as price_per_day,
  'Essence' as fuel_type,
  'Manuelle' as transmission,
  5 as seats,
  city,
  images,
  available,
  featured,
  contact_phone,
  contact_email,
  created_at
FROM services
WHERE type = 'car' OR category = 'car' OR category = 'voiture';

-- 5. MIGRER L'IMMOBILIER
INSERT INTO immobilier (
  partner_id, title, description, price, property_type, transaction_type,
  city, region, address, images, available, featured,
  contact_phone, contact_email, created_at
)
SELECT 
  partner_id,
  title,
  description,
  COALESCE(price, price_per_night * 30) as price,
  COALESCE(subcategory, 'Autre') as property_type,
  'vente' as transaction_type,
  city,
  region,
  location as address,
  images,
  available,
  featured,
  contact_phone,
  contact_email,
  created_at
FROM services
WHERE type = 'real_estate' OR category = 'immobilier';

-- 6. MIGRER LES CIRCUITS TOURISTIQUES
INSERT INTO circuits_touristiques (
  partner_id, title, description, duration_days, price_per_person,
  images, available, featured, contact_phone, contact_email, created_at
)
SELECT 
  partner_id,
  title,
  description,
  COALESCE(duration, 3) as duration_days,
  COALESCE(price, price_per_night) as price_per_person,
  images,
  available,
  featured,
  contact_phone,
  contact_email,
  created_at
FROM services
WHERE type = 'tour' OR category = 'circuit' OR category = 'tourisme';

-- 7. MIGRER LES ACTIVITÉS TOURISTIQUES
INSERT INTO activites_touristiques (
  partner_id, title, description, activity_type, duration_hours,
  price_per_person, city, region, images, available, featured,
  contact_phone, contact_email, created_at
)
SELECT 
  partner_id,
  title,
  description,
  COALESCE(subcategory, 'Excursion') as activity_type,
  COALESCE(duration, 4) as duration_hours,
  COALESCE(price, price_per_night) as price_per_person,
  city,
  region,
  images,
  available,
  featured,
  contact_phone,
  contact_email,
  created_at
FROM services
WHERE type = 'activity' OR category = 'activite';

-- 8. MIGRER LES ÉVÉNEMENTS
INSERT INTO evenements (
  organizer_id, title, description, event_type, start_date,
  price, city, venue, images, featured, contact_phone, contact_email, created_at
)
SELECT 
  partner_id as organizer_id,
  title,
  description,
  COALESCE(subcategory, 'Culturel') as event_type,
  COALESCE(created_at + INTERVAL '7 days', NOW() + INTERVAL '7 days') as start_date,
  COALESCE(price, 0) as price,
  city,
  location as venue,
  images,
  featured,
  contact_phone,
  contact_email,
  created_at
FROM services
WHERE type = 'event' OR category = 'evenement';

-- 9. MIGRER LES ANNONCES
INSERT INTO annonces (
  user_id, title, description, category, price, is_negotiable,
  city, region, images, status, contact_phone, contact_email, created_at
)
SELECT 
  partner_id as user_id,
  title,
  description,
  COALESCE(category, 'Divers') as category,
  COALESCE(price, price_per_night) as price,
  true as is_negotiable,
  city,
  region,
  images,
  CASE WHEN available THEN 'active' ELSE 'expired' END as status,
  contact_phone,
  contact_email,
  created_at
FROM services
WHERE type = 'classified' OR category = 'annonce';

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT 
  'Hotels' as table_name, 
  COUNT(*) as total_migrated 
FROM hotels
UNION ALL
SELECT 'Appartements', COUNT(*) FROM appartements
UNION ALL
SELECT 'Villas', COUNT(*) FROM villas
UNION ALL
SELECT 'Voitures', COUNT(*) FROM locations_voitures
UNION ALL
SELECT 'Immobilier', COUNT(*) FROM immobilier
UNION ALL
SELECT 'Circuits', COUNT(*) FROM circuits_touristiques
UNION ALL
SELECT 'Activités', COUNT(*) FROM activites_touristiques
UNION ALL
SELECT 'Événements', COUNT(*) FROM evenements
UNION ALL
SELECT 'Annonces', COUNT(*) FROM annonces;

SELECT '✅ MIGRATION TERMINÉE !' as message;
