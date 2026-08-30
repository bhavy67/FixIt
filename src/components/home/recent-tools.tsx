'use client';

import Link from 'next/link';
import { usePreferencesStore } from '@/stores/preferences-store';
import { TOOLS_META } from '@/tools/meta';
import { cn } from '@/lib/cn';

const categoryDot: Record<string, string> = {
  pdf: 'bg-blue-500',
  'pdf-security': 'bg-violet-500',
  image: 'bg-amber-500',
  data: 'bg-emerald-500',
  text: 'bg-slate-400',
};

export function RecentTools() {
  const recentIds = usePreferencesStore((s) => s.recentToolIds);

  const recentTools = recentIds
    .map((id) => TOOLS_META.find((t) => t.id === id))
    .filter((t) => t !== undefined);

  if (recentTools.length === 0) return null;

  return (
    <section className="px-4 pb-6 mt-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Recent
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {recentTools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="shrink-0 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2
                text-xs font-medium hover:border-primary/30 hover:shadow-sm transition-all duration-150"
            >
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  categoryDot[tool.category] ?? 'bg-muted-foreground',
                )}
              />
              {tool.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
