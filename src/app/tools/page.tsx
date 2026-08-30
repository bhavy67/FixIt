import type { Metadata } from 'next';
import { TOOLS_META } from '@/tools/meta';
import { toolCategories } from '@/lib/site-config';
import { ToolsIndexClient } from '@/components/tools/tools-index-client';

export const metadata: Metadata = {
  title: 'All tools',
  description: `Every Fixit tool. ${TOOLS_META.length} local-first browser utilities — nothing uploaded, nothing installed.`,
  openGraph: {
    title: 'All tools · Fixit',
    description: 'Local-first browser utilities for annoying file operations.',
    type: 'website',
  },
};

export default function ToolsIndexPage() {
  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">All tools</h1>
        <p className="text-muted-foreground text-sm mb-8">
          {TOOLS_META.length} tools, all running locally in your browser.
        </p>
        <ToolsIndexClient tools={TOOLS_META} categories={toolCategories} />
      </div>
    </main>
  );
}
