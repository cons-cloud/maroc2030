-- Migration pour ajouter les champs manquants à la table payments

-- 1. Vérifier si la colonne payment_intent_id existe déjà
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'payments' AND column_name = 'payment_intent_id') THEN
        -- Ajouter les colonnes manquantes
        ALTER TABLE public.payments
        ADD COLUMN payment_intent_id TEXT UNIQUE,
        ADD COLUMN payment_method_id TEXT,
        ADD COLUMN customer_id TEXT,
        ADD COLUMN receipt_url TEXT,
        ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending',
        ADD COLUMN currency VARCHAR(3) DEFAULT 'MAD',
        ADD COLUMN admin_commission DECIMAL(10,2),
        ADD COLUMN partner_amount DECIMAL(10,2),
        ADD COLUMN is_commission_paid BOOLEAN DEFAULT false,
        ADD COLUMN partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        ADD COLUMN metadata JSONB;
        
        -- Mettre à jour le timestamp de modification
        ALTER TABLE public.payments
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
        
        -- Créer un déclencheur pour updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        CREATE TRIGGER update_payments_updated_at
        BEFORE UPDATE ON public.payments
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 2. Mettre à jour les politiques RLS si elles n'existent pas
DO $$
BEGIN
    -- Vérifier si la politique existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payments' 
        AND policyname = 'Enable read access for users'' own payments'
    ) THEN
        -- Politique de lecture pour les paiements de l'utilisateur
        CREATE POLICY "Enable read access for users' own payments"
        ON public.payments
        FOR SELECT
        USING (auth.uid() = (SELECT user_id FROM public.bookings WHERE id = booking_id));
    END IF;
    
    -- Politique d'insertion
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payments' 
        AND policyname = 'Enable insert for authenticated users'
    ) THEN
        CREATE POLICY "Enable insert for authenticated users"
        ON public.payments
        FOR INSERT
        WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    -- Politique de mise à jour pour les administrateurs
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payments' 
        AND policyname = 'Enable update for admins'
    ) THEN
        CREATE POLICY "Enable update for admins"
        ON public.payments
        FOR UPDATE
        USING (auth.role() = 'service_role' OR 
              auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));
    END IF;
END $$;

-- 3. Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_intent_id ON public.payments(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- 4. Fonction pour calculer automatiquement les commissions
CREATE OR REPLACE FUNCTION calculate_commission()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est un nouvel enregistrement ou que le montant a changé
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.amount IS DISTINCT FROM NEW.amount)) THEN
    -- Calculer la commission (10% pour l'admin, 90% pour le partenaire)
    NEW.admin_commission := ROUND(NEW.amount * 0.1, 2);
    NEW.partner_amount := NEW.amount - NEW.admin_commission;
    NEW.is_commission_paid := false;
    
    -- Mettre à jour le partner_id à partir de la réservation
    IF NEW.booking_id IS NOT NULL THEN
      SELECT s.partner_id INTO NEW.partner_id
      FROM services s
      JOIN bookings b ON b.service_id = s.id
      WHERE b.id = NEW.booking_id
      LIMIT 1;
    END IF;
  END IF;
  
  -- Mettre à jour le statut si nécessaire
  IF NEW.status = 'succeeded' AND (TG_OP = 'INSERT' OR OLD.status <> 'succeeded') THEN
    -- Mettre à jour le statut de la réservation associée
    UPDATE bookings 
    SET status = 'confirmed', 
        updated_at = now()
    WHERE id = NEW.booking_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Créer le déclencheur pour la fonction de calcul de commission
DO $$
BEGIN
    -- Supprimer le déclencheur s'il existe déjà
    DROP TRIGGER IF EXISTS trg_calculate_commission ON public.payments;
    
    -- Créer le déclencheur
    CREATE TRIGGER trg_calculate_commission
    BEFORE INSERT OR UPDATE OF amount, status
    ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION calculate_commission();
END $$;
