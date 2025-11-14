-- ============================================
-- SCRIPT DE VÉRIFICATION DE LA CONFIGURATION
-- Maroc 2030
-- ============================================

-- Exécutez ce script dans Supabase SQL Editor pour vérifier
-- que tout est correctement configuré

-- ============================================
-- 1. VÉRIFIER QUE TOUTES LES TABLES EXISTENT
-- ============================================

SELECT 
    'Tables créées' as verification,
    COUNT(*) as nombre_tables,
    CASE 
        WHEN COUNT(*) >= 16 THEN '✅ OK'
        ELSE '❌ ERREUR - Manque des tables'
    END as statut
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
    'profiles', 'partners', 'tourism_packages', 'events', 
    'cars', 'properties', 'hotel_rooms',
    'tourism_bookings', 'car_bookings', 'property_bookings', 'event_bookings',
    'payments', 'announcements', 'contact_messages', 'reviews', 'admin_logs'
);

-- ============================================
-- 2. VÉRIFIER LES COMPTES ADMIN
-- ============================================

SELECT 
    'Comptes Admin' as verification,
    COUNT(*) as nombre_admins,
    CASE 
        WHEN COUNT(*) >= 2 THEN '✅ OK - 2 comptes admin trouvés'
        WHEN COUNT(*) = 1 THEN '⚠️ ATTENTION - 1 seul compte admin'
        ELSE '❌ ERREUR - Aucun compte admin'
    END as statut
FROM profiles
WHERE role = 'admin';

-- Détails des comptes admin
SELECT 
    'Détails Admin' as info,
    email,
    role,
    first_name,
    last_name,
    is_active,
    created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at;

-- ============================================
-- 3. VÉRIFIER LES TYPES ENUM
-- ============================================

SELECT 
    'Types ENUM' as verification,
    COUNT(DISTINCT typname) as nombre_types,
    CASE 
        WHEN COUNT(DISTINCT typname) >= 4 THEN '✅ OK'
        ELSE '❌ ERREUR - Manque des types ENUM'
    END as statut
FROM pg_type
WHERE typname IN ('user_role', 'partner_type', 'booking_status', 'payment_status');

-- ============================================
-- 4. VÉRIFIER LES INDEXES
-- ============================================

SELECT 
    'Indexes' as verification,
    COUNT(*) as nombre_indexes,
    CASE 
        WHEN COUNT(*) >= 20 THEN '✅ OK'
        ELSE '⚠️ ATTENTION - Peu d''indexes'
    END as statut
FROM pg_indexes
WHERE schemaname = 'public';

-- ============================================
-- 5. VÉRIFIER LES TRIGGERS
-- ============================================

SELECT 
    'Triggers' as verification,
    COUNT(*) as nombre_triggers,
    CASE 
        WHEN COUNT(*) >= 10 THEN '✅ OK'
        ELSE '⚠️ ATTENTION - Peu de triggers'
    END as statut
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- ============================================
-- 6. VÉRIFIER RLS (Row Level Security)
-- ============================================

SELECT 
    'RLS activé' as verification,
    COUNT(*) as tables_avec_rls,
    CASE 
        WHEN COUNT(*) >= 16 THEN '✅ OK - RLS activé sur toutes les tables'
        ELSE '❌ ERREUR - RLS non activé partout'
    END as statut
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

-- ============================================
-- 7. VÉRIFIER LES POLITIQUES RLS
-- ============================================

SELECT 
    'Politiques RLS' as verification,
    COUNT(*) as nombre_politiques,
    CASE 
        WHEN COUNT(*) >= 20 THEN '✅ OK'
        ELSE '⚠️ ATTENTION - Peu de politiques'
    END as statut
FROM pg_policies
WHERE schemaname = 'public';

-- ============================================
-- 8. STATISTIQUES GÉNÉRALES
-- ============================================

-- Nombre d'utilisateurs par rôle
SELECT 
    'Utilisateurs par rôle' as info,
    role,
    COUNT(*) as nombre
FROM profiles
GROUP BY role
ORDER BY role;

-- Nombre de partenaires par type
SELECT 
    'Partenaires par type' as info,
    partner_type,
    COUNT(*) as nombre
FROM partners
GROUP BY partner_type
ORDER BY partner_type;

-- Nombre de services
SELECT 
    'Services disponibles' as info,
    'Circuits touristiques' as type,
    COUNT(*) as nombre
FROM tourism_packages
UNION ALL
SELECT 
    'Services disponibles' as info,
    'Voitures' as type,
    COUNT(*) as nombre
FROM cars
UNION ALL
SELECT 
    'Services disponibles' as info,
    'Propriétés' as type,
    COUNT(*) as nombre
FROM properties
UNION ALL
SELECT 
    'Services disponibles' as info,
    'Événements' as type,
    COUNT(*) as nombre
FROM events;

-- ============================================
-- 9. VÉRIFIER LES EMAILS ADMIN SPÉCIFIQUES
-- ============================================

SELECT 
    'Vérification emails admin' as verification,
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles WHERE email = 'maroc2031@gmail.com' AND role = 'admin') 
         AND EXISTS (SELECT 1 FROM profiles WHERE email = 'maroc2032@gmail.com' AND role = 'admin')
        THEN '✅ OK - Les 2 comptes admin sont configurés'
        WHEN EXISTS (SELECT 1 FROM profiles WHERE email = 'maroc2031@gmail.com' AND role = 'admin')
        THEN '⚠️ ATTENTION - Seul maroc2031@gmail.com est admin'
        WHEN EXISTS (SELECT 1 FROM profiles WHERE email = 'maroc2032@gmail.com' AND role = 'admin')
        THEN '⚠️ ATTENTION - Seul maroc2032@gmail.com est admin'
        ELSE '❌ ERREUR - Aucun des 2 comptes admin n''est configuré'
    END as statut;

-- ============================================
-- 10. RÉSUMÉ FINAL
-- ============================================

SELECT 
    '===================' as separateur,
    'RÉSUMÉ DE LA CONFIGURATION' as titre,
    '===================' as separateur2;

-- Afficher un résumé complet
SELECT 
    'Configuration' as categorie,
    'Base de données' as element,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') >= 16
        THEN '✅ Complète'
        ELSE '❌ Incomplète'
    END as statut
UNION ALL
SELECT 
    'Configuration' as categorie,
    'Comptes Admin' as element,
    CASE 
        WHEN (SELECT COUNT(*) FROM profiles WHERE role = 'admin') >= 2
        THEN '✅ Configurés'
        ELSE '❌ À configurer'
    END as statut
UNION ALL
SELECT 
    'Configuration' as categorie,
    'RLS' as element,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) >= 16
        THEN '✅ Activé'
        ELSE '❌ Non activé'
    END as statut
UNION ALL
SELECT 
    'Configuration' as categorie,
    'Politiques' as element,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 20
        THEN '✅ Configurées'
        ELSE '⚠️ Partielles'
    END as statut;

-- ============================================
-- INSTRUCTIONS
-- ============================================

-- Si vous voyez des ❌ ou ⚠️ :
-- 1. Vérifiez que vous avez bien exécuté supabase-schema.sql
-- 2. Vérifiez que vous avez créé les comptes admin
-- 3. Vérifiez que vous avez mis à jour les rôles avec create-admin-accounts.sql

-- Si tout est ✅ :
-- Félicitations ! Votre base de données est correctement configurée.
-- Vous pouvez maintenant lancer l'application avec : npm run dev

-- ============================================
-- FIN DU SCRIPT DE VÉRIFICATION
-- ============================================
