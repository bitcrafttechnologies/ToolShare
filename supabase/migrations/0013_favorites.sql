CREATE TABLE favorites (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, tool_id)
);

CREATE INDEX favorites_tool_id_idx ON favorites(tool_id);

-- Table-level privileges. `supabase db reset` applies these via default
-- privileges, but a migration pasted into the dashboard SQL editor does not
-- inherit them — without these every request fails with 42501.
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);
