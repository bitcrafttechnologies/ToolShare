CREATE TYPE tool_condition AS ENUM ('like_new', 'good', 'fair', 'heavy_use');

CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category_id INT REFERENCES categories(id),
    condition tool_condition DEFAULT 'good',
    hourly_rate NUMERIC(10,2),
    daily_rate NUMERIC(10,2),
    weekly_rate NUMERIC(10,2),
    deposit_amount NUMERIC(10,2) DEFAULT 0,
    photo_urls TEXT[] DEFAULT '{}',
    requires_license BOOLEAN DEFAULT FALSE,
    license_type TEXT,
    min_age INT DEFAULT 18,
    is_available BOOLEAN DEFAULT TRUE,
    location_point GEOGRAPHY(POINT,4326),
    address_display TEXT,
    pickup_available BOOLEAN DEFAULT TRUE,
    delivery_available BOOLEAN DEFAULT FALSE,
    delivery_radius_miles INT DEFAULT 0,
    specifications JSONB DEFAULT '{}',
    safety_notes TEXT,
    view_count INT DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX tools_owner_idx ON tools(owner_id);
CREATE INDEX tools_category_idx ON tools(category_id);
CREATE INDEX tools_location_idx ON tools USING GIST(location_point);
CREATE INDEX tools_available_idx ON tools(is_available) WHERE is_available = TRUE;
CREATE INDEX tools_title_search_idx ON tools USING GIN(title gin_trgm_ops);

ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Available tools are viewable by everyone"
    ON tools FOR SELECT USING (true);

CREATE POLICY "Users can insert their own tools"
    ON tools FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own tools"
    ON tools FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own tools"
    ON tools FOR DELETE USING (auth.uid() = owner_id);

-- RPC for geo-filtered search (called from client)
CREATE OR REPLACE FUNCTION search_tools_nearby(
    lat FLOAT,
    lng FLOAT,
    radius_miles FLOAT DEFAULT 75,
    search_query TEXT DEFAULT NULL,
    category_filter INT DEFAULT NULL,
    min_age_filter INT DEFAULT NULL
)
RETURNS SETOF tools
LANGUAGE sql STABLE
AS $$
    SELECT t.*
    FROM tools t
    WHERE t.is_available = TRUE
      AND ST_DWithin(
            t.location_point::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
            radius_miles * 1609.34  -- convert miles to meters
          )
      AND (search_query IS NULL OR t.title ILIKE '%' || search_query || '%')
      AND (category_filter IS NULL OR t.category_id = category_filter)
      AND (min_age_filter IS NULL OR t.min_age <= min_age_filter)
    ORDER BY t.rating DESC, t.review_count DESC;
$$;
