CREATE TYPE review_type AS ENUM ('tool', 'owner', 'renter');

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    reviewer_id UUID NOT NULL REFERENCES profiles(id),
    reviewee_id UUID REFERENCES profiles(id),
    tool_id UUID REFERENCES tools(id),
    review_type review_type NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (booking_id, reviewer_id, review_type)
);

CREATE INDEX reviews_tool_idx ON reviews(tool_id);
CREATE INDEX reviews_reviewee_idx ON reviews(reviewee_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
    ON reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for completed bookings"
    ON reviews FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id
        AND EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = booking_id
              AND (b.renter_id = auth.uid() OR b.owner_id = auth.uid())
              AND b.booking_status = 'completed'
        )
    );
