import type { SupabaseClient } from '@supabase/supabase-js';
import type { Tool, ToolBundle, Category, ProjectType, BlockedDate, CreateToolInput, ServiceArea } from '@toolshare/types';
import type { ToolSearchParams } from '../queryKeys';

/**
 * Fields settable when editing a listing. Same shape as CreateToolInput but
 * every field is optional and nullable — an edit must be able to *clear* a
 * value (send null), which `Partial<CreateToolInput>` (undefined-only) can't
 * express. `owner_id` is intentionally excluded; ownership never changes.
 */
export type ToolUpdate = Partial<{
  [K in keyof Omit<CreateToolInput, 'owner_id'>]: CreateToolInput[K] | null;
}>;

// owner_rating/review_count_owner are needed by the detail screen's owner card —
// without them a rated owner is wrongly labelled "New to Toolshare".
const TOOL_SELECT =
  '*, owner:profiles!tools_owner_id_fkey(id, display_name, avatar_url, is_identity_verified, owner_rating, review_count_owner), category:categories(id, name, slug, icon_name)';

const todayISO = () => new Date().toISOString().slice(0, 10);

/** Tool ids that have a blocked_dates range (rental or blackout) covering today. */
async function blockedTodayIds(supabase: SupabaseClient, toolIds: string[]): Promise<Set<string>> {
  if (toolIds.length === 0) return new Set();
  const today = todayISO();
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('tool_id')
    .in('tool_id', toolIds)
    .lte('start_date', today)
    .gte('end_date', today);
  if (error) throw error;
  return new Set((data ?? []).map((r) => (r as { tool_id: string }).tool_id));
}

function withAvailability(tool: Tool, blockedToday: Set<string>): Tool {
  return { ...tool, available_now: tool.is_available !== false && !blockedToday.has(tool.id) };
}

export function createToolRepository(supabase: SupabaseClient) {
  return {
    async getTools(params: ToolSearchParams): Promise<Tool[]> {
      const { data, error } = await supabase.rpc('search_tools_nearby', {
        lat: params.lat,
        lng: params.lng,
        radius_miles: params.radiusMiles ?? 75,
        search_query: params.query ?? null,
        category_filter: params.categoryId ?? null,
      });
      if (error) throw error;

      const rows = (data ?? []) as Tool[];
      if (rows.length === 0) return [];

      // `search_tools_nearby` returns SETOF tools, so it cannot carry the owner
      // and category joins the cards need. Re-fetch the same ids with the
      // embeds and restore the RPC's distance/rating ordering.
      const ids = rows.map((t) => t.id);
      const { data: joined, error: joinError } = await supabase
        .from('tools')
        .select(TOOL_SELECT)
        .in('id', ids);
      if (joinError) throw joinError;

      const byId = new Map((joined as Tool[]).map((t) => [t.id, t]));
      const ordered = ids.flatMap((id) => {
        const tool = byId.get(id);
        return tool ? [tool] : [];
      });
      const blockedToday = await blockedTodayIds(supabase, ids);
      return ordered.map((t) => withAvailability(t, blockedToday));
    },

    async getToolById(id: string): Promise<Tool | null> {
      const { data, error } = await supabase
        .from('tools')
        .select(TOOL_SELECT)
        .eq('id', id)
        .single();
      if (error) throw error;
      const tool = data as Tool;
      const blockedToday = await blockedTodayIds(supabase, [tool.id]);
      return withAvailability(tool, blockedToday);
    },

    async getToolsByOwner(ownerId: string): Promise<Tool[]> {
      const { data, error } = await supabase
        .from('tools')
        .select(TOOL_SELECT)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const tools = data as Tool[];
      const blockedToday = await blockedTodayIds(supabase, tools.map((t) => t.id));
      return tools.map((t) => withAvailability(t, blockedToday));
    },

    async getCategories(): Promise<Category[]> {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },

    /** Phoenix-metro cities a listing can be placed in. Reference data; rarely changes. */
    async getServiceAreas(): Promise<ServiceArea[]> {
      const { data, error } = await supabase
        .from('service_areas')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as ServiceArea[];
    },

    async getProjectTypes(): Promise<ProjectType[]> {
      const { data, error } = await supabase.from('project_types').select('*');
      if (error) throw error;
      return data;
    },

    async getBlockedDates(toolId: string): Promise<BlockedDate[]> {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .eq('tool_id', toolId)
        .order('start_date', { ascending: true });
      if (error) throw error;
      return data;
    },

    /** Owner adds a manual blackout range. RLS lets owners manage their tools' dates. */
    async createBlockedDate(
      toolId: string,
      startDate: string,
      endDate: string,
      reason = 'Owner blackout',
    ): Promise<BlockedDate> {
      const { data, error } = await supabase
        .from('blocked_dates')
        .insert({ tool_id: toolId, start_date: startDate, end_date: endDate, reason })
        .select('*')
        .single();
      if (error) throw error;
      return data as BlockedDate;
    },

    /**
     * Removes a manual blackout. Scoped to `booking_id IS NULL` so an owner can
     * never delete a block that a confirmed rental created (that would let a
     * tool be double-booked).
     */
    async deleteBlockedDate(id: string): Promise<void> {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', id)
        .is('booking_id', null);
      if (error) throw error;
    },

    async createTool(input: CreateToolInput): Promise<Tool> {
      const { data, error } = await supabase
        .from('tools')
        .insert(input)
        .select(TOOL_SELECT)
        .single();
      if (error) throw error;
      return data as Tool;
    },

    async updateTool(id: string, updates: ToolUpdate): Promise<Tool> {
      const { data, error } = await supabase
        .from('tools')
        .update(updates)
        .eq('id', id)
        .select(TOOL_SELECT)
        .single();
      if (error) throw error;
      return data as Tool;
    },

    async deleteTool(id: string): Promise<void> {
      const { error } = await supabase.from('tools').delete().eq('id', id);
      if (error) throw error;
    },

    async getBundles(ownerId: string): Promise<ToolBundle[]> {
      const { data, error } = await supabase
        .from('tool_bundles')
        .select('*, tools(*), owner:profiles!tool_bundles_owner_id_fkey(id, display_name, avatar_url)')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ToolBundle[];
    },

    async incrementViewCount(toolId: string): Promise<void> {
      await supabase.rpc('increment_tool_views', { tool_id_param: toolId });
    },
  };
}

export type ToolRepository = ReturnType<typeof createToolRepository>;
