-- Notification-badge counts as SECURITY DEFINER functions (TKT-00009).
--
-- Both badges previously called PostgREST with `count: 'exact', head: true`
-- (message.repository.ts / booking.repository.ts) — the only two places in
-- the app using that shape. An exact count can't stop at a LIMIT, so
-- Postgres evaluates RLS per candidate row to produce it. The unread-message
-- count made this worse: its own filter never scopes by user at all — that
-- was delegated entirely to messages' SELECT policy, a correlated EXISTS
-- subquery against bookings evaluated once per candidate row, the most
-- expensive query shape anywhere in the schema. Fired on every page,
-- site-wide, this was intermittently timing out as a 503.
--
-- These functions do the same user-scoping as an explicit JOIN/WHERE and run
-- as their owner, so Postgres never re-checks RLS per row. Each reads
-- auth.uid() itself rather than taking the user id as an argument — a
-- SECURITY DEFINER function bypasses RLS entirely, so a caller-supplied id
-- would let any authenticated user read anyone else's counts.

CREATE OR REPLACE FUNCTION get_unread_message_count()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT COUNT(*)
    FROM messages m
    JOIN bookings b ON b.id = m.booking_id
    WHERE m.is_read = FALSE
      AND m.sender_id <> auth.uid()
      AND (b.renter_id = auth.uid() OR b.owner_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION get_pending_booking_count()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT COUNT(*)
    FROM bookings
    WHERE owner_id = auth.uid()
      AND booking_status = 'pending';
$$;

-- Only signed-in callers have a meaningful auth.uid() to scope by.
REVOKE EXECUTE ON FUNCTION get_unread_message_count()  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION get_pending_booking_count() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_unread_message_count()  TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_booking_count() TO authenticated;
