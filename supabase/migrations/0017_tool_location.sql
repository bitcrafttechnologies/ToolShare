-- TKT-00003: new listings never appeared in search.
--
-- `search_tools_nearby` filters on ST_DWithin(t.location_point, ...), but
-- nothing in either app ever set `location_point` — the listing form's only
-- location input is the free-text `address_display` box, and no geocoder or
-- trigger derived a point from it. ST_DWithin(NULL, ...) yields NULL, which is
-- not TRUE, so every app-created row was dropped by the WHERE clause. The
-- owner's own views (/my-listings, /tools/[id], bookings) are plain table
-- queries with no geo predicate, which is exactly why the listing looked
-- visible to its owner and to nobody else.
--
-- Verified against the prod snapshot: 31 tool rows, 29 with a geography value.
-- The two NULLs are precisely the two rows created through the app UI; every
-- searchable row came from seed.sql, which hand-writes ST_MakePoint per tool.
--
-- Fix: a service-area lookup the form can bind to, a trigger that resolves a
-- point on every write, and a NULL guard in the RPC so a missing point can
-- never again silently unpublish a listing.

-- Service areas -------------------------------------------------------------
-- Keyed by slug rather than ZIP: these are city centroids, and storing one
-- representative ZIP per city would imply a precision we don't have. Listing
-- location is deliberately city-level — a renter needs to know a tool is in
-- Mesa, not which house it's in.
CREATE TABLE service_areas (
    slug       TEXT PRIMARY KEY,
    label      TEXT             NOT NULL,
    lat        DOUBLE PRECISION NOT NULL,
    lng        DOUBLE PRECISION NOT NULL,
    sort_order INT              NOT NULL DEFAULT 0
);

-- The Phoenix metro footprint from CLAUDE.md: Buckeye -> Apache Junction,
-- Florence -> North Phoenix/Surprise. Coordinates for the first eleven match
-- the values seed.sql already uses for those cities, so seeded and
-- user-created listings in the same city land on the same point.
INSERT INTO service_areas (slug, label, lat, lng, sort_order) VALUES
    ('phoenix',         'Phoenix, AZ',         33.4484, -112.0740, 10),
    ('mesa',            'Mesa, AZ',            33.4152, -111.8315, 20),
    ('chandler',        'Chandler, AZ',        33.3062, -111.8413, 30),
    ('gilbert',         'Gilbert, AZ',         33.3528, -111.7890, 40),
    ('tempe',           'Tempe, AZ',           33.4255, -111.9400, 50),
    ('scottsdale',      'Scottsdale, AZ',      33.4942, -111.9261, 60),
    ('glendale',        'Glendale, AZ',        33.5387, -112.1860, 70),
    ('peoria',          'Peoria, AZ',          33.5806, -112.2374, 80),
    ('surprise',        'Surprise, AZ',        33.6292, -112.3680, 90),
    ('buckeye',         'Buckeye, AZ',         33.3703, -112.5838, 100),
    ('apache-junction', 'Apache Junction, AZ', 33.4151, -111.5496, 110),
    ('avondale',        'Avondale, AZ',        33.4356, -112.3496, 120),
    ('goodyear',        'Goodyear, AZ',        33.4353, -112.3576, 130),
    ('queen-creek',     'Queen Creek, AZ',     33.2487, -111.6343, 140),
    ('san-tan-valley',  'San Tan Valley, AZ',  33.1920, -111.5470, 150),
    ('maricopa',        'Maricopa, AZ',        33.0581, -112.0476, 160),
    ('florence',        'Florence, AZ',        33.0298, -111.3873, 170),
    ('casa-grande',     'Casa Grande, AZ',     32.8795, -111.7574, 180),
    ('sun-city',        'Sun City, AZ',        33.5978, -112.2717, 190),
    ('fountain-hills',  'Fountain Hills, AZ',  33.6117, -111.7174, 200);

ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;

-- Public reference data: the listing form reads it before the user has
-- necessarily signed in, and there is nothing sensitive in it.
CREATE POLICY "Service areas are viewable by everyone"
    ON service_areas FOR SELECT USING (true);

-- Dashboard-applied migrations don't inherit 0014's blanket grants, so be
-- explicit (see 0014_restore_default_grants.sql).
GRANT SELECT ON TABLE service_areas TO anon, authenticated;
GRANT ALL    ON TABLE service_areas TO service_role;

-- Tools -> service area -----------------------------------------------------
-- An FK the trigger can resolve exactly, instead of parsing free text back out
-- of address_display. Nullable so pre-existing rows stay valid.
ALTER TABLE tools
    ADD COLUMN service_area_slug TEXT REFERENCES service_areas(slug);

CREATE INDEX tools_service_area_idx ON tools(service_area_slug);

-- Location trigger ----------------------------------------------------------
CREATE OR REPLACE FUNCTION set_tool_location()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    area service_areas%ROWTYPE;
BEGIN
    -- 1. Preferred path: the listing form sends a service area slug.
    --    Re-resolve on insert, when the slug changes, or whenever the point is
    --    missing — so editing a broken legacy listing repairs it.
    IF NEW.service_area_slug IS NOT NULL
       AND (TG_OP = 'INSERT'
            OR NEW.service_area_slug IS DISTINCT FROM OLD.service_area_slug
            OR NEW.location_point IS NULL)
    THEN
        SELECT * INTO area FROM service_areas WHERE slug = NEW.service_area_slug;
        IF FOUND THEN
            NEW.location_point := ST_SetSRID(ST_MakePoint(area.lng, area.lat), 4326)::geography;
            -- Keep the human-readable label in step unless the owner wrote
            -- something more specific.
            IF NEW.address_display IS NULL OR btrim(NEW.address_display) = '' THEN
                NEW.address_display := area.label;
            END IF;
        END IF;
    END IF;

    -- 2. Legacy rows: no slug, but the owner typed something like
    --    "San Tan Valley, AZ" or "Tempe, AZ 85281" into the old free-text box.
    IF NEW.location_point IS NULL AND NEW.address_display IS NOT NULL THEN
        SELECT * INTO area
        FROM service_areas
        WHERE NEW.address_display ILIKE '%' || split_part(label, ',', 1) || '%'
        -- Longest city name first, so a two-word city wins over any shorter
        -- name it happens to contain rather than losing on row order.
        ORDER BY length(label) DESC
        LIMIT 1;
        IF FOUND THEN
            NEW.location_point   := ST_SetSRID(ST_MakePoint(area.lng, area.lat), 4326)::geography;
            NEW.service_area_slug := COALESCE(NEW.service_area_slug, area.slug);
        END IF;
    END IF;

    -- 3. Last resort: Phoenix metro center. A coarse point is wrong by a few
    --    miles; a NULL point makes the listing invisible, which is the bug.
    IF NEW.location_point IS NULL THEN
        NEW.location_point := ST_SetSRID(ST_MakePoint(-112.0740, 33.4484), 4326)::geography;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER set_tool_location_trigger
    BEFORE INSERT OR UPDATE ON tools
    FOR EACH ROW EXECUTE FUNCTION set_tool_location();

-- Trigger-only function; PostgREST would otherwise expose it as an RPC
-- endpoint (same reasoning as 0015_tighten_function_grants.sql).
REVOKE EXECUTE ON FUNCTION public.set_tool_location() FROM anon, authenticated;

-- Backfill ------------------------------------------------------------------
-- A no-op UPDATE fires the trigger, which resolves address_display where it
-- can and falls back to metro center otherwise. Catches the two live listings
-- that prompted this ticket.
UPDATE tools SET location_point = NULL WHERE location_point IS NULL;

-- Search --------------------------------------------------------------------
-- Two changes:
--   1. The NULL guard. Belt-and-braces now that the trigger guarantees a
--      point, but this is the predicate that made the failure silent, and it
--      should never be able to do that again.
--   2. created_at in the ORDER BY. A brand-new listing has rating 0 and
--      review_count 0, so it sorted behind every rated tool — even once
--      visible it would land at the bottom of an unfiltered browse and look
--      like the fix hadn't worked.
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
      AND (
            t.location_point IS NULL
            OR ST_DWithin(
                 t.location_point::geography,
                 ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
                 radius_miles * 1609.34  -- convert miles to meters
               )
          )
      AND (search_query IS NULL OR t.title ILIKE '%' || search_query || '%')
      AND (category_filter IS NULL OR t.category_id = category_filter)
      AND (min_age_filter IS NULL OR t.min_age <= min_age_filter)
    ORDER BY t.rating DESC, t.review_count DESC, t.created_at DESC;
$$;

-- CREATE OR REPLACE resets function attributes, so re-apply the search_path
-- pinning 0015 added.
ALTER FUNCTION public.search_tools_nearby(float, float, float, text, int, int)
    SET search_path = public, pg_temp;
