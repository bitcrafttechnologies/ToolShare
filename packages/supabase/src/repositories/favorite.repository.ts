import type { SupabaseClient } from '@supabase/supabase-js';
import type { Tool } from '@toolshare/types';

// The owner embed MUST name the FK (`!tools_owner_id_fkey`): going
// favorites → tools → profiles, PostgREST otherwise finds two candidate
// paths to profiles and returns 300 PGRST201 (ambiguous), so the whole
// query fails and the saved-tools list silently shows empty. This bit both
// web /favorites and the mobile saved-favorites screen.
const FAVORITE_TOOL_SELECT =
  'tool:tools(*, owner:profiles!tools_owner_id_fkey(id, display_name, avatar_url, is_identity_verified), category:categories(id, name, slug, icon_name))';

export function createFavoriteRepository(supabase: SupabaseClient) {
  return {
    async listFavoriteToolIds(userId: string): Promise<string[]> {
      const { data, error } = await supabase
        .from('favorites')
        .select('tool_id')
        .eq('user_id', userId);
      if (error) throw error;
      return (data ?? []).map((row) => row.tool_id as string);
    },

    async listFavoriteTools(userId: string): Promise<Tool[]> {
      const { data, error } = await supabase
        .from('favorites')
        .select(FAVORITE_TOOL_SELECT)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).flatMap((row) => (row.tool ? [row.tool as unknown as Tool] : []));
    },

    async add(userId: string, toolId: string): Promise<void> {
      const { error } = await supabase
        .from('favorites')
        .upsert({ user_id: userId, tool_id: toolId }, { onConflict: 'user_id,tool_id' });
      if (error) throw error;
    },

    async remove(userId: string, toolId: string): Promise<void> {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('tool_id', toolId);
      if (error) throw error;
    },
  };
}

export type FavoriteRepository = ReturnType<typeof createFavoriteRepository>;
