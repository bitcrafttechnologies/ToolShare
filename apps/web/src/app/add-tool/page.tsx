'use client';

import { useRouter } from 'next/navigation';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';
import { SiteHeader } from '@/components/SiteHeader';
import { ToolForm, type ToolFormValues } from '@/components/ToolForm';

const { Spinner } = Components;

export default function AddToolPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const user = useSessionUser();

  // /add-tool is middleware-protected, so null here means the session is
  // still resolving rather than signed-out.
  if (!user) {
    return (
      <>
        <SiteHeader />
        <div className="flex justify-center py-24">
          <Spinner />
          <span className="sr-only">Loading…</span>
        </div>
      </>
    );
  }

  async function handleSubmit(values: ToolFormValues) {
    const { data, error } = await supabase
      .from('tools')
      .insert({ owner_id: user!.id, ...values, is_available: true })
      .select('id')
      .single();
    if (error) throw error;
    // Land on the new listing — the owner usually wants to see what they published.
    router.push(data?.id ? `/tools/${data.id as string}` : '/my-listings');
  }

  return (
    <>
      <SiteHeader />
      <main className="w-full mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Lend a tool</h1>
        <p className="mt-2 text-muted-foreground">
          List a tool for neighbors across the Phoenix metro to rent.
        </p>
        <ToolForm userId={user.id} submitLabel="List my tool" onSubmit={handleSubmit} />
      </main>
    </>
  );
}
