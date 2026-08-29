'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatBytes } from '@/lib/format-bytes';
import { useFilesStore } from '@/stores/files-store';
import { FileKindIcon, fileKindLabel } from './file-kind-icon';

export function FileList() {
  const files = useFilesStore((s) => s.files);
  const remove = useFilesStore((s) => s.remove);

  if (files.length === 0) return null;

  return (
    <ul
      className="divide-border border-border bg-card divide-y overflow-hidden rounded-xl border"
      aria-label="Selected files"
    >
      {files.map((f) => (
        <li key={f.id} className="flex items-center gap-3 p-3 text-left sm:p-4">
          <FileKindIcon kind={f.kind} className="size-9 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" title={f.name}>
              {f.name}
            </p>
            <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
              <Badge variant="secondary" className="text-[10px] tracking-wider uppercase">
                {fileKindLabel(f.kind)}
              </Badge>
              <span>{formatBytes(f.sizeBytes)}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => remove(f.id)}
            aria-label={`Remove ${f.name}`}
          >
            <X className="size-4" aria-hidden />
          </Button>
        </li>
      ))}
    </ul>
  );
}
