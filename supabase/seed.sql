-- Toolshare demo seed data (sample listings, not production content).
--
-- Idempotent: re-running replaces the demo rows. Owners are the five
-- @toolshare-demo.app accounts created via the Auth admin API; their profiles
-- are upserted here so the tools.owner_id FK always resolves.
--
-- Images live in the public `tools` bucket under demo/. The workshop photos
-- come from the Figma "Toolshed" design; the rest are generated brand
-- placeholders explicitly labelled SAMPLE LISTING.

BEGIN;

-- Demo owner auth accounts. In production these five are created via the Auth
-- admin API; that step doesn't run locally, so on a fresh `supabase start` /
-- `supabase db reset` auth.users is empty and every tools.owner_id subquery
-- below would resolve to NULL (violating the NOT NULL constraint). Synthesize
-- them here (same approach as scripts/supabase/sanitize-local.sql). Each is
-- loginable locally as its email with password 'localdev123'; the
-- on_auth_user_created trigger then creates the matching profile, which the
-- upsert just below refines. Idempotent via NOT EXISTS.
INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    -- These four are nullable with no default, but GoTrue scans them into Go
    -- strings — leaving them NULL makes every sign-in fail with a 500
    -- ("Database error querying schema" / `converting NULL to string is
    -- unsupported`), which silently broke local login for all five accounts.
    -- The other token columns already default to ''.
    confirmation_token, recovery_token, email_change_token_new, email_change
)
SELECT
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v.email,
    crypt('localdev123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('display_name', v.display_name),
    '', '', '', ''
FROM (VALUES
    ('Mike Harrison', 'mike.harrison@toolshare-demo.app'),
    ('Elena Rodriguez', 'elena.rodriguez@toolshare-demo.app'),
    ('David Chen', 'david.chen@toolshare-demo.app'),
    ('Sarah Whitfield', 'sarah.whitfield@toolshare-demo.app'),
    ('Tom Nguyen', 'tom.nguyen@toolshare-demo.app')
) AS v(display_name, email)
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.email = v.email);

-- Owner profiles (ids come from auth.users, created by the signup trigger).
INSERT INTO profiles (id, display_name, email, is_identity_verified, owner_rating, review_count_owner)
SELECT u.id, v.display_name, u.email, v.verified, v.rating, v.reviews
FROM (VALUES
    ('Mike Harrison', 'mike.harrison@toolshare-demo.app', true, 4.9, 63),
    ('Elena Rodriguez', 'elena.rodriguez@toolshare-demo.app', true, 4.8, 41),
    ('David Chen', 'david.chen@toolshare-demo.app', true, 4.7, 35),
    ('Sarah Whitfield', 'sarah.whitfield@toolshare-demo.app', false, 4.6, 18),
    ('Tom Nguyen', 'tom.nguyen@toolshare-demo.app', false, 4.5, 12)
) AS v(display_name, email, verified, rating, reviews)
JOIN auth.users u ON u.email = v.email
ON CONFLICT (id) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      is_identity_verified = EXCLUDED.is_identity_verified,
      owner_rating = EXCLUDED.owner_rating,
      review_count_owner = EXCLUDED.review_count_owner;

-- Replace any previous demo listings before re-seeding.
DELETE FROM tools WHERE owner_id IN (SELECT id FROM auth.users WHERE email LIKE '%@toolshare-demo.app');

-- rating/review_count are 0 on every row below (TKT-00010): this file seeds
-- no `reviews` rows, and update_ratings_after_review() only recomputes these
-- two columns from real review inserts. They used to be hardcoded to each
-- owner's profiles.owner_rating/review_count_owner instead, which made the
-- "4.9 (63)" badge on a listing page disagree with its own, genuinely empty
-- Reviews section. 0 here matches the Reviews section honestly; it'll track
-- automatically once real reviews exist.
INSERT INTO tools (
    owner_id, title, description, category_id, condition,
    daily_rate, weekly_rate, deposit_amount, photo_urls,
    requires_license, license_type, min_age, is_available,
    location_point, address_display, pickup_available, delivery_available,
    delivery_radius_miles, specifications, safety_notes, rating, review_count
) VALUES
(
    (SELECT id FROM auth.users WHERE email = 'mike.harrison@toolshare-demo.app'),
    'Makita 18V LXT Cordless Drill', 'Barely used and kept in excellent condition. Cleaned and checked before every rental.', 1, 'like_new'::tool_condition,
    24, 132, 75, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/cordless-drill.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-111.8315, 33.4152), 4326)::geography, 'Mesa, AZ',
    true, false,
    0, '{"Battery": "2x 5.0Ah", "Chuck": "1/2 in", "Case": "Included"}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'david.chen@toolshare-demo.app'),
    'DeWalt 7-1/4" Circular Saw', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 1, 'good'::tool_condition,
    28, 154, 90, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/circular-saw.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-111.94, 33.4255), 4326)::geography, 'Tempe, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'sarah.whitfield@toolshare-demo.app'),
    'Milwaukee M18 Impact Driver', 'Barely used and kept in excellent condition. Cleaned and checked before every rental.', 1, 'like_new'::tool_condition,
    22, 121, 70, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/impact-driver.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-111.8413, 33.3062), 4326)::geography, 'Chandler, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'elena.rodriguez@toolshare-demo.app'),
    '192-Piece Mechanic''s Socket Set', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 2, 'good'::tool_condition,
    15, 82, 50, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/socket-set.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-112.186, 33.5387), 4326)::geography, 'Glendale, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'tom.nguyen@toolshare-demo.app'),
    'Ridgid 24" Pipe Wrench Pair', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 2, 'good'::tool_condition,
    12, 66, 40, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/pipe-wrench.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-112.074, 33.4484), 4326)::geography, 'Phoenix, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'mike.harrison@toolshare-demo.app'),
    'Framing Hammer & Nail Bar Kit', 'Older but reliable. Cosmetic wear, no performance issues.', 2, 'fair'::tool_condition,
    9, 50, 25, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/hammer-tools.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-111.789, 33.3528), 4326)::geography, 'Gilbert, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'elena.rodriguez@toolshare-demo.app'),
    'Heavy-Duty Rear-Tine Garden Tiller', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 3, 'good'::tool_condition,
    45, 248, 150, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/garden-tiller.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-112.2374, 33.5806), 4326)::geography, 'Peoria, AZ',
    true, true,
    20, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'sarah.whitfield@toolshare-demo.app'),
    'Honda Self-Propelled Lawn Mower', 'Barely used and kept in excellent condition. Cleaned and checked before every rental.', 3, 'like_new'::tool_condition,
    35, 192, 120, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/lawn-mower.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-111.9261, 33.4942), 4326)::geography, 'Scottsdale, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'tom.nguyen@toolshare-demo.app'),
    'Stihl Gas Hedge Trimmer', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 3, 'good'::tool_condition,
    26, 143, 80, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/hedge-trimmer.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-112.368, 33.6292), 4326)::geography, 'Surprise, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'mike.harrison@toolshare-demo.app'),
    '9 cu ft Towable Concrete Mixer', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 4, 'good'::tool_condition,
    75, 412, 250, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/concrete-mixer.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-112.5838, 33.3703), 4326)::geography, 'Buckeye, AZ',
    true, true,
    30, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'david.chen@toolshare-demo.app'),
    'Plate Compactor (5500 lb force)', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 4, 'good'::tool_condition,
    68, 374, 200, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/plate-compactor.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-111.8315, 33.4152), 4326)::geography, 'Mesa, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'elena.rodriguez@toolshare-demo.app'),
    '14" Walk-Behind Concrete Saw', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 4, 'good'::tool_condition,
    95, 522, 300, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/concrete-saw.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-112.074, 33.4484), 4326)::geography, 'Phoenix, AZ',
    true, false,
    0, '{}'::jsonb,
    'Wet-cut only. Eye and hearing protection required.', 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'tom.nguyen@toolshare-demo.app'),
    '3-Ton Floor Jack + Jack Stands', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 5, 'good'::tool_condition,
    20, 110, 60, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/floor-jack.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-111.5496, 33.4151), 4326)::geography, 'Apache Junction, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'sarah.whitfield@toolshare-demo.app'),
    'Autel OBD2 Diagnostic Scanner', 'Barely used and kept in excellent condition. Cleaned and checked before every rental.', 5, 'like_new'::tool_condition,
    30, 165, 100, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/diagnostic-scanner.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-111.94, 33.4255), 4326)::geography, 'Tempe, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'mike.harrison@toolshare-demo.app'),
    '2-Ton Folding Engine Hoist', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 5, 'good'::tool_condition,
    55, 302, 180, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/engine-hoist.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-112.186, 33.5387), 4326)::geography, 'Glendale, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'david.chen@toolshare-demo.app'),
    '100 ft Drain Auger / Snake', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 6, 'good'::tool_condition,
    38, 209, 120, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/drain-auger.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-111.8413, 33.3062), 4326)::geography, 'Chandler, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'elena.rodriguez@toolshare-demo.app'),
    'Ridgid Pipe Threading Machine', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 6, 'good'::tool_condition,
    85, 468, 275, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/pipe-threader.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-112.074, 33.4484), 4326)::geography, 'Phoenix, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'david.chen@toolshare-demo.app'),
    '3200 PSI Gas Pressure Washer', 'Barely used and kept in excellent condition. Cleaned and checked before every rental.', 6, 'like_new'::tool_condition,
    30, 165, 110, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/pressure-washer.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-111.789, 33.3528), 4326)::geography, 'Gilbert, AZ',
    true, true,
    15, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'sarah.whitfield@toolshare-demo.app'),
    'Fluke 87V Digital Multimeter', 'Barely used and kept in excellent condition. Cleaned and checked before every rental.', 7, 'like_new'::tool_condition,
    18, 99, 90, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/multimeter.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-111.9261, 33.4942), 4326)::geography, 'Scottsdale, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'tom.nguyen@toolshare-demo.app'),
    'Greenlee Conduit Bender Set', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 7, 'good'::tool_condition,
    24, 132, 85, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/conduit-bender.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-111.8315, 33.4152), 4326)::geography, 'Mesa, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'mike.harrison@toolshare-demo.app'),
    '240 ft Steel Fish Tape Kit', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 7, 'good'::tool_condition,
    14, 77, 45, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/fish-tape.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-112.2374, 33.5806), 4326)::geography, 'Peoria, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'elena.rodriguez@toolshare-demo.app'),
    '5x8 Enclosed Utility Trailer', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 8, 'good'::tool_condition,
    65, 358, 300, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/utility-trailer.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-112.368, 33.6292), 4326)::geography, 'Surprise, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'tom.nguyen@toolshare-demo.app'),
    '18 ft Car Hauler Trailer', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 8, 'good'::tool_condition,
    95, 522, 400, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/car-trailer.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-112.5838, 33.3703), 4326)::geography, 'Buckeye, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'mike.harrison@toolshare-demo.app'),
    '7x12 Hydraulic Dump Trailer', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 8, 'good'::tool_condition,
    145, 798, 600, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/dump-trailer.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-112.074, 33.4484), 4326)::geography, 'Phoenix, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'david.chen@toolshare-demo.app'),
    '19 ft Electric Scissor Lift', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 9, 'good'::tool_condition,
    185, 1018, 750, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/scissor-lift.jpg'],
    true, 'OSHA 1926.453 aerial lift certification',
    21, true,
    ST_SetSRID(ST_MakePoint(-112.074, 33.4484), 4326)::geography, 'Phoenix, AZ',
    true, true,
    40, '{}'::jsonb,
    'Operator certification required. Harness provided.', 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'elena.rodriguez@toolshare-demo.app'),
    '34 ft Towable Boom Lift', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 9, 'good'::tool_condition,
    265, 1458, 1000, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/boom-lift.jpg'],
    true, 'OSHA 1926.453 aerial lift certification',
    21, true,
    ST_SetSRID(ST_MakePoint(-111.8315, 33.4152), 4326)::geography, 'Mesa, AZ',
    true, true,
    40, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'sarah.whitfield@toolshare-demo.app'),
    'Lincoln 180 Amp MIG Welder', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 10, 'good'::tool_condition,
    58, 319, 200, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/mig-welder.jpg'],
    false, NULL,
    21, true,
    ST_SetSRID(ST_MakePoint(-111.94, 33.4255), 4326)::geography, 'Tempe, AZ',
    true, false,
    0, '{}'::jsonb,
    'Auto-darkening helmet and gloves included.', 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'mike.harrison@toolshare-demo.app'),
    'Hypertherm 45 Plasma Cutter', 'Barely used and kept in excellent condition. Cleaned and checked before every rental.', 10, 'like_new'::tool_condition,
    88, 484, 300, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/plasma-cutter.jpg'],
    false, NULL,
    21, true,
    ST_SetSRID(ST_MakePoint(-111.8413, 33.3062), 4326)::geography, 'Chandler, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0),
(
    (SELECT id FROM auth.users WHERE email = 'tom.nguyen@toolshare-demo.app'),
    'Welding Helmet & Safety Kit', 'Well maintained and fully functional with normal signs of use. Everything works as it should.', 10, 'good'::tool_condition,
    16, 88, 50, ARRAY['https://pfmytliqqyzewlmhmwpr.supabase.co/storage/v1/object/public/tools/demo/welding-helmet.jpg'],
    false, NULL,
    18, true,
    ST_SetSRID(ST_MakePoint(-112.186, 33.5387), 4326)::geography, 'Glendale, AZ',
    true, false,
    0, '{}'::jsonb,
    NULL, 0, 0);

COMMIT;
