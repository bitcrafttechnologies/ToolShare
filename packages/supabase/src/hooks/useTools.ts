import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createToolRepository, type ToolUpdate } from '../repositories/tool.repository';
import { toolKeys, type ToolSearchParams } from '../queryKeys';
import type { CreateToolInput } from '@toolshare/types';

export function useTools(supabase: SupabaseClient, params: ToolSearchParams) {
  const repo = createToolRepository(supabase);
  return useQuery({
    queryKey: toolKeys.list(params),
    queryFn: () => repo.getTools(params),
    staleTime: 60_000,
  });
}

export function useTool(supabase: SupabaseClient, id: string) {
  const repo = createToolRepository(supabase);
  return useQuery({
    queryKey: toolKeys.detail(id),
    queryFn: () => repo.getToolById(id),
    staleTime: 30_000,
  });
}

export function useToolsByOwner(supabase: SupabaseClient, ownerId: string) {
  const repo = createToolRepository(supabase);
  return useQuery({
    queryKey: toolKeys.byOwner(ownerId),
    queryFn: () => repo.getToolsByOwner(ownerId),
    enabled: !!ownerId,
  });
}

export function useBlockedDates(supabase: SupabaseClient, toolId: string) {
  const repo = createToolRepository(supabase);
  return useQuery({
    queryKey: toolKeys.blockedDates(toolId),
    queryFn: () => repo.getBlockedDates(toolId),
    staleTime: 30_000,
  });
}

export function useCreateBlockedDate(supabase: SupabaseClient, toolId: string) {
  const repo = createToolRepository(supabase);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ startDate, endDate, reason }: { startDate: string; endDate: string; reason?: string }) =>
      repo.createBlockedDate(toolId, startDate, endDate, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: toolKeys.blockedDates(toolId) });
      void qc.invalidateQueries({ queryKey: toolKeys.detail(toolId) });
    },
  });
}

export function useDeleteBlockedDate(supabase: SupabaseClient, toolId: string) {
  const repo = createToolRepository(supabase);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repo.deleteBlockedDate(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: toolKeys.blockedDates(toolId) });
      void qc.invalidateQueries({ queryKey: toolKeys.detail(toolId) });
    },
  });
}

export function useCategories(supabase: SupabaseClient) {
  const repo = createToolRepository(supabase);
  return useQuery({
    queryKey: toolKeys.categories(),
    queryFn: () => repo.getCategories(),
    staleTime: 5 * 60_000,
  });
}

export function useCreateTool(supabase: SupabaseClient) {
  const repo = createToolRepository(supabase);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateToolInput) => repo.createTool(input),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: toolKeys.byOwner(variables.owner_id) });
      void qc.invalidateQueries({ queryKey: toolKeys.lists() });
    },
  });
}

export function useUpdateTool(supabase: SupabaseClient, ownerId: string) {
  const repo = createToolRepository(supabase);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ToolUpdate }) =>
      repo.updateTool(id, updates),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: toolKeys.byOwner(ownerId) });
      void qc.invalidateQueries({ queryKey: toolKeys.lists() });
      void qc.invalidateQueries({ queryKey: toolKeys.detail(id) });
    },
  });
}

export function useDeleteTool(supabase: SupabaseClient, ownerId: string) {
  const repo = createToolRepository(supabase);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repo.deleteTool(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: toolKeys.byOwner(ownerId) });
      void qc.invalidateQueries({ queryKey: toolKeys.lists() });
    },
  });
}
