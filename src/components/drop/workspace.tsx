'use client';

import { Trash2, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFilesStore } from '@/stores/files-store';
import { DropZone } from './drop-zone';
import { FileList } from './file-list';

export function Workspace() {
  const count = useFilesStore((s) => s.files.length);
  const clear = useFilesStore((s) => s.clear);

  if (count === 0) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <DropZone />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3 text-left">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {count} file{count === 1 ? '' : 's'} ready
        </p>
        <Button variant="ghost" size="sm" onClick={clear}>
          <Trash2 className="size-4" aria-hidden />
          Clear all
        </Button>
      </div>
      <FileList />
      <DropZone compact />
      <div className="border-border bg-muted/40 text-muted-foreground mt-1 flex items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-xs">
        <Wrench className="size-3.5" aria-hidden />
        Tool picker arrives in Phase 4.
      </div>
    </div>
  );
}
