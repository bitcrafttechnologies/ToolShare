CREATE TABLE project_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category_ids INT[] DEFAULT '{}'
);

CREATE TABLE project_type_tools (
    project_type_id INT REFERENCES project_types(id) ON DELETE CASCADE,
    tool_title_suggestion TEXT NOT NULL,
    PRIMARY KEY (project_type_id, tool_title_suggestion)
);

INSERT INTO project_types (name, slug, description, category_ids) VALUES
    ('Building a Deck',      'deck',        'Outdoor deck construction',              ARRAY[1, 2]),
    ('Landscaping/Yard',     'landscaping', 'Yard work and landscaping',              ARRAY[3]),
    ('Concrete/Masonry',     'concrete',    'Pouring concrete or masonry work',       ARRAY[4]),
    ('Electrical Work',      'electrical',  'Electrical wiring or panel work',        ARRAY[7]),
    ('Plumbing Repair',      'plumbing',    'Pipe installation or repair',            ARRAY[6]),
    ('Auto Repair',          'auto',        'Vehicle maintenance and repair',         ARRAY[5]),
    ('Roofing',              'roofing',     'Roof repair or replacement',             ARRAY[1, 9]),
    ('Painting/Drywall',     'painting',    'Interior or exterior painting',          ARRAY[1, 2]),
    ('Fencing',              'fencing',     'Installing or repairing fences',         ARRAY[1, 2]),
    ('Irrigation/Sprinklers','irrigation',  'Installing or repairing irrigation',     ARRAY[3, 6]);

INSERT INTO project_type_tools (project_type_id, tool_title_suggestion) VALUES
    (1, 'Circular Saw'), (1, 'Drill'), (1, 'Nail Gun'), (1, 'Level'), (1, 'Miter Saw'),
    (2, 'Lawn Mower'), (2, 'Edger'), (2, 'Leaf Blower'), (2, 'Hedge Trimmer'),
    (3, 'Concrete Mixer'), (3, 'Float'), (3, 'Vibrator'), (3, 'Compactor'),
    (4, 'Wire Stripper'), (4, 'Conduit Bender'), (4, 'Multimeter'),
    (5, 'Pipe Wrench'), (5, 'Pipe Cutter'), (5, 'Drain Snake'),
    (6, 'Jack Stands'), (6, 'Floor Jack'), (6, 'OBD Scanner'),
    (7, 'Roofing Nailer'), (7, 'Scaffolding'), (7, 'Safety Harness'), (7, 'Lift'),
    (8, 'Paint Sprayer'), (8, 'Drywall Sander'), (8, 'Drywall Lift'),
    (9, 'Post Pounder'), (9, 'Post Hole Digger'), (9, 'Wire Stretcher'),
    (10, 'Trencher'), (10, 'Pipe Bender'), (10, 'PVC Cutter');

ALTER TABLE project_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_type_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project types are viewable by everyone"
    ON project_types FOR SELECT USING (true);
CREATE POLICY "Project type tools are viewable by everyone"
    ON project_type_tools FOR SELECT USING (true);
