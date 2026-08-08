import type { Tool } from '@toolshare/types';

/**
 * Wraps a tool query so a backend failure is distinguishable from a genuinely
 * empty result.
 *
 * The home and search pages both used to `.catch(() => [])`, which rendered
 * the same "No tools matched" empty state whether the RPC returned nothing or
 * threw. That is a large part of why TKT-00003 (every app-created listing
 * missing from search) survived live testing: the page looked calm and simply
 * reported no results.
 *
 * Still degrades to an empty list rather than throwing — one bad query
 * shouldn't 500 the whole home page — but the caller now knows, and can say so.
 */
export async function loadTools(
  fetchTools: () => Promise<Tool[]>,
): Promise<{ tools: Tool[]; failed: boolean }> {
  try {
    return { tools: await fetchTools(), failed: false };
  } catch (err) {
    console.error('[toolshare] tool search failed:', err);
    return { tools: [], failed: true };
  }
}
