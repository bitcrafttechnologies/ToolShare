import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { EditTool } from '@/components/EditTool';

export const metadata: Metadata = { title: 'Edit listing' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ToolEditPage({ params }: Props) {
  const { id } = await params;

  return (
    <>
      <SiteHeader />
      <main className="w-full mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <EditTool toolId={id} />
      </main>
    </>
  );
}
