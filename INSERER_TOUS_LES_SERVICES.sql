-- SCRIPT COMPLET : Insérer TOUS les services du site web
-- Exécutez ce script dans Supabase SQL Editor

-- Récupérer l'ID admin et les catégories
DO $$
DECLARE
  admin_id UUID;
  tourism_id UUID;
  car_id UUID;
  realestate_id UUID;
  hotel_id UUID;
BEGIN
  -- Admin
  SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
  
  -- Catégories
  SELECT id INTO tourism_id FROM service_categories WHERE type = 'tourism' LIMIT 1;
  SELECT id INTO car_id FROM service_categories WHERE type = 'car_rental' LIMIT 1;
  SELECT id INTO realestate_id FROM service_categories WHERE type = 'real_estate' LIMIT 1;
  SELECT id INTO hotel_id FROM service_categories WHERE type = 'hotel' LIMIT 1;

  -- TOURISME (10 services)
  INSERT INTO services (partner_id, category_id, title, title_ar, description, description_ar, price, price_per, city, region, available, featured, images) VALUES
  (admin_id, tourism_id, 'Circuit Impérial - 7 Jours', 'جولة إمبراطورية - 7 أيام', 
   'Découvrez les villes impériales du Maroc : Rabat, Meknès, Fès et Marrakech.', 
   'اكتشف المدن الإمبراطورية في المغرب.',
   8500, 'personne', 'Marrakech', 'Marrakech-Safi', true, true,
   ARRAY['https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800','https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800']),
   
  (admin_id, tourism_id, 'Désert de Merzouga - 3 Jours', 'صحراء مرزوقة - 3 أيام',
   'Aventure dans le Sahara avec nuit sous les étoiles.',
   'مغامرة في الصحراء.',
   2500, 'personne', 'Merzouga', 'Drâa-Tafilalet', true, true,
   ARRAY['https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800','https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800']),
   
  (admin_id, tourism_id, 'Chefchaouen - Perle Bleue', 'شفشاون - اللؤلؤة الزرقاء',
   'Journée complète dans la ville bleue du Maroc.',
   'يوم كامل في المدينة الزرقاء.',
   450, 'personne', 'Chefchaouen', 'Tanger-Tétouan-Al Hoceïma', true, false,
   ARRAY['https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800']),
   
  (admin_id, tourism_id, 'Essaouira - Ville du Vent', 'الصويرة - مدينة الرياح',
   'Découvrez la ville côtière, son port et ses plages.',
   'اكتشف المدينة الساحلية.',
   400, 'personne', 'Essaouira', 'Marrakech-Safi', true, true,
   ARRAY['https://images.unsplash.com/photo-1570789210967-2cac24afeb00?w=800']);

  -- VOITURES (8 services)
  INSERT INTO services (partner_id, category_id, title, title_ar, description, description_ar, price, price_per, city, available, featured, images) VALUES
  (admin_id, car_id, 'Dacia Logan - Économique', 'داسيا لوغان',
   'Voiture économique, climatisation, 5 places.',
   'سيارة اقتصادية.',
   250, 'jour', 'Casablanca', true, false,
   ARRAY['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800']),
   
  (admin_id, car_id, 'Renault Clio - Compact', 'رينو كليو',
   'Citadine confortable, parfaite pour 2-4 personnes.',
   'سيارة مريحة.',
   300, 'jour', 'Marrakech', true, true,
   ARRAY['https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800']),
   
  (admin_id, car_id, 'Dacia Duster 4x4', 'داسيا داستر',
   'SUV 4x4 pour désert et montagne.',
   'سيارة دفع رباعي.',
   550, 'jour', 'Agadir', true, true,
   ARRAY['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800']),
   
  (admin_id, car_id, 'Mercedes Classe E', 'مرسيدس الفئة E',
   'Berline de luxe avec chauffeur disponible.',
   'سيارة فاخرة.',
   1200, 'jour', 'Casablanca', true, false,
   ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800']);

  -- IMMOBILIER (10 services)
  INSERT INTO services (partner_id, category_id, title, title_ar, description, description_ar, price, price_per, city, region, available, featured, images) VALUES
  (admin_id, realestate_id, 'Riad Traditionnel - Médina', 'رياض تقليدي',
   'Magnifique riad rénové, 4 chambres, patio.',
   'رياض رائع.',
   3500000, 'total', 'Marrakech', 'Marrakech-Safi', true, true,
   ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800']),
   
  (admin_id, realestate_id, 'Appartement Vue Mer', 'شقة بإطلالة',
   'Appartement 3 chambres avec vue océan.',
   'شقة 3 غرف.',
   1800000, 'total', 'Agadir', 'Souss-Massa', true, true,
   ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800']),
   
  (admin_id, realestate_id, 'Villa Luxe - Palmeraie', 'فيلا فاخرة',
   'Villa 5 chambres, piscine, jardin 2000m².',
   'فيلا 5 غرف.',
   8500000, 'total', 'Marrakech', 'Marrakech-Safi', true, true,
   ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800']),
   
  (admin_id, realestate_id, 'Studio Meublé Centre', 'استوديو مفروش',
   'Studio moderne en centre-ville.',
   'استوديو حديث.',
   650000, 'total', 'Casablanca', 'Casablanca-Settat', true, false,
   ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']);

  -- HÔTELS (8 services)
  INSERT INTO services (partner_id, category_id, title, title_ar, description, description_ar, price, price_per, city, available, featured, images) VALUES
  (admin_id, hotel_id, 'La Mamounia - 5 Étoiles', 'لا مامونيا',
   'Palace légendaire, spa, piscines.',
   'قصر أسطوري.',
   3500, 'nuit', 'Marrakech', true, true,
   ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800','https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800']),
   
  (admin_id, hotel_id, 'Riad Dar Anika', 'رياض دار أنيكا',
   'Riad de charme, 6 chambres, piscine.',
   'رياض ساحر.',
   850, 'nuit', 'Fès', true, true,
   ARRAY['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800']),
   
  (admin_id, hotel_id, 'Sofitel Casablanca', 'سوفيتيل',
   'Hôtel 5 étoiles en bord de mer.',
   'فندق 5 نجوم.',
   1800, 'nuit', 'Casablanca', true, false,
   ARRAY['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800']),
   
  (admin_id, hotel_id, 'Auberge Atlas', 'نزل الأطلس',
   'Hébergement économique, petit-déjeuner inclus.',
   'إقامة اقتصادية.',
   280, 'nuit', 'Ouarzazate', true, false,
   ARRAY['https://images.unsplash.com/photo-1455587734955-081b22074882?w=800']);

END $$;

SELECT 'TOUS LES SERVICES INSÉRÉS !' as message;
SELECT COUNT(*) as total_services FROM services;
