import type { Metadata } from 'next';
import { TOOLS_META } from '@/tools/meta';
import { toolCategories } from '@/lib/site-config';
import { ToolsIndexClient } from '@/components/tools/tools-index-client';

export const metadata: Metadata = {
  title: 'All tools',
  description: `Every FixIt tool. ${TOOLS_META.length} local-first browser utilities — nothing uploaded, nothing installed.`,
  openGraph: {
    title: 'All tools · FixIt',
    description: 'Local-first browser utilities for annoying file operations.',
    type: 'website',
  },
};

export default function ToolsIndexPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">All tools</h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-sm sm:text-base">
          Every FixIt tool runs locally in your browser. Nothing to install, nothing uploaded.
        </p>
      </header>

      <ToolsIndexClient tools={TOOLS_META} categories={toolCategories} />
    </main>
  );
}
