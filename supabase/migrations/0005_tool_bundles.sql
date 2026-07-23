CREATE TABLE tool_bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    discount_percent NUMERIC(5,2) DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bundle_tools (
    bundle_id UUID REFERENCES tool_bundles(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    PRIMARY KEY (bundle_id, tool_id)
);

ALTER TABLE tool_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bundles are viewable by everyone"
    ON tool_bundles FOR SELECT USING (true);
CREATE POLICY "Users can manage their own bundles"
    ON tool_bundles FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Bundle tools are viewable by everyone"
    ON bundle_tools FOR SELECT USING (true);
CREATE POLICY "Bundle owners can manage bundle_tools"
    ON bundle_tools FOR ALL USING (
        EXISTS (SELECT 1 FROM tool_bundles b WHERE b.id = bundle_id AND b.owner_id = auth.uid())
    );
