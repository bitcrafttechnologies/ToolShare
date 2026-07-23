CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT '',
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    owner_rating NUMERIC(3,2) DEFAULT 0,
    renter_rating NUMERIC(3,2) DEFAULT 0,
    review_count_owner INT DEFAULT 0,
    review_count_renter INT DEFAULT 0,
    is_identity_verified BOOLEAN DEFAULT FALSE,
    is_age_verified BOOLEAN DEFAULT FALSE,
    age_verification_doc_url TEXT,
    license_url TEXT,
    stripe_customer_id TEXT,
    location_point GEOGRAPHY(POINT,4326),
    address_display TEXT,
    fcm_token TEXT,
    apns_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);
