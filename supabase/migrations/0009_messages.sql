CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX messages_booking_idx ON messages(booking_id);
CREATE INDEX messages_sender_idx ON messages(sender_id);
CREATE INDEX messages_unread_idx ON messages(booking_id, is_read) WHERE is_read = FALSE;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Booking participants can view messages"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = booking_id
              AND (b.renter_id = auth.uid() OR b.owner_id = auth.uid())
        )
    );

CREATE POLICY "Booking participants can send messages"
    ON messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = booking_id
              AND (b.renter_id = auth.uid() OR b.owner_id = auth.uid())
        )
    );

CREATE POLICY "Recipients can mark messages as read"
    ON messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = booking_id
              AND (b.renter_id = auth.uid() OR b.owner_id = auth.uid())
        )
    );
