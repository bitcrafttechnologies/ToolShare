-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at
    BEFORE UPDATE ON tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tool_bundles_updated_at
    BEFORE UPDATE ON tool_bundles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-block dates when booking is confirmed
CREATE OR REPLACE FUNCTION auto_block_dates()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    IF NEW.booking_status = 'confirmed' AND
       (OLD IS NULL OR OLD.booking_status != 'confirmed') THEN
        INSERT INTO blocked_dates (tool_id, start_date, end_date, reason, booking_id)
        VALUES (NEW.tool_id, NEW.start_date, NEW.end_date, 'booking', NEW.id)
        ON CONFLICT DO NOTHING;
    END IF;
    -- Remove block when booking is cancelled
    IF NEW.booking_status = 'cancelled' AND
       OLD.booking_status IN ('confirmed', 'active') THEN
        DELETE FROM blocked_dates WHERE booking_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_booking_status_changed
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION auto_block_dates();

-- Recalculate tool rating after review
CREATE OR REPLACE FUNCTION update_ratings_after_review()
RETURNS TRIGGER LANGUAGE plpgsql
AS $$
BEGIN
    -- Update tool rating
    IF NEW.review_type = 'tool' AND NEW.tool_id IS NOT NULL THEN
        UPDATE tools
        SET rating = (
            SELECT ROUND(AVG(rating)::NUMERIC, 2)
            FROM reviews
            WHERE tool_id = NEW.tool_id AND review_type = 'tool'
        ),
        review_count = (
            SELECT COUNT(*) FROM reviews
            WHERE tool_id = NEW.tool_id AND review_type = 'tool'
        )
        WHERE id = NEW.tool_id;
    END IF;
    -- Update owner rating
    IF NEW.review_type = 'owner' AND NEW.reviewee_id IS NOT NULL THEN
        UPDATE profiles
        SET owner_rating = (
            SELECT ROUND(AVG(rating)::NUMERIC, 2)
            FROM reviews
            WHERE reviewee_id = NEW.reviewee_id AND review_type = 'owner'
        ),
        review_count_owner = (
            SELECT COUNT(*) FROM reviews
            WHERE reviewee_id = NEW.reviewee_id AND review_type = 'owner'
        )
        WHERE id = NEW.reviewee_id;
    END IF;
    -- Update renter rating
    IF NEW.review_type = 'renter' AND NEW.reviewee_id IS NOT NULL THEN
        UPDATE profiles
        SET renter_rating = (
            SELECT ROUND(AVG(rating)::NUMERIC, 2)
            FROM reviews
            WHERE reviewee_id = NEW.reviewee_id AND review_type = 'renter'
        ),
        review_count_renter = (
            SELECT COUNT(*) FROM reviews
            WHERE reviewee_id = NEW.reviewee_id AND review_type = 'renter'
        )
        WHERE id = NEW.reviewee_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_inserted
    AFTER INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_ratings_after_review();

-- Increment tool view count
CREATE OR REPLACE FUNCTION increment_tool_views(tool_id_param UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER
AS $$
    UPDATE tools SET view_count = view_count + 1 WHERE id = tool_id_param;
$$;
