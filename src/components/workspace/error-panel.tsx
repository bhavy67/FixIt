'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  message: string;
  onRetry: () => void;
  onReset: () => void;
};

export function ErrorPanel({ message, onRetry, onReset }: Props) {
  return (
    <div className="border-destructive/40 bg-destructive/5 flex flex-col items-start gap-3 rounded-xl border p-4">
      <div className="flex items-start gap-3">
        <span className="bg-destructive/10 text-destructive inline-flex size-8 shrink-0 items-center justify-center rounded-full">
          <AlertTriangle className="size-4" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">Something went wrong</p>
          <p className="text-muted-foreground mt-1 text-xs">{message}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onRetry}>
          <RotateCcw className="size-4" aria-hidden />
          Try again
        </Button>
        <Button size="sm" variant="outline" onClick={onReset}>
          Start over
        </Button>
      </div>
    </div>
  );
}
