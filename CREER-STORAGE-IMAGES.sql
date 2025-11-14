-- ============================================
-- CRÉATION DU STORAGE POUR LES IMAGES PRODUITS
-- ============================================

-- Créer le bucket pour les images de produits
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre aux partenaires d'uploader des images
CREATE POLICY "Partners can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre aux partenaires de voir leurs images
CREATE POLICY "Partners can view own product images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'product-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre aux partenaires de supprimer leurs images
CREATE POLICY "Partners can delete own product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre à tout le monde de voir les images publiques
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
