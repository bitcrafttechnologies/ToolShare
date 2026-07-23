-- Tightens what 0014's blanket `GRANT ALL ON ALL FUNCTIONS` handed out.
--
-- 0014 restored the table privileges the project was missing, but it also
-- granted EXECUTE on *every* function in `public` — including trigger-only
-- functions, which PostgREST then exposes as callable RPC endpoints
-- (/rest/v1/rpc/handle_new_user, etc). Nothing in the app calls them; only
-- `search_tools_nearby` and `increment_tool_views` are invoked from clients.
--
-- Verified before writing: no client code references these four.

REVOKE EXECUTE ON FUNCTION public.handle_new_user()            FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_block_dates()           FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_ratings_after_review() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column()   FROM anon, authenticated;

-- SECURITY DEFINER functions run as their owner, so a caller-controlled
-- search_path is a privilege-escalation vector. Pin it.
ALTER FUNCTION public.handle_new_user()             SET search_path = public, pg_temp;
ALTER FUNCTION public.auto_block_dates()            SET search_path = public, pg_temp;
ALTER FUNCTION public.update_ratings_after_review() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column()    SET search_path = public, pg_temp;
ALTER FUNCTION public.increment_tool_views(uuid)    SET search_path = public, pg_temp;
ALTER FUNCTION public.search_tools_nearby(float, float, float, text, int, int)
    SET search_path = public, pg_temp;
