'use client';

import { useMemo } from 'react';
import { Wrench, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { matchToolsForFiles } from '@/core/tool-registry';
import type { ToolDefinition } from '@/core/tool-types';
import { useFilesStore } from '@/stores/files-store';
import { toolCategories } from '@/lib/site-config';
// Side-effect import: triggers tool registration on module load.
import '@/tools';

const categoryLabel = (slug: string) => toolCategories.find((c) => c.slug === slug)?.label ?? slug;

type ToolPickerProps = {
  onPick?: (tool: ToolDefinition<unknown>) => void;
};

export function ToolPicker({ onPick }: ToolPickerProps = {}) {
  const files = useFilesStore((s) => s.files);
  const matches = useMemo(() => matchToolsForFiles(files), [files]);

  if (files.length === 0) return null;

  if (matches.length === 0) {
    return (
      <div
        className="border-border bg-muted/40 text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center text-sm"
        data-testid="tool-picker-empty"
      >
        <Wrench className="size-5" aria-hidden />
        <p className="text-foreground font-medium">No tools for these files yet</p>
        <p className="max-w-sm text-xs">
          No registered tool accepts this combination of files. Try adjusting the selection.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" aria-label="Available tools">
      <p className="text-muted-foreground text-sm">What would you like to do?</p>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {matches.map((tool) => (
          <li key={tool.id}>
            <button
              type="button"
              onClick={() => onPick?.(tool)}
              data-tool-id={tool.id}
              className="group border-border bg-card hover:border-primary/50 focus-visible:ring-ring focus-visible:ring-offset-background flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <div className="min-w-0">
                <Badge
                  variant="outline"
                  className="mb-1 text-[10px] font-normal tracking-wider uppercase"
                >
                  {categoryLabel(tool.category)}
                </Badge>
                <p className="truncate text-sm font-medium">{tool.name}</p>
                <p className="text-muted-foreground truncate text-xs">{tool.tagline}</p>
              </div>
              <ArrowRight
                className="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
