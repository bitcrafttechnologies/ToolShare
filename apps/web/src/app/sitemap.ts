import { createStaticSupabaseClient } from '@/lib/supabase/server';
import type { MetadataRoute } from 'next';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Revalidated static route — no request, so no cookies. The sitemap is
  // public by definition, so the anon client is the right level of access.
  const supabase = createStaticSupabaseClient();
  const { data: tools } = await supabase
    .from('tools')
    .select('id, updated_at')
    .eq('is_available', true);

  const toolUrls: MetadataRoute.Sitemap = (tools ?? []).map((tool) => ({
    url: `https://toolshare.app/tools/${tool.id as string}`,
    lastModified: (tool.updated_at as string | null) ?? new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    { url: 'https://toolshare.app', changeFrequency: 'daily', priority: 1 },
    { url: 'https://toolshare.app/search', changeFrequency: 'hourly', priority: 0.9 },
    ...toolUrls,
  ];
}
