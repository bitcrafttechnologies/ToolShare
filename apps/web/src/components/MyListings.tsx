'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ImageOff, Plus, Trash2 } from 'lucide-react';
import { useToolsByOwner, useDeleteTool } from '@toolshare/supabase';
import type { Tool } from '@toolshare/types';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';

const { Button, EmptyState, Spinner, Badge, Dialog, Alert } = Components;

export function MyListings() {
  const supabase = getSupabaseBrowserClient();
  const user = useSessionUser();
  const { data: tools, isLoading } = useToolsByOwner(supabase, user?.id ?? '');
  const deleteTool = useDeleteTool(supabase, user?.id ?? '');
  const [pendingDelete, setPendingDelete] = useState<Tool | null>(null);

  if (!user) {
    return (
      <EmptyState
        title="Sign in to manage listings"
        description="Your tools and their availability live here."
        action={
          <Link
            href="/login?next=/my-listings"
            className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            Sign in
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Your listings</h1>
          <p className="mt-2 text-muted-foreground">
            {tools?.length
              ? `${tools.length} ${tools.length === 1 ? 'tool' : 'tools'} listed`
              : 'Tools you lend to the neighborhood.'}
          </p>
        </div>
        <Link href="/add-tool">
          <Button>
            <Plus size={16} aria-hidden="true" />
            Add tool
          </Button>
        </Link>
      </div>

      {deleteTool.isError ? (
        <Alert variant="danger" className="mt-6">
          {deleteTool.error instanceof Error
            ? deleteTool.error.message
            : "Couldn't remove that listing."}
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Spinner />
          <span className="sr-only">Loading listings…</span>
        </div>
      ) : !tools?.length ? (
        <EmptyState
          className="mt-8"
          title="No listings yet"
          description="List a tool and neighbors across the Phoenix metro can rent it."
          action={
            <Link
              href="/add-tool"
              className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
            >
              List your first tool
            </Link>
          }
        />
      ) : (
        <ul className="mt-8 flex list-none flex-col gap-3 pl-0">
          {tools.map((tool) => (
            <li
              key={tool.id}
              className="flex items-center gap-4 rounded-md border border-border bg-surface p-3"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-sm bg-surface-muted">
                {tool.photo_urls[0] ? (
                  <Image
                    src={tool.photo_urls[0]}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ImageOff size={20} aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/tools/${tool.id}`}
                  className="truncate font-heading font-semibold text-foreground hover:text-primary"
                >
                  {tool.title}
                </Link>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {tool.daily_rate != null ? `$${tool.daily_rate}/day` : 'No price set'}
                  {tool.review_count > 0 ? ` · ★ ${tool.rating.toFixed(1)}` : ''}
                </p>
                <div className="mt-1.5">
                  <Badge variant={tool.is_available ? 'success' : 'neutral'}>
                    {tool.is_available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <Link href={`/tools/${tool.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${tool.title}`}
                  onClick={() => setPendingDelete(tool)}
                >
                  <Trash2 size={16} className="text-danger-600" aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Deleting a listing is irreversible and the row is one click from
          "Edit", so it gets a confirmation rather than firing immediately. */}
      <Dialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete this listing?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" will be removed permanently. Existing bookings are not cancelled automatically.`
            : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Keep listing
            </Button>
            <Button
              variant="destructive"
              isLoading={deleteTool.isPending}
              onClick={() => {
                if (!pendingDelete) return;
                deleteTool.mutate(pendingDelete.id, {
                  onSuccess: () => setPendingDelete(null),
                });
              }}
            >
              Delete
            </Button>
          </>
        }
      />
    </div>
  );
}
