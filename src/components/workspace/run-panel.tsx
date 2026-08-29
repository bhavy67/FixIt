'use client';

import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useJobStore } from '@/stores/job-store';

type Props = {
  toolName: string;
};

export function RunPanel({ toolName }: Props) {
  const progress = useJobStore((s) => s.progress);
  const cancel = useJobStore((s) => s.cancel);
  const pct = Math.round(progress * 100);

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-6 text-center">
      <div className="text-primary inline-flex items-center justify-center">
        <Loader2 className="size-6 animate-spin" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-medium">Running {toolName}…</p>
        <p className="text-muted-foreground mt-1 text-xs">Processing locally in your browser.</p>
      </div>
      <div
        className="bg-muted h-1.5 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-label={`${toolName} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-200 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-muted-foreground text-xs tabular-nums">{pct}%</div>
      <Button variant="outline" size="sm" onClick={cancel} className="mx-auto">
        <X className="size-4" aria-hidden />
        Cancel
      </Button>
    </div>
  );
}
