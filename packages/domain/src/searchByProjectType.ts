import type { Tool, ProjectType } from '@toolshare/types';

export interface SearchByProjectTypeParams {
  projectSlug: string;
  projectTypes: ProjectType[];
  fetchToolsByCategory: (categoryId: number) => Promise<Tool[]>;
}

export async function searchByProjectType({
  projectSlug,
  projectTypes,
  fetchToolsByCategory,
}: SearchByProjectTypeParams): Promise<Tool[]> {
  const project = projectTypes.find((p) => p.slug === projectSlug);
  if (!project) return [];

  const results = await Promise.all(
    project.category_ids.map((id) => fetchToolsByCategory(id)),
  );

  const seen = new Set<string>();
  const tools: Tool[] = [];
  for (const batch of results) {
    for (const tool of batch) {
      if (!seen.has(tool.id)) {
        seen.add(tool.id);
        tools.push(tool);
      }
    }
  }

  return tools.sort((a, b) => b.rating - a.rating);
}
