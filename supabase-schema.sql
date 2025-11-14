-- ============================================
-- MAROC 2030 - SCHEMA DE BASE DE DONNÉES SUPABASE
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES D'AUTHENTIFICATION ET UTILISATEURS
-- ============================================

-- Table des rôles utilisateurs
CREATE TYPE user_role AS ENUM ('admin', 'partner', 'client');
CREATE TYPE partner_type AS ENUM ('tourism', 'car_rental', 'real_estate');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Table des profils utilisateurs (étend auth.users de Supabase)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des partenaires
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    partner_type partner_type NOT NULL,
    company_name TEXT NOT NULL,
    company_description TEXT,
    company_logo TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Maroc',
    website TEXT,
    tax_id TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLES DES SERVICES DE TOURISME
-- ============================================

-- Table des circuits touristiques
CREATE TABLE tourism_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    destination TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    price_per_person DECIMAL(10, 2) NOT NULL,
    max_participants INTEGER,
    includes TEXT[], -- Array de ce qui est inclus
    excludes TEXT[], -- Array de ce qui est exclu
    itinerary JSONB, -- Détails jour par jour
    images TEXT[], -- Array d'URLs d'images
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des événements
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT, -- concert, festival, conférence, etc.
    location TEXT NOT NULL,
    address TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    price DECIMAL(10, 2),
    max_attendees INTEGER,
    images TEXT[],
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLES DES SERVICES DE LOCATION DE VOITURES
-- ============================================

-- Table des voitures
CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    category TEXT NOT NULL, -- économique, luxe, SUV, etc.
    transmission TEXT NOT NULL, -- manuelle, automatique
    fuel_type TEXT NOT NULL, -- essence, diesel, électrique, hybride
    seats INTEGER NOT NULL,
    doors INTEGER NOT NULL,
    price_per_day DECIMAL(10, 2) NOT NULL,
    features TEXT[], -- climatisation, GPS, etc.
    images TEXT[],
    license_plate TEXT UNIQUE,
    is_available BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLES DES SERVICES IMMOBILIERS
-- ============================================

-- Table des propriétés (appartements, villas, hôtels)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    property_type TEXT NOT NULL, -- apartment, villa, hotel
    title TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT DEFAULT 'Maroc',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    bedrooms INTEGER,
    bathrooms INTEGER,
    max_guests INTEGER,
    area_sqm DECIMAL(10, 2),
    price_per_night DECIMAL(10, 2) NOT NULL,
    amenities TEXT[], -- WiFi, piscine, parking, etc.
    images TEXT[],
    is_available BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des chambres d'hôtel (pour les hôtels)
CREATE TABLE hotel_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    room_type TEXT NOT NULL, -- single, double, suite, etc.
    description TEXT,
    max_guests INTEGER NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    amenities TEXT[],
    images TEXT[],
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(property_id, room_number)
);

-- ============================================
-- TABLES DES RÉSERVATIONS
-- ============================================

-- Table des réservations de circuits touristiques
CREATE TABLE tourism_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID REFERENCES tourism_packages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    number_of_participants INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status booking_status DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réservations de voitures
CREATE TABLE car_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    pickup_date TIMESTAMP WITH TIME ZONE NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_location TEXT NOT NULL,
    return_location TEXT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status booking_status DEFAULT 'pending',
    driver_license_number TEXT,
    additional_options JSONB, -- assurance, GPS, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réservations de propriétés
CREATE TABLE property_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    room_id UUID REFERENCES hotel_rooms(id) ON DELETE SET NULL, -- NULL si ce n'est pas un hôtel
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    number_of_guests INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status booking_status DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réservations d'événements
CREATE TABLE event_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    number_of_tickets INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status booking_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLES DES PAIEMENTS
-- ============================================

-- Table des paiements
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    booking_type TEXT NOT NULL, -- tourism, car, property, event
    booking_id UUID NOT NULL, -- ID de la réservation correspondante
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'MAD',
    payment_method TEXT NOT NULL, -- card, bank_transfer, etc.
    payment_status payment_status DEFAULT 'pending',
    stripe_payment_intent_id TEXT,
    transaction_id TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLES DES ANNONCES
-- ============================================

-- Table des annonces
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- promotion, nouveauté, info, etc.
    images TEXT[],
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLES DE COMMUNICATION
-- ============================================

-- Table des messages de contact
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des avis et commentaires
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    booking_type TEXT NOT NULL, -- tourism, car, property, event
    booking_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLES DE STATISTIQUES ET LOGS
-- ============================================

-- Table des logs d'activité admin
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT, -- user, partner, booking, etc.
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES POUR OPTIMISATION
-- ============================================

-- Indexes sur les profils
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Indexes sur les partenaires
CREATE INDEX idx_partners_user_id ON partners(user_id);
CREATE INDEX idx_partners_type ON partners(partner_type);
CREATE INDEX idx_partners_active ON partners(is_active);

-- Indexes sur les services
CREATE INDEX idx_tourism_packages_partner ON tourism_packages(partner_id);
CREATE INDEX idx_tourism_packages_active ON tourism_packages(is_active);
CREATE INDEX idx_events_partner ON events(partner_id);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_cars_partner ON cars(partner_id);
CREATE INDEX idx_cars_available ON cars(is_available);
CREATE INDEX idx_properties_partner ON properties(partner_id);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_city ON properties(city);

-- Indexes sur les réservations
CREATE INDEX idx_tourism_bookings_user ON tourism_bookings(user_id);
CREATE INDEX idx_tourism_bookings_package ON tourism_bookings(package_id);
CREATE INDEX idx_car_bookings_user ON car_bookings(user_id);
CREATE INDEX idx_car_bookings_car ON car_bookings(car_id);
CREATE INDEX idx_property_bookings_user ON property_bookings(user_id);
CREATE INDEX idx_property_bookings_property ON property_bookings(property_id);
CREATE INDEX idx_event_bookings_user ON event_bookings(user_id);
CREATE INDEX idx_event_bookings_event ON event_bookings(event_id);

-- Indexes sur les paiements
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_booking ON payments(booking_type, booking_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- ============================================
-- FONCTIONS ET TRIGGERS
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tourism_packages_updated_at BEFORE UPDATE ON tourism_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tourism_bookings_updated_at BEFORE UPDATE ON tourism_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_car_bookings_updated_at BEFORE UPDATE ON car_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_bookings_updated_at BEFORE UPDATE ON property_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_bookings_updated_at BEFORE UPDATE ON event_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourism_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourism_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Policies pour les profils
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can do everything on profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policies pour les partenaires
CREATE POLICY "Partners are viewable by everyone" ON partners
    FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can update own data" ON partners
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage partners" ON partners
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policies pour les services (tourism, cars, properties, events)
CREATE POLICY "Active services are viewable by everyone" ON tourism_packages
    FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can manage own tourism packages" ON tourism_packages
    FOR ALL USING (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Active events are viewable by everyone" ON events
    FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can manage own events" ON events
    FOR ALL USING (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Available cars are viewable by everyone" ON cars
    FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can manage own cars" ON cars
    FOR ALL USING (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Active properties are viewable by everyone" ON properties
    FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can manage own properties" ON properties
    FOR ALL USING (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

-- Policies pour les réservations
CREATE POLICY "Users can view own bookings" ON tourism_bookings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings" ON tourism_bookings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own car bookings" ON car_bookings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create car bookings" ON car_bookings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own property bookings" ON property_bookings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create property bookings" ON property_bookings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own event bookings" ON event_bookings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create event bookings" ON event_bookings
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policies pour les paiements
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create payments" ON payments
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policies pour les annonces
CREATE POLICY "Active announcements are viewable by everyone" ON announcements
    FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can manage own announcements" ON announcements
    FOR ALL USING (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

-- Policies pour les messages de contact
CREATE POLICY "Anyone can create contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all contact messages" ON contact_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policies pour les avis
CREATE POLICY "Approved reviews are viewable by everyone" ON reviews
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- DONNÉES INITIALES (OPTIONNEL)
-- ============================================

-- Vous pouvez ajouter des données de test ici si nécessaire
