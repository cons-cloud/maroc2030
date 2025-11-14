-- ============================================
-- VÉRIFIER LA STRUCTURE DE LA TABLE BOOKINGS
-- ============================================

-- Voir toutes les colonnes de la table bookings
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- Voir un exemple de données
SELECT * FROM bookings LIMIT 1;

-- Liste des colonnes attendues vs réelles
SELECT 
  'check_in_date' as colonne_attendue,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'check_in_date')
    THEN 'check_in_date'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'start_date')
    THEN 'start_date'
    ELSE '❌ MANQUANTE'
  END as colonne_reelle
UNION ALL
SELECT 
  'check_out_date' as colonne_attendue,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'check_out_date')
    THEN 'check_out_date'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'end_date')
    THEN 'end_date'
    ELSE '❌ MANQUANTE'
  END as colonne_reelle
UNION ALL
SELECT 
  'number_of_guests' as colonne_attendue,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'number_of_guests')
    THEN 'number_of_guests'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'number_of_people')
    THEN 'number_of_people'
    ELSE '❌ MANQUANTE'
  END as colonne_reelle
UNION ALL
SELECT 
  'status' as colonne_attendue,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'status')
    THEN 'status'
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_status')
    THEN 'booking_status'
    ELSE '❌ MANQUANTE'
  END as colonne_reelle;

-- Vérifier si les colonnes nécessaires existent
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'check_in_date'
  ) THEN '✅ check_in_date existe' 
  ELSE '❌ check_in_date manquante' 
  END as check_in_date_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'check_out_date'
  ) THEN '✅ check_out_date existe' 
  ELSE '❌ check_out_date manquante' 
  END as check_out_date_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'number_of_guests'
  ) THEN '✅ number_of_guests existe' 
  ELSE '❌ number_of_guests manquante' 
  END as number_of_guests_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'partner_id'
  ) THEN '✅ partner_id existe' 
  ELSE '❌ partner_id manquante (à ajouter)' 
  END as partner_id_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'total_amount'
  ) THEN '✅ total_amount existe' 
  ELSE '❌ total_amount manquante (à ajouter)' 
  END as total_amount_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'commission_amount'
  ) THEN '✅ commission_amount existe' 
  ELSE '❌ commission_amount manquante (à ajouter)' 
  END as commission_amount_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'partner_amount'
  ) THEN '✅ partner_amount existe' 
  ELSE '❌ partner_amount manquante (à ajouter)' 
  END as partner_amount_status;
