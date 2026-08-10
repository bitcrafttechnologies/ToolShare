-- TKT-00003 follow-up: 0017 backfilled `location_point` but not
-- `service_area_slug`.
--
-- 0017's legacy branch only ran when `location_point IS NULL`, and every
-- seeded listing already had a point (seed.sql writes ST_MakePoint per tool).
-- So those rows kept a NULL slug, and once the listing form made City a
-- required field that left every pre-existing listing un-editable: the select
-- rendered empty, native validation blocked submit, and the form gave no
-- visible reason. Caught by the TKT-00004 end-to-end test, which edits a
-- seeded listing.

-- Backfill by proximity rather than by parsing `address_display`. Every row is
-- guaranteed to have a point by now (0017's trigger ensures it), so nearest
-- service area is both well-defined and consistent with what search does.
UPDATE tools t
SET service_area_slug = (
    SELECT s.slug
    FROM service_areas s
    ORDER BY ST_Distance(
        t.location_point,
        ST_SetSRID(ST_MakePoint(s.lng, s.lat), 4326)::geography
    )
    LIMIT 1
)
WHERE t.service_area_slug IS NULL
  AND t.location_point IS NOT NULL;

-- Anything still unset had no point either; metro center is the documented
-- fallback, so name it explicitly rather than leaving a NULL behind.
UPDATE tools
SET service_area_slug = 'phoenix'
WHERE service_area_slug IS NULL;

-- Trigger, revised: also derive the slug when a row has a point but no area.
-- 0017 only ever set the slug as a side effect of resolving a missing point,
-- which is what left the seeded rows half-populated. Now any write to a legacy
-- row heals it.
CREATE OR REPLACE FUNCTION set_tool_location()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    area service_areas%ROWTYPE;
BEGIN
    -- 1. Preferred path: the listing form sends a service area slug.
    IF NEW.service_area_slug IS NOT NULL
       AND (TG_OP = 'INSERT'
            OR NEW.service_area_slug IS DISTINCT FROM OLD.service_area_slug
            OR NEW.location_point IS NULL)
    THEN
        SELECT * INTO area FROM service_areas WHERE slug = NEW.service_area_slug;
        IF FOUND THEN
            NEW.location_point := ST_SetSRID(ST_MakePoint(area.lng, area.lat), 4326)::geography;
            IF NEW.address_display IS NULL OR btrim(NEW.address_display) = '' THEN
                NEW.address_display := area.label;
            END IF;
        END IF;
    END IF;

    -- 2. Legacy rows: free text only, e.g. "San Tan Valley, AZ".
    IF NEW.location_point IS NULL AND NEW.address_display IS NOT NULL THEN
        SELECT * INTO area
        FROM service_areas
        WHERE NEW.address_display ILIKE '%' || split_part(label, ',', 1) || '%'
        -- Longest city name first, so a two-word city wins over any shorter
        -- name it happens to contain rather than losing on row order.
        ORDER BY length(label) DESC
        LIMIT 1;
        IF FOUND THEN
            NEW.location_point    := ST_SetSRID(ST_MakePoint(area.lng, area.lat), 4326)::geography;
            NEW.service_area_slug := COALESCE(NEW.service_area_slug, area.slug);
        END IF;
    END IF;

    -- 3. Last resort for the point: Phoenix metro center. A coarse point is
    --    wrong by a few miles; a NULL point makes the listing invisible.
    IF NEW.location_point IS NULL THEN
        NEW.location_point := ST_SetSRID(ST_MakePoint(-112.0740, 33.4484), 4326)::geography;
    END IF;

    -- 4. Has a point but no area (every row seeded before 0017). Derive the
    --    slug from the point so the edit form can prefill City.
    IF NEW.service_area_slug IS NULL THEN
        SELECT s.slug INTO NEW.service_area_slug
        FROM service_areas s
        ORDER BY ST_Distance(
            NEW.location_point,
            ST_SetSRID(ST_MakePoint(s.lng, s.lat), 4326)::geography
        )
        LIMIT 1;
    END IF;

    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_tool_location() FROM anon, authenticated;
