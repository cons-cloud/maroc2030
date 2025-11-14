-- ============================================
-- AJOUTER DES IMAGES RÉELLES AUX SERVICES
-- ============================================

-- Ce script ajoute des URLs d'images Unsplash aux services existants

-- SERVICES DE TOURISME
UPDATE services
SET images = ARRAY[
  'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800',
  'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800',
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=800'
]
WHERE title = 'Circuit Impérial - 7 Jours';

UPDATE services
SET images = ARRAY[
  'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
  'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800',
  'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800'
]
WHERE title = 'Désert de Merzouga - 3 Jours';

UPDATE services
SET images = ARRAY[
  'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=800'
]
WHERE title = 'Excursion Chefchaouen';

UPDATE services
SET images = ARRAY[
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
]
WHERE title = 'Vallée de l''Ourika';

UPDATE services
SET images = ARRAY[
  'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?w=800',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
]
WHERE title = 'Essaouira - Ville du Vent';

-- VOITURES DE LOCATION
UPDATE services
SET images = ARRAY[
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'
]
WHERE title = 'Dacia Logan - Économique';

UPDATE services
SET images = ARRAY[
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'
]
WHERE title = 'Renault Clio - Compact';

UPDATE services
SET images = ARRAY[
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'
]
WHERE title = 'Dacia Duster 4x4';

UPDATE services
SET images = ARRAY[
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
  'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800'
]
WHERE title = 'Mercedes Classe E - Luxe';

-- PROPRIÉTÉS IMMOBILIÈRES
UPDATE services
SET images = ARRAY[
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
]
WHERE title = 'Riad Traditionnel - Médina Marrakech';

UPDATE services
SET images = ARRAY[
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'
]
WHERE title = 'Appartement Vue Mer - Agadir';

UPDATE services
SET images = ARRAY[
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
]
WHERE title = 'Villa Luxe - Palmeraie';

UPDATE services
SET images = ARRAY[
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
]
WHERE title = 'Studio Meublé - Casablanca Centre';

-- HÔTELS
UPDATE services
SET images = ARRAY[
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'
]
WHERE title = 'Hôtel La Mamounia - 5 Étoiles';

UPDATE services
SET images = ARRAY[
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'
]
WHERE title = 'Riad Dar Anika - Boutique Hotel';

UPDATE services
SET images = ARRAY[
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'
]
WHERE title = 'Hôtel Sofitel Casablanca';

UPDATE services
SET images = ARRAY[
  'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'
]
WHERE title = 'Auberge Atlas - Économique';

-- Mettre à jour les images du Hero dans site_content
UPDATE site_content
SET value = 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1920',
    value_ar = 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1920'
WHERE section = 'hero' AND key = 'image';

-- Vérification
SELECT 
  title,
  array_length(images, 1) as nombre_images,
  images[1] as premiere_image
FROM services
ORDER BY created_at;

SELECT 'Images ajoutées avec succès à tous les services !' as message;
