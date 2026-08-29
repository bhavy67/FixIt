'use client';

import { useState } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ToolDefinition } from '@/core/tool-types';
import { toolCategories } from '@/lib/site-config';

const categoryLabel = (slug: string) => toolCategories.find((c) => c.slug === slug)?.label ?? slug;

type Props = {
  tool: ToolDefinition<unknown>;
  onBack: () => void;
  onRun: (options: unknown) => void;
};

export function ConfigurePanel({ tool, onBack, onRun }: Props) {
  const [options, setOptions] = useState<unknown>(() => tool.defaultOptions);
  const OptionsForm = tool.OptionsForm;

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex w-fit items-center gap-1 rounded-md text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Choose a different tool
      </button>

      <div className="border-border bg-card flex items-start gap-3 rounded-xl border p-4">
        <div className="min-w-0 flex-1">
          <Badge
            variant="outline"
            className="mb-1 text-[10px] font-normal tracking-wider uppercase"
          >
            {categoryLabel(tool.category)}
          </Badge>
          <p className="text-base font-semibold">{tool.name}</p>
          <p className="text-muted-foreground text-xs">{tool.tagline}</p>
        </div>
      </div>

      {OptionsForm ? (
        <OptionsForm value={options} onChange={setOptions} />
      ) : (
        <p className="text-muted-foreground text-xs">This tool has no options.</p>
      )}

      <Button size="lg" onClick={() => onRun(options)}>
        <Play className="size-4" aria-hidden />
        Run {tool.name}
      </Button>
    </div>
  );
}
