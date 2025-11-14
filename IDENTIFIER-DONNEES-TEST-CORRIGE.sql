-- ============================================
-- SCRIPT POUR IDENTIFIER LES DONNÉES DE TEST
-- ============================================
-- Exécutez ce script dans Supabase SQL Editor
-- pour voir toutes vos données et identifier celles à supprimer
-- ============================================

-- 1. VOIR TOUS LES PROFILS (Utilisateurs, Clients, Partenaires)
-- ============================================
SELECT 
  id,
  email,
  role,
  first_name,
  last_name,
  company_name,
  phone,
  created_at,
  CASE 
    WHEN email LIKE '%test%' THEN '🔴 TEST'
    WHEN email LIKE '%demo%' THEN '🔴 TEST'
    WHEN email LIKE '%example%' THEN '🔴 TEST'
    WHEN email LIKE '%@gmail.com' AND first_name LIKE 'Test%' THEN '🔴 TEST'
    ELSE '✅ RÉEL'
  END as type_donnee
FROM profiles
ORDER BY created_at DESC;

-- 2. COMPTER LES PROFILS PAR TYPE
-- ============================================
SELECT 
  role,
  COUNT(*) as nombre,
  COUNT(CASE WHEN email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' THEN 1 END) as nombre_test,
  COUNT(CASE WHEN email NOT LIKE '%test%' AND email NOT LIKE '%demo%' AND email NOT LIKE '%example%' THEN 1 END) as nombre_reel
FROM profiles
GROUP BY role
ORDER BY role;

-- 3. VOIR TOUTES LES RÉSERVATIONS
-- ============================================
SELECT 
  b.id,
  b.status,
  b.start_date,
  b.end_date,
  b.total_price,
  p.email as client_email,
  p.first_name,
  p.last_name,
  b.created_at,
  CASE 
    WHEN p.email LIKE '%test%' THEN '🔴 TEST'
    WHEN p.email LIKE '%demo%' THEN '🔴 TEST'
    ELSE '✅ RÉEL'
  END as type_donnee
FROM bookings b
LEFT JOIN profiles p ON b.client_id = p.id
ORDER BY b.created_at DESC;

-- 4. VOIR TOUS LES PAIEMENTS
-- ============================================
SELECT 
  pay.id,
  pay.amount,
  pay.status,
  pay.payment_method,
  p.email as client_email,
  pay.created_at,
  CASE 
    WHEN p.email LIKE '%test%' THEN '🔴 TEST'
    WHEN p.email LIKE '%demo%' THEN '🔴 TEST'
    ELSE '✅ RÉEL'
  END as type_donnee
FROM payments pay
LEFT JOIN profiles p ON pay.user_id = p.id
ORDER BY pay.created_at DESC;

-- 5. VOIR TOUS LES SERVICES/PRODUITS
-- ============================================
SELECT 
  s.id,
  s.title,
  s.category,
  s.price,
  s.available,
  p.email as partner_email,
  p.company_name,
  s.created_at,
  CASE 
    WHEN s.title LIKE '%Test%' THEN '🔴 TEST'
    WHEN s.title LIKE '%Demo%' THEN '🔴 TEST'
    WHEN p.email LIKE '%test%' THEN '🔴 TEST'
    ELSE '✅ RÉEL'
  END as type_donnee
FROM services s
LEFT JOIN profiles p ON s.partner_id = p.id
ORDER BY s.created_at DESC;

-- 6. VOIR TOUS LES HÔTELS
-- ============================================
SELECT 
  h.id,
  h.name,
  h.city,
  h.stars,
  p.email as partner_email,
  h.created_at,
  CASE 
    WHEN h.name LIKE '%Test%' THEN '🔴 TEST'
    WHEN h.name LIKE '%Demo%' THEN '🔴 TEST'
    WHEN p.email LIKE '%test%' THEN '🔴 TEST'
    ELSE '✅ RÉEL'
  END as type_donnee
FROM hotels h
LEFT JOIN profiles p ON h.partner_id = p.id
ORDER BY h.created_at DESC;

-- 7. VOIR TOUTES LES VOITURES
-- ============================================
SELECT 
  v.id,
  v.brand,
  v.model,
  v.year,
  v.price_per_day,
  p.email as partner_email,
  v.created_at,
  CASE 
    WHEN v.brand LIKE '%Test%' THEN '🔴 TEST'
    WHEN p.email LIKE '%test%' THEN '🔴 TEST'
    ELSE '✅ RÉEL'
  END as type_donnee
FROM locations_voitures v
LEFT JOIN profiles p ON v.partner_id = p.id
ORDER BY v.created_at DESC;

-- 8. VOIR TOUS LES CIRCUITS
-- ============================================
SELECT 
  c.id,
  c.title,
  c.duration,
  c.price,
  p.email as partner_email,
  c.created_at,
  CASE 
    WHEN c.title LIKE '%Test%' THEN '🔴 TEST'
    WHEN c.title LIKE '%Demo%' THEN '🔴 TEST'
    WHEN p.email LIKE '%test%' THEN '🔴 TEST'
    ELSE '✅ RÉEL'
  END as type_donnee
FROM circuits_touristiques c
LEFT JOIN profiles p ON c.partner_id = p.id
ORDER BY c.created_at DESC;

-- 9. VOIR TOUTES LES ACTIVITÉS
-- ============================================
SELECT 
  a.id,
  a.title,
  a.category,
  a.price,
  p.email as partner_email,
  a.created_at,
  CASE 
    WHEN a.title LIKE '%Test%' THEN '🔴 TEST'
    WHEN a.title LIKE '%Demo%' THEN '🔴 TEST'
    WHEN p.email LIKE '%test%' THEN '🔴 TEST'
    ELSE '✅ RÉEL'
  END as type_donnee
FROM activites_touristiques a
LEFT JOIN profiles p ON a.partner_id = p.id
ORDER BY a.created_at DESC;

-- 10. VOIR TOUS LES ÉVÉNEMENTS
-- ============================================
SELECT 
  e.id,
  e.title,
  e.event_date,
  e.location,
  p.email as partner_email,
  e.created_at,
  CASE 
    WHEN e.title LIKE '%Test%' THEN '🔴 TEST'
    WHEN e.title LIKE '%Demo%' THEN '🔴 TEST'
    WHEN p.email LIKE '%test%' THEN '🔴 TEST'
    ELSE '✅ RÉEL'
  END as type_donnee
FROM evenements e
LEFT JOIN profiles p ON e.partner_id = p.id
ORDER BY e.created_at DESC;

-- 11. VOIR TOUTES LES ANNONCES
-- ============================================
SELECT 
  an.id,
  an.title,
  an.category,
  an.price,
  p.email as partner_email,
  an.created_at,
  CASE 
    WHEN an.title LIKE '%Test%' THEN '🔴 TEST'
    WHEN an.title LIKE '%Demo%' THEN '🔴 TEST'
    WHEN p.email LIKE '%test%' THEN '🔴 TEST'
    ELSE '✅ RÉEL'
  END as type_donnee
FROM annonces an
LEFT JOIN profiles p ON an.partner_id = p.id
ORDER BY an.created_at DESC;

-- ============================================
-- RÉSUMÉ GLOBAL
-- ============================================
SELECT 
  'PROFILS' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' THEN 1 END) as test_count,
  COUNT(CASE WHEN email NOT LIKE '%test%' AND email NOT LIKE '%demo%' AND email NOT LIKE '%example%' THEN 1 END) as real_count
FROM profiles

UNION ALL

SELECT 
  'RÉSERVATIONS' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN p.email LIKE '%test%' OR p.email LIKE '%demo%' THEN 1 END) as test_count,
  COUNT(CASE WHEN p.email NOT LIKE '%test%' AND p.email NOT LIKE '%demo%' THEN 1 END) as real_count
FROM bookings b
LEFT JOIN profiles p ON b.client_id = p.id

UNION ALL

SELECT 
  'PAIEMENTS' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN p.email LIKE '%test%' OR p.email LIKE '%demo%' THEN 1 END) as test_count,
  COUNT(CASE WHEN p.email NOT LIKE '%test%' AND p.email NOT LIKE '%demo%' THEN 1 END) as real_count
FROM payments pay
LEFT JOIN profiles p ON pay.user_id = p.id

UNION ALL

SELECT 
  'SERVICES' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN s.title LIKE '%Test%' OR s.title LIKE '%Demo%' OR p.email LIKE '%test%' THEN 1 END) as test_count,
  COUNT(CASE WHEN s.title NOT LIKE '%Test%' AND s.title NOT LIKE '%Demo%' AND (p.email IS NULL OR p.email NOT LIKE '%test%') THEN 1 END) as real_count
FROM services s
LEFT JOIN profiles p ON s.partner_id = p.id

UNION ALL

SELECT 
  'HÔTELS' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN h.name LIKE '%Test%' OR h.name LIKE '%Demo%' OR p.email LIKE '%test%' THEN 1 END) as test_count,
  COUNT(CASE WHEN h.name NOT LIKE '%Test%' AND h.name NOT LIKE '%Demo%' AND (p.email IS NULL OR p.email NOT LIKE '%test%') THEN 1 END) as real_count
FROM hotels h
LEFT JOIN profiles p ON h.partner_id = p.id

UNION ALL

SELECT 
  'VOITURES' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN v.brand LIKE '%Test%' OR p.email LIKE '%test%' THEN 1 END) as test_count,
  COUNT(CASE WHEN v.brand NOT LIKE '%Test%' AND (p.email IS NULL OR p.email NOT LIKE '%test%') THEN 1 END) as real_count
FROM locations_voitures v
LEFT JOIN profiles p ON v.partner_id = p.id

UNION ALL

SELECT 
  'CIRCUITS' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN c.title LIKE '%Test%' OR c.title LIKE '%Demo%' OR p.email LIKE '%test%' THEN 1 END) as test_count,
  COUNT(CASE WHEN c.title NOT LIKE '%Test%' AND c.title NOT LIKE '%Demo%' AND (p.email IS NULL OR p.email NOT LIKE '%test%') THEN 1 END) as real_count
FROM circuits_touristiques c
LEFT JOIN profiles p ON c.partner_id = p.id

UNION ALL

SELECT 
  'ACTIVITÉS' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN a.title LIKE '%Test%' OR a.title LIKE '%Demo%' OR p.email LIKE '%test%' THEN 1 END) as test_count,
  COUNT(CASE WHEN a.title NOT LIKE '%Test%' AND a.title NOT LIKE '%Demo%' AND (p.email IS NULL OR p.email NOT LIKE '%test%') THEN 1 END) as real_count
FROM activites_touristiques a
LEFT JOIN profiles p ON a.partner_id = p.id

UNION ALL

SELECT 
  'ÉVÉNEMENTS' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN e.title LIKE '%Test%' OR e.title LIKE '%Demo%' OR p.email LIKE '%test%' THEN 1 END) as test_count,
  COUNT(CASE WHEN e.title NOT LIKE '%Test%' AND e.title NOT LIKE '%Demo%' AND (p.email IS NULL OR p.email NOT LIKE '%test%') THEN 1 END) as real_count
FROM evenements e
LEFT JOIN profiles p ON e.partner_id = p.id

UNION ALL

SELECT 
  'ANNONCES' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN an.title LIKE '%Test%' OR an.title LIKE '%Demo%' OR p.email LIKE '%test%' THEN 1 END) as test_count,
  COUNT(CASE WHEN an.title NOT LIKE '%Test%' AND an.title NOT LIKE '%Demo%' AND (p.email IS NULL OR p.email NOT LIKE '%test%') THEN 1 END) as real_count
FROM annonces an
LEFT JOIN profiles p ON an.partner_id = p.id

ORDER BY table_name;
