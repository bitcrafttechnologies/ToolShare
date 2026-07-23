CREATE TABLE blocked_dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT DEFAULT 'owner_block',
    booking_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

CREATE INDEX blocked_dates_tool_idx ON blocked_dates(tool_id);
CREATE INDEX blocked_dates_range_idx ON blocked_dates(tool_id, start_date, end_date);

ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blocked dates are viewable by everyone"
    ON blocked_dates FOR SELECT USING (true);

CREATE POLICY "Tool owners can manage blocked dates"
    ON blocked_dates FOR ALL USING (
        EXISTS (SELECT 1 FROM tools t WHERE t.id = tool_id AND t.owner_id = auth.uid())
    );

-- Allow system to insert booking-related blocks (via service_role)
CREATE POLICY "Service role can manage all blocked dates"
    ON blocked_dates FOR ALL TO service_role USING (true);
