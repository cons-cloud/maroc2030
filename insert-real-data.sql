-- ============================================
-- INSERTION DE DONNÉES RÉELLES - MAROC 2030
-- ============================================

-- IMPORTANT : Exécutez ce script APRÈS setup-storage-clean.sql
-- et APRÈS avoir créé vos comptes admin

-- ============================================
-- SERVICES DE TOURISME
-- ============================================

-- Récupérer l'ID de la catégorie tourisme
DO $$
DECLARE
  tourism_cat_id UUID;
  car_cat_id UUID;
  realestate_cat_id UUID;
  hotel_cat_id UUID;
  admin_id UUID;
BEGIN
  -- Récupérer les IDs des catégories
  SELECT id INTO tourism_cat_id FROM service_categories WHERE type = 'tourism' LIMIT 1;
  SELECT id INTO car_cat_id FROM service_categories WHERE type = 'car_rental' LIMIT 1;
  SELECT id INTO realestate_cat_id FROM service_categories WHERE type = 'real_estate' LIMIT 1;
  SELECT id INTO hotel_cat_id FROM service_categories WHERE type = 'hotel' LIMIT 1;
  
  -- Récupérer l'ID d'un admin
  SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;

  -- SERVICES DE TOURISME
  INSERT INTO services (partner_id, category_id, title, title_ar, description, description_ar, price, price_per, city, region, available, featured) VALUES
  (admin_id, tourism_cat_id, 'Circuit Impérial - 7 Jours', 'جولة إمبراطورية - 7 أيام', 
   'Découvrez les villes impériales du Maroc : Rabat, Meknès, Fès et Marrakech. Un voyage inoubliable à travers l''histoire et la culture marocaine.', 
   'اكتشف المدن الإمبراطورية في المغرب: الرباط ومكناس وفاس ومراكش. رحلة لا تُنسى عبر التاريخ والثقافة المغربية.',
   8500, 'personne', 'Marrakech', 'Marrakech-Safi', true, true),

  (admin_id, tourism_cat_id, 'Désert de Merzouga - 3 Jours', 'صحراء مرزوقة - 3 أيام',
   'Aventure dans le désert du Sahara avec nuit sous les étoiles dans un camp berbère. Balade à dos de chameau incluse.',
   'مغامرة في صحراء الصحراء مع ليلة تحت النجوم في مخيم بربري. جولة على ظهر الجمل مشمولة.',
   2500, 'personne', 'Merzouga', 'Drâa-Tafilalet', true, true),

  (admin_id, tourism_cat_id, 'Excursion Chefchaouen', 'رحلة شفشاون',
   'Journée complète dans la perle bleue du Maroc. Visite de la médina, shopping artisanal et déjeuner traditionnel.',
   'يوم كامل في اللؤلؤة الزرقاء للمغرب. زيارة المدينة القديمة والتسوق الحرفي والغداء التقليدي.',
   450, 'personne', 'Chefchaouen', 'Tanger-Tétouan-Al Hoceïma', true, false),

  (admin_id, tourism_cat_id, 'Vallée de l''Ourika', 'وادي أوريكا',
   'Escapade d''une journée dans la vallée de l''Ourika. Cascades, villages berbères et paysages montagneux.',
   'رحلة ليوم واحد في وادي أوريكا. شلالات وقرى بربرية ومناظر جبلية.',
   350, 'personne', 'Ourika', 'Marrakech-Safi', true, false),

  (admin_id, tourism_cat_id, 'Essaouira - Ville du Vent', 'الصويرة - مدينة الرياح',
   'Découvrez la ville côtière d''Essaouira, son port de pêche, sa médina classée UNESCO et ses plages.',
   'اكتشف مدينة الصويرة الساحلية وميناء الصيد والمدينة القديمة المصنفة من اليونسكو وشواطئها.',
   400, 'personne', 'Essaouira', 'Marrakech-Safi', true, true);

  -- VOITURES DE LOCATION
  INSERT INTO services (partner_id, category_id, title, title_ar, description, description_ar, price, price_per, city, available, featured) VALUES
  (admin_id, car_cat_id, 'Dacia Logan - Économique', 'داسيا لوغان - اقتصادية',
   'Voiture économique idéale pour la ville. Climatisation, 5 places, boîte manuelle.',
   'سيارة اقتصادية مثالية للمدينة. تكييف، 5 مقاعد، ناقل حركة يدوي.',
   250, 'jour', 'Casablanca', true, false),

  (admin_id, car_cat_id, 'Renault Clio - Compact', 'رينو كليو - مدمجة',
   'Citadine confortable et économique. Parfaite pour 2-4 personnes.',
   'سيارة مدينة مريحة واقتصادية. مثالية لـ 2-4 أشخاص.',
   300, 'jour', 'Marrakech', true, true),

  (admin_id, car_cat_id, 'Dacia Duster 4x4', 'داسيا داستر 4x4',
   'SUV 4x4 parfait pour les aventures dans le désert et la montagne. 5 places, climatisation.',
   'سيارة دفع رباعي مثالية للمغامرات في الصحراء والجبال. 5 مقاعد، تكييف.',
   550, 'jour', 'Agadir', true, true),

  (admin_id, car_cat_id, 'Mercedes Classe E - Luxe', 'مرسيدس الفئة E - فاخرة',
   'Berline de luxe avec chauffeur disponible. Confort premium pour vos déplacements.',
   'سيارة فاخرة مع سائق متاح. راحة فائقة لتنقلاتك.',
   1200, 'jour', 'Casablanca', true, false);

  -- PROPRIÉTÉS IMMOBILIÈRES
  INSERT INTO services (partner_id, category_id, title, title_ar, description, description_ar, price, price_per, city, region, available, featured) VALUES
  (admin_id, realestate_cat_id, 'Riad Traditionnel - Médina Marrakech', 'رياض تقليدي - مدينة مراكش',
   'Magnifique riad rénové dans la médina de Marrakech. 4 chambres, patio avec fontaine, terrasse panoramique.',
   'رياض رائع مجدد في مدينة مراكش. 4 غرف نوم، فناء مع نافورة، تراس بانورامي.',
   3500000, 'total', 'Marrakech', 'Marrakech-Safi', true, true),

  (admin_id, realestate_cat_id, 'Appartement Vue Mer - Agadir', 'شقة بإطلالة على البحر - أكادير',
   'Appartement moderne 3 chambres avec vue sur l''océan. Résidence sécurisée avec piscine.',
   'شقة حديثة 3 غرف نوم مع إطلالة على المحيط. إقامة آمنة مع مسبح.',
   1800000, 'total', 'Agadir', 'Souss-Massa', true, true),

  (admin_id, realestate_cat_id, 'Villa Luxe - Palmeraie', 'فيلا فاخرة - النخيل',
   'Villa de prestige dans la palmeraie. 5 chambres, piscine privée, jardin 2000m².',
   'فيلا مرموقة في النخيل. 5 غرف نوم، مسبح خاص، حديقة 2000 متر مربع.',
   8500000, 'total', 'Marrakech', 'Marrakech-Safi', true, true),

  (admin_id, realestate_cat_id, 'Studio Meublé - Casablanca Centre', 'استوديو مفروش - وسط الدار البيضاء',
   'Studio moderne meublé en centre-ville. Idéal investissement locatif.',
   'استوديو حديث مفروش في وسط المدينة. مثالي للاستثمار الإيجاري.',
   650000, 'total', 'Casablanca', 'Casablanca-Settat', true, false);

  -- HÔTELS
  INSERT INTO services (partner_id, category_id, title, title_ar, description, description_ar, price, price_per, city, available, featured) VALUES
  (admin_id, hotel_cat_id, 'Hôtel La Mamounia - 5 Étoiles', 'فندق لا مامونيا - 5 نجوم',
   'Palace légendaire au cœur de Marrakech. Spa, piscines, restaurants gastronomiques.',
   'قصر أسطوري في قلب مراكش. سبا، مسابح، مطاعم فاخرة.',
   3500, 'nuit', 'Marrakech', true, true),

  (admin_id, hotel_cat_id, 'Riad Dar Anika - Boutique Hotel', 'رياض دار أنيكا - فندق بوتيك',
   'Riad de charme dans la médina. 6 chambres, piscine, terrasse avec vue.',
   'رياض ساحر في المدينة القديمة. 6 غرف، مسبح، تراس مع إطلالة.',
   850, 'nuit', 'Fès', true, true),

  (admin_id, hotel_cat_id, 'Hôtel Sofitel Casablanca', 'فندق سوفيتيل الدار البيضاء',
   'Hôtel moderne 5 étoiles en bord de mer. Centre de conférences, spa.',
   'فندق حديث 5 نجوم على شاطئ البحر. مركز مؤتمرات، سبا.',
   1800, 'nuit', 'Casablanca', true, false),

  (admin_id, hotel_cat_id, 'Auberge Atlas - Économique', 'نزل الأطلس - اقتصادي',
   'Hébergement économique et confortable. Petit-déjeuner inclus.',
   'إقامة اقتصادية ومريحة. إفطار مشمول.',
   280, 'nuit', 'Ouarzazate', true, false);

END $$;

-- ============================================
-- METTRE À JOUR LES STATISTIQUES
-- ============================================

SELECT update_site_stats();

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT 
  'Services de tourisme' as type,
  COUNT(*) as nombre
FROM services s
JOIN service_categories sc ON s.category_id = sc.id
WHERE sc.type = 'tourism'

UNION ALL

SELECT 
  'Voitures' as type,
  COUNT(*) as nombre
FROM services s
JOIN service_categories sc ON s.category_id = sc.id
WHERE sc.type = 'car_rental'

UNION ALL

SELECT 
  'Propriétés' as type,
  COUNT(*) as nombre
FROM services s
JOIN service_categories sc ON s.category_id = sc.id
WHERE sc.type = 'real_estate'

UNION ALL

SELECT 
  'Hôtels' as type,
  COUNT(*) as nombre
FROM services s
JOIN service_categories sc ON s.category_id = sc.id
WHERE sc.type = 'hotel';

SELECT 'Données réelles insérées avec succès !' as message;
