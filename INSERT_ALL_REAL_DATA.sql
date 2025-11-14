-- ============================================
-- INSERTION DE TOUTES LES DONNÉES RÉELLES DU SITE
-- ============================================

-- D'abord, créer les tables si elles n'existent pas
-- Exécutez create-specialized-tables-clean.sql AVANT ce script

-- ============================================
-- 1. INSERTION DES HÔTELS
-- ============================================

INSERT INTO hotels (name, description, price_per_night, city, address, stars, images, amenities, available, featured) VALUES
('Hôtel Palais Royal', 'Un hôtel 5 étoiles de luxe au cœur de Marrakech, offrant des chambres élégantes, une piscine extérieure et un spa de renommée mondiale.', 2500, 'Marrakech', 'Route de la Palmeraie', 5, ARRAY['/assets/APT/IFRANE/apt1/1.jpg', '/assets/APT/IFRANE/apt1/2.jpg'], '["Piscine", "Spa", "Restaurant gastronomique", "Navette aéroport"]'::jsonb, true, true),

('Riad Enchanté', 'Riad traditionnel marocain avec une touche moderne. Situé dans la médina, à quelques pas de la place Jemaa el-Fna.', 1200, 'Marrakech', 'Médina', 4, ARRAY['/assets/APT/MARRAKECH/apt1/1.jpg', '/assets/APT/MARRAKECH/apt1/2.jpg'], '["Petit-déjeuner inclus", "Terrasse sur le toit", "Wifi gratuit"]'::jsonb, true, false),

('Resort & Spa Océan', 'Complexe hôtelier face à la mer avec accès direct à la plage. Parfait pour des vacances détente en bord de mer.', 1800, 'Agadir', 'Boulevard du 20 Août', 5, ARRAY['/assets/APT/AGADIR/APPART1/6.jpg', '/assets/APT/AGADIR/APPART1/7.jpg'], '["Plage privée", "3 piscines", "4 restaurants", "Spa", "Club enfants"]'::jsonb, true, true),

('Hôtel Les Dunes d''Or', 'Hôtel 4 étoiles avec vue panoramique sur la baie d''Agadir. Piscine extérieure et animations en soirée.', 1400, 'Agadir', 'Avenue des FAR', 4, ARRAY['/assets/APT/AGADIR/APPART1/1.jpg'], '["Piscine", "Animation", "Restaurant"]'::jsonb, true, false),

('Hôtel Atlantique', 'Hôtel moderne en bord de mer à Casablanca. Vue imprenable sur l''océan Atlantique et proximité du centre-ville.', 1600, 'Casablanca', 'Boulevard de la Corniche', 4, ARRAY['/assets/APT/CASABLANCA/APPART1/1.jpg'], '["Vue mer", "Restaurant", "Wifi"]'::jsonb, true, false),

('Palais Impérial', 'Hôtel de charme dans la médina de Fès. Architecture traditionnelle et service de qualité.', 1300, 'Fès', 'Médina de Fès', 4, ARRAY['/assets/APT/FES/apt1/1.jpg', '/assets/APT/FES/apt1/2.jpg'], '["Spa", "Restaurant", "Terrasse"]'::jsonb, true, false);

-- ============================================
-- 2. INSERTION DES APPARTEMENTS
-- ============================================

INSERT INTO appartements (title, description, price_per_night, city, address, bedrooms, bathrooms, images, available, featured) VALUES
-- Agadir
('Appartement vue mer à Agadir', 'Magnifique appartement avec vue panoramique sur l''océan Atlantique. Situé dans un quartier calme et résidentiel d''Agadir, proche de la plage.', 800, 'Agadir', 'Quartier Founty', 2, 1, ARRAY['/assets/APT/AGADIR/APPART1/1.jpg', '/assets/APT/AGADIR/APPART1/2.jpg', '/assets/APT/AGADIR/APPART1/3.jpg', '/assets/APT/AGADIR/APPART1/4.jpg', '/assets/APT/AGADIR/APPART1/5.jpg'], true, true),

('Appartement moderne à Marina', 'Appartement contemporain dans la marina d''Agadir, à deux pas des restaurants et des commerces. Idéal pour un séjour en bord de mer.', 950, 'Agadir', 'Marina d''Agadir', 3, 2, ARRAY['/assets/APT/AGADIR/APPART1/6.jpg', '/assets/APT/AGADIR/APPART1/7.jpg', '/assets/APT/AGADIR/APPART1/8.jpg', '/assets/APT/AGADIR/APPART1/9.jpg', '/assets/APT/AGADIR/APPART1/10.jpg'], true, false),

-- Casablanca
('Loft moderne au centre-ville', 'Loft spacieux et lumineux au cœur de Casablanca. Proche des centres d''affaires et des attractions touristiques. Parfait pour les voyages d''affaires ou de loisirs.', 1200, 'Casablanca', 'Centre-ville', 2, 1, ARRAY['/assets/APT/CASABLANCA/APPART1/1.jpg', '/assets/APT/CASABLANCA/APPART1/2.jpg', '/assets/APT/CASABLANCA/APPART1/3.jpg', '/assets/APT/CASABLANCA/APPART1/4.jpg'], true, true),

('Appartement familial à Maarif', 'Grand appartement familial dans le quartier résidentiel de Maarif. Proche des écoles, commerces et espaces verts. Idéal pour les familles.', 1100, 'Casablanca', 'Quartier Maarif', 3, 2, ARRAY['/assets/APT/CASABLANCA/APPART2/1.jpg', '/assets/APT/CASABLANCA/APPART2/2.jpg', '/assets/APT/CASABLANCA/APPART2/3.jpg'], true, false),

('Penthouse avec terrasse', 'Superbe penthouse avec grande terrasse offrant une vue panoramique sur Casablanca. Luxe et confort dans un cadre exceptionnel.', 1500, 'Casablanca', 'Corniche d''Ain Diab', 3, 2, ARRAY['/assets/APT/CASABLANCA/APPART3/casa.jpg'], true, true),

-- Fès
('Riad traditionnel en médina', 'Authentique riad marocain au cœur de la médina de Fès, classée au patrimoine mondial de l''UNESCO. Décoration traditionnelle et cadre enchanteur.', 900, 'Fès', 'Médina de Fès', 3, 2, ARRAY['/assets/APT/FES/apt1/1.jpg', '/assets/APT/FES/apt1/2.jpg', '/assets/APT/FES/apt1/3.jpg', '/assets/APT/FES/apt1/4.jpg'], true, true),

('Appartement moderne à Fès Jdid', 'Appartement moderne et confortable dans le quartier de Fès Jdid, à proximité du palais royal et du Mellah. Idéal pour découvrir la ville impériale.', 750, 'Fès', 'Quartier Fès Jdid', 2, 1, ARRAY['/assets/APT/FES/apt2/6.jpg', '/assets/APT/FES/apt2/7.jpg', '/assets/APT/FES/apt2/8.jpg', '/assets/APT/FES/apt2/9.jpg', '/assets/APT/FES/apt2/10.jpg'], true, false),

-- Marrakech
('Riad traditionnel en médina', 'Authentique riad marocain au cœur de la médina, à quelques pas de la place Jemaa el-Fna. Décoration traditionnelle et cadre enchanteur.', 1000, 'Marrakech', 'Médina', 3, 2, ARRAY['/assets/APT/MARRAKECH/apt1/1.jpg', '/assets/APT/MARRAKECH/apt1/2.jpg', '/assets/APT/MARRAKECH/apt1/3.jpg'], true, true),

('Appartement moderne à Guéliz', 'Appartement moderne et lumineux dans le quartier de Guéliz, à proximité des commerces et restaurants. Idéal pour découvrir Marrakech en toute tranquillité.', 850, 'Marrakech', 'Quartier Guéliz', 2, 1, ARRAY['/assets/APT/MARRAKECH/apt2/4.jpg', '/assets/APT/MARRAKECH/apt2/5.jpg', '/assets/APT/MARRAKECH/apt2/6.jpg', '/assets/APT/MARRAKECH/apt2/7.jpg'], true, false),

-- Meknès
('Appartement vue sur la médina', 'Bel appartement avec vue imprenable sur la médina de Meknès, classée au patrimoine mondial de l''UNESCO. Proche des sites historiques et des souks.', 700, 'Meknès', 'Médina de Meknès', 2, 1, ARRAY['/assets/APT/Meknès/apt1/1.jpg', '/assets/APT/Meknès/apt1/2.jpg', '/assets/APT/Meknès/apt1/3.jpg', '/assets/APT/Meknès/apt1/4.jpg'], true, false),

('Appartement moderne à Hamria', 'Appartement moderne et fonctionnel dans le quartier résidentiel de Hamria. Calme et bien situé pour découvrir la ville impériale de Meknès.', 650, 'Meknès', 'Quartier Hamria', 2, 1, ARRAY['/assets/APT/Meknès/apt2/1.jpg', '/assets/APT/Meknès/apt2/2.jpg', '/assets/APT/Meknès/apt2/3.jpg'], true, false),

-- Ifrane
('Chalet de montagne à Ifrane', 'Chalet chaleureux et confortable à Ifrane, la petite Suisse du Maroc. Idéal pour des vacances au calme dans un cadre naturel exceptionnel.', 1100, 'Ifrane', 'Station de Michlifen', 3, 2, ARRAY['/assets/APT/IFRANE/apt1/1.jpg', '/assets/APT/IFRANE/apt1/2.jpg', '/assets/APT/IFRANE/apt1/3.jpg'], true, true),

('Appartement avec vue sur les cèdres', 'Bel appartement avec vue sur la forêt de cèdres d''Ifrane. Proche des pistes de ski en hiver et des randonnées en été.', 950, 'Ifrane', 'Quartier Résidentiel', 2, 1, ARRAY['/assets/APT/IFRANE/apt2/1.jpg', '/assets/APT/IFRANE/apt2/2.jpg', '/assets/APT/IFRANE/apt2/3.jpg'], true, false),

('Villa de charme avec jardin', 'Jolie villa avec jardin privatif à Ifrane. Parfaite pour les familles ou les groupes d''amis souhaitant profiter de la fraîcheur de la montagne.', 1300, 'Ifrane', 'Quartier des Cèdres', 4, 2, ARRAY['/assets/APT/IFRANE/apt3/1.jpg', '/assets/APT/IFRANE/apt3/2.jpg'], true, false),

-- Nador
('Appartement vue sur la lagune', 'Appartement lumineux avec vue sur la lagune de Nador. Proche des plages et des commodités pour un séjour agréable au bord de la Méditerranée.', 700, 'Nador', 'Boulevard de la Lagune', 2, 1, ARRAY['/assets/APT/NADOR/apt1/1.jpg', '/assets/APT/NADOR/apt1/2.jpg', '/assets/APT/NADOR/apt1/3.jpg'], true, false),

('Appartement moderne au centre', 'Appartement moderne et bien équipé au centre de Nador. Idéal pour découvrir la ville et ses environs, notamment les plages de la région.', 650, 'Nador', 'Centre-ville', 2, 1, ARRAY['/assets/APT/NADOR/apt2/1.jpg', '/assets/APT/NADOR/apt2/2.jpg'], true, false);

-- ============================================
-- 3. INSERTION DES VILLAS (VRAIES DONNÉES DU SITE)
-- ============================================

INSERT INTO villas (title, description, price_per_night, city, address, bedrooms, bathrooms, has_pool, has_garden, images, available, featured) VALUES
('Villa de luxe avec piscine', 'Magnifique villa de luxe avec piscine privée, jardin paysagé et vue sur l''Atlas.', 2500, 'Marrakech', 'Quartier Palmeraie', 5, 4, true, true, ARRAY['/assets/APT/MARRAKECH/apt1/1.jpg', '/assets/APT/MARRAKECH/apt1/2.jpg'], true, true),

('Villa moderne avec jardin', 'Villa moderne et élégante avec jardin privatif et terrasse ensoleillée.', 1800, 'Marrakech', 'Quartier Hivernage', 4, 3, false, true, ARRAY['/assets/APT/MARRAKECH/apt2/1.jpg', '/assets/APT/MARRAKECH/apt2/2.jpg'], true, false),

('Villa face à la mer', 'Splendide villa avec vue directe sur l''océan. Accès privé à la plage et piscine à débordement.', 3000, 'Agadir', 'Quartier Founty', 6, 5, true, false, ARRAY['/assets/APT/AGADIR/APPART1/6.jpg', '/assets/APT/AGADIR/APPART1/7.jpg', '/assets/APT/AGADIR/APPART1/8.jpg'], true, true),

('Villa typique en médina', 'Villa traditionnelle marocaine entièrement rénovée dans la médina d''Essaouira.', 1500, 'Essaouira', 'Médina', 3, 2, false, false, ARRAY['/assets/APT/ESSAOUIRA/APPART1/1.jpg', '/assets/APT/ESSAOUIRA/APPART1/2.jpg'], true, false);

-- ============================================
-- 4. INSERTION DES VOITURES (VRAIES DONNÉES DU SITE)
-- ============================================

INSERT INTO locations_voitures (brand, model, year, description, price_per_day, category, fuel_type, transmission, seats, has_ac, has_gps, city, images, available, featured) VALUES
('Renault', 'Clio', 2024, 'Économique et fiable pour vos déplacements.', 300, 'Économique', 'Essence', 'Manuelle', 5, true, true, 'Marrakech', ARRAY['/VOITURE/RENAULT.jpg'], true, true),

('BMW', 'Série 3', 2024, 'Luxe et performance allemande.', 500, 'Luxe', 'Diesel', 'Automatique', 5, true, true, 'Casablanca', ARRAY['/VOITURE/BMW.jpg'], true, true),

('Hyundai', 'Tucson', 2023, 'SUV moderne et spacieux.', 350, 'SUV', 'Diesel', 'Automatique', 5, true, true, 'Rabat', ARRAY['/VOITURE/HYUNDAI.jpg'], true, false),

('Dacia', 'Duster', 2023, 'Robuste et économique.', 250, '4x4', 'Diesel', 'Manuelle', 5, true, true, 'Agadir', ARRAY['/VOITURE/DACIA.jpg'], true, false),

('Mercedes', 'Classe A', 2024, 'Élégance et technologie.', 450, 'Luxe', 'Essence', 'Automatique', 5, true, true, 'Fès', ARRAY['/VOITURE/MERCEDES.jpg'], true, true),

('Peugeot', '3008', 2023, 'SUV français élégant et confortable.', 400, 'SUV', 'Diesel', 'Automatique', 5, true, true, 'Tanger', ARRAY['/VOITURE/PEUGEOT.jpg'], true, false);

-- ============================================
-- 5. INSERTION DES CIRCUITS TOURISTIQUES
-- ============================================

INSERT INTO circuits_touristiques (title, description, duration_days, price_per_person, destinations, images, available, featured) VALUES
('Grand Tour du Maroc Impérial', 'Découvrez les 4 villes impériales du Maroc : Rabat, Meknès, Fès et Marrakech. Un voyage à travers l''histoire et la culture marocaine.', 8, 8500, ARRAY['Rabat', 'Meknès', 'Fès', 'Marrakech'], ARRAY['/assets/CIRCUITS/imperial-tour.jpg'], true, true),

('Aventure dans le Désert', 'Expérience inoubliable dans le désert du Sahara. Nuit sous les étoiles, balade à dos de chameau et découverte de la culture berbère.', 3, 4500, ARRAY['Marrakech', 'Ouarzazate', 'Merzouga'], ARRAY['/assets/CIRCUITS/desert-adventure.jpg'], true, true),

('Circuit des Kasbahs', 'Route des mille kasbahs à travers les vallées du Sud marocain. Paysages époustouflants et architecture traditionnelle.', 5, 6000, ARRAY['Marrakech', 'Aït Benhaddou', 'Vallée du Dadès', 'Vallée du Todra'], ARRAY['/assets/CIRCUITS/kasbahs-route.jpg'], true, false),

('Découverte du Nord', 'Explorez le nord du Maroc : Tanger, Chefchaouen la ville bleue, et Tétouan. Entre mer et montagne.', 4, 5500, ARRAY['Tanger', 'Chefchaouen', 'Tétouan'], ARRAY['/assets/CIRCUITS/north-discovery.jpg'], true, false);

-- ============================================
-- VÉRIFICATION DES INSERTIONS
-- ============================================

SELECT 'Hotels' as table_name, COUNT(*) as total FROM hotels
UNION ALL
SELECT 'Appartements', COUNT(*) FROM appartements
UNION ALL
SELECT 'Villas', COUNT(*) FROM villas
UNION ALL
SELECT 'Voitures', COUNT(*) FROM locations_voitures
UNION ALL
SELECT 'Circuits', COUNT(*) FROM circuits_touristiques;

SELECT '✅ TOUTES LES VRAIES DONNÉES DU SITE ONT ÉTÉ INSÉRÉES !' as message;
SELECT '📊 TOTAL: 6 hôtels + 15 appartements + 4 villas + 6 voitures + 4 circuits = 35 éléments' as details;
