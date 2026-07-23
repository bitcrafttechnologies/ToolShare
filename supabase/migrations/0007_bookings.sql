CREATE TYPE booking_status AS ENUM (
    'pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed'
);
CREATE TYPE payment_method_type AS ENUM (
    'stripe_card', 'cash_app', 'in_person'
);
CREATE TYPE payment_status_type AS ENUM (
    'pending', 'authorized', 'captured', 'refunded', 'failed'
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id UUID REFERENCES tools(id),
    bundle_id UUID REFERENCES tool_bundles(id),
    renter_id UUID NOT NULL REFERENCES profiles(id),
    owner_id UUID NOT NULL REFERENCES profiles(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    deposit_amount NUMERIC(10,2) DEFAULT 0,
    payment_method payment_method_type NOT NULL,
    payment_status payment_status_type DEFAULT 'pending',
    stripe_payment_intent_id TEXT,
    stripe_deposit_intent_id TEXT,
    booking_status booking_status DEFAULT 'pending',
    waiver_signed_at TIMESTAMPTZ,
    waiver_content_hash TEXT,
    pickup_type TEXT DEFAULT 'pickup',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT has_tool_or_bundle CHECK (tool_id IS NOT NULL OR bundle_id IS NOT NULL),
    CONSTRAINT valid_booking_dates CHECK (end_date >= start_date)
);

CREATE INDEX bookings_renter_idx ON bookings(renter_id);
CREATE INDEX bookings_owner_idx ON bookings(owner_id);
CREATE INDEX bookings_tool_idx ON bookings(tool_id);
CREATE INDEX bookings_status_idx ON bookings(booking_status);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
    ON bookings FOR SELECT
    USING (auth.uid() = renter_id OR auth.uid() = owner_id);

CREATE POLICY "Renters can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Participants can update booking status"
    ON bookings FOR UPDATE
    USING (auth.uid() = renter_id OR auth.uid() = owner_id);

CREATE POLICY "Service role has full access"
    ON bookings FOR ALL TO service_role USING (true);
