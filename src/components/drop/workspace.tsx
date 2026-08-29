'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFilesStore } from '@/stores/files-store';
import { ToolPicker } from '@/components/tools/tool-picker';
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
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 text-left">
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
      <ToolPicker />
      <DropZone compact />
    </div>
  );
}
