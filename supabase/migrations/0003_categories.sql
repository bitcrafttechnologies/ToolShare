CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon_name TEXT,
    sort_order INT DEFAULT 0
);

INSERT INTO categories (name, slug, icon_name, sort_order) VALUES
    ('Power Tools',      'power-tools',    'power_rounded',         1),
    ('Hand Tools',       'hand-tools',     'build_rounded',         2),
    ('Landscaping',      'landscaping',    'yard_rounded',          3),
    ('Concrete/Masonry', 'concrete',       'foundation_rounded',    4),
    ('Automotive',       'automotive',     'car_repair_rounded',    5),
    ('Plumbing',         'plumbing',       'plumbing_rounded',      6),
    ('Electrical',       'electrical',     'electrical_services',   7),
    ('Trailers/Hauling', 'trailers',       'local_shipping_rounded',8),
    ('Aerial/Lifts',     'aerial',         'height_rounded',        9),
    ('Welding',          'welding',        'whatshot_rounded',     10);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
