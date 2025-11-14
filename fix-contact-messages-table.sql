-- ================================================
-- CORRECTION TABLE contact_messages
-- ================================================
-- Ajouter la colonne is_read si elle n'existe pas

-- Vérifier et ajouter la colonne is_read
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contact_messages' 
        AND column_name = 'is_read'
    ) THEN
        ALTER TABLE contact_messages 
        ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Vérifier et ajouter les autres colonnes si nécessaires
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contact_messages' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE contact_messages 
        ADD COLUMN phone TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contact_messages' 
        AND column_name = 'subject'
    ) THEN
        ALTER TABLE contact_messages 
        ADD COLUMN subject TEXT;
    END IF;
END $$;

-- ================================================
-- RECRÉER LES POLICIES SI NÉCESSAIRE
-- ================================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Anyone can insert messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can read messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can update messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON contact_messages;

-- Activer RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut insérer des messages
CREATE POLICY "Anyone can insert messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Seuls les admins peuvent lire
CREATE POLICY "Admins can read messages"
  ON contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Seuls les admins peuvent mettre à jour (marquer comme lu)
CREATE POLICY "Admins can update messages"
  ON contact_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Seuls les admins peuvent supprimer
CREATE POLICY "Admins can delete messages"
  ON contact_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ================================================
-- VÉRIFICATION
-- ================================================
-- Afficher la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'contact_messages'
ORDER BY ordinal_position;
