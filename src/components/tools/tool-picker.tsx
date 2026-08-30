'use client';

import { useMemo, useState } from 'react';
import { ChevronRight, PackageOpen, Search } from 'lucide-react';
import { matchToolsForFiles } from '@/core/tool-registry';
import type { ToolDefinition } from '@/core/tool-types';
import { useFilesStore } from '@/stores/files-store';
import { toolCategories } from '@/lib/site-config';
import { cn } from '@/lib/cn';
// Side-effect import: triggers tool registration on module load.
import '@/tools';

const categoryLabel = (slug: string) => toolCategories.find((c) => c.slug === slug)?.label ?? slug;

const categoryDot: Record<string, string> = {
  pdf: 'bg-blue-500',
  'pdf-security': 'bg-violet-500',
  image: 'bg-amber-500',
  data: 'bg-emerald-500',
  text: 'bg-slate-400',
};

type ToolPickerProps = {
  onPick?: (tool: ToolDefinition<unknown>) => void;
};

type ToolCardProps = {
  tool: ToolDefinition<unknown>;
  onClick: () => void;
};

function ToolCard({ tool, onClick }: ToolCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-tool-id={tool.id}
      className={cn(
        'group relative flex flex-col gap-1 rounded-xl border border-border bg-card p-3 text-left',
        'transition-all duration-150 hover:shadow-sm hover:border-primary/20 w-full',
        'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      )}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <span
          className={cn(
            'size-1.5 rounded-full shrink-0',
            categoryDot[tool.category] ?? 'bg-slate-400',
          )}
        />
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {categoryLabel(tool.category)}
        </span>
      </div>
      <p className="text-sm font-semibold leading-snug">{tool.name}</p>
      <p className="text-xs text-muted-foreground line-clamp-1">{tool.tagline}</p>
      <ChevronRight
        className={cn(
          'absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5',
          'text-muted-foreground opacity-0 group-hover:opacity-60',
          'transition-all duration-150 group-hover:translate-x-0.5',
        )}
        aria-hidden
      />
    </button>
  );
}

export function ToolPicker({ onPick }: ToolPickerProps = {}) {
  const files = useFilesStore((s) => s.files);
  const matches = useMemo(() => matchToolsForFiles(files), [files]);
  const [query, setQuery] = useState('');

  if (files.length === 0) return null;

  const filtered = query.trim()
    ? matches.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.tagline.toLowerCase().includes(query.toLowerCase()) ||
          categoryLabel(t.category).toLowerCase().includes(query.toLowerCase()),
      )
    : matches;

  return (
    <div className="flex flex-col h-full" aria-label="Available tools">
      {/* Search bar */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Search className="size-4 text-muted-foreground shrink-0" aria-hidden />
        <input
          placeholder="Search tools…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Search tools"
        />
      </div>

      {/* Tool grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {matches.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center"
            data-testid="tool-picker-empty"
          >
            <div className="rounded-xl bg-muted p-4">
              <PackageOpen className="size-6 text-muted-foreground" aria-hidden />
            </div>
            <p className="text-sm font-medium">No tools for these files</p>
            <p className="text-muted-foreground text-xs max-w-xs">
              Try a different combination or drop other file types
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center">
            <div className="rounded-xl bg-muted p-4">
              <PackageOpen className="size-6 text-muted-foreground" aria-hidden />
            </div>
            <p className="text-sm font-medium">No matching tools</p>
            <p className="text-muted-foreground text-xs max-w-xs">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
            {filtered.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onClick={() => onPick?.(tool)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
