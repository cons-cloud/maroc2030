-- ============================================
-- POLITIQUES DE SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- Maroc 2030 - À exécuter dans Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ACTIVER RLS SUR TOUTES LES TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE appartements ENABLE ROW LEVEL SECURITY;
ALTER TABLE villas ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations_voitures ENABLE ROW LEVEL SECURITY;
ALTER TABLE circuits_touristiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE circuit_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides_touristiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE activites_touristiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;
ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE immobilier ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. POLITIQUES POUR LA TABLE PROFILES
-- ============================================

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Les admins peuvent voir tous les profils
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Les admins peuvent mettre à jour tous les profils
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Les admins peuvent supprimer des profils
CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- 3. POLITIQUES POUR LA TABLE BOOKINGS
-- ============================================

-- Les utilisateurs peuvent voir leurs propres réservations
CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leurs propres réservations
CREATE POLICY "Users can create own bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent annuler leurs propres réservations
CREATE POLICY "Users can update own bookings"
ON bookings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les admins peuvent voir toutes les réservations
CREATE POLICY "Admins can view all bookings"
ON bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Les admins peuvent modifier toutes les réservations
CREATE POLICY "Admins can update all bookings"
ON bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Les partenaires peuvent voir les réservations de leurs services
CREATE POLICY "Partners can view their bookings"
ON bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'partner'
  )
);

-- ============================================
-- 4. POLITIQUES POUR LA TABLE PAYMENTS
-- ============================================

-- Les utilisateurs peuvent voir leurs propres paiements
CREATE POLICY "Users can view own payments"
ON payments FOR SELECT
USING (auth.uid() = user_id);

-- Seul le système peut créer des paiements (via webhook Stripe)
CREATE POLICY "System can create payments"
ON payments FOR INSERT
WITH CHECK (true); -- À sécuriser avec une clé API

-- Les admins peuvent voir tous les paiements
CREATE POLICY "Admins can view all payments"
ON payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- 5. POLITIQUES POUR LES SERVICES (HOTELS, APPARTEMENTS, ETC.)
-- ============================================

-- Tout le monde peut voir les services publiés
CREATE POLICY "Anyone can view published hotels"
ON hotels FOR SELECT
USING (disponible = true);

CREATE POLICY "Anyone can view published appartements"
ON appartements FOR SELECT
USING (disponible = true);

CREATE POLICY "Anyone can view published villas"
ON villas FOR SELECT
USING (disponible = true);

CREATE POLICY "Anyone can view published voitures"
ON locations_voitures FOR SELECT
USING (disponible = true);

CREATE POLICY "Anyone can view published circuits"
ON circuits_touristiques FOR SELECT
USING (disponible = true);

-- Les admins peuvent tout voir et modifier
CREATE POLICY "Admins can manage hotels"
ON hotels FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage appartements"
ON appartements FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage villas"
ON villas FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage voitures"
ON locations_voitures FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage circuits"
ON circuits_touristiques FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Les partenaires peuvent gérer leurs propres services
CREATE POLICY "Partners can manage own hotels"
ON hotels FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'partner' AND id = partner_id
  )
);

-- ============================================
-- 6. POLITIQUES POUR LES SERVICES SECONDAIRES
-- ============================================

-- Tout le monde peut voir les guides, activités, événements publiés
CREATE POLICY "Anyone can view published guides"
ON guides_touristiques FOR SELECT
USING (disponible = true);

CREATE POLICY "Anyone can view published activites"
ON activites_touristiques FOR SELECT
USING (disponible = true);

CREATE POLICY "Anyone can view published evenements"
ON evenements FOR SELECT
USING (disponible = true);

CREATE POLICY "Anyone can view published annonces"
ON annonces FOR SELECT
USING (statut = 'active');

CREATE POLICY "Anyone can view published immobilier"
ON immobilier FOR SELECT
USING (statut = 'active');

-- Les admins peuvent tout gérer
CREATE POLICY "Admins can manage guides"
ON guides_touristiques FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage activites"
ON activites_touristiques FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage evenements"
ON evenements FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage annonces"
ON annonces FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage immobilier"
ON immobilier FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- 7. POLITIQUES POUR CONTACT_MESSAGES
-- ============================================

-- Les utilisateurs peuvent créer des messages
CREATE POLICY "Anyone can create contact messages"
ON contact_messages FOR INSERT
WITH CHECK (true);

-- Les utilisateurs peuvent voir leurs propres messages
CREATE POLICY "Users can view own messages"
ON contact_messages FOR SELECT
USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- Les admins peuvent voir tous les messages
CREATE POLICY "Admins can view all messages"
ON contact_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Les admins peuvent mettre à jour les messages (marquer comme lu)
CREATE POLICY "Admins can update messages"
ON contact_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- 8. POLITIQUES POUR SITE_CONTENT
-- ============================================

-- Tout le monde peut lire le contenu du site
CREATE POLICY "Anyone can view site content"
ON site_content FOR SELECT
USING (true);

-- Seuls les admins peuvent modifier le contenu
CREATE POLICY "Admins can manage site content"
ON site_content FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- 9. POLITIQUES POUR CIRCUIT_BOOKINGS
-- ============================================

-- Les utilisateurs peuvent voir leurs propres réservations de circuits
CREATE POLICY "Users can view own circuit bookings"
ON circuit_bookings FOR SELECT
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leurs propres réservations
CREATE POLICY "Users can create own circuit bookings"
ON circuit_bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les admins peuvent voir toutes les réservations de circuits
CREATE POLICY "Admins can view all circuit bookings"
ON circuit_bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Les admins peuvent modifier toutes les réservations
CREATE POLICY "Admins can update all circuit bookings"
ON circuit_bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- 10. VÉRIFICATION DES POLITIQUES
-- ============================================

-- Pour vérifier que RLS est activé :
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Pour voir toutes les politiques :
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

/*
1. Exécutez ce script dans Supabase SQL Editor
2. Vérifiez que toutes les tables ont RLS activé
3. Testez avec différents rôles (admin, partner, client)
4. Ajustez les politiques selon vos besoins spécifiques
5. Documentez tout changement

ATTENTION :
- Ces politiques sont un point de départ
- Adaptez-les à votre logique métier
- Testez TOUJOURS avant la production
- Faites un backup avant d'exécuter
*/
