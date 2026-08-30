'use client';

import { X } from 'lucide-react';
import { formatBytes } from '@/lib/format-bytes';
import type { InspectedFile } from '@/core/file-types';
import { FileKindIcon } from './file-kind-icon';

type CompactFileRowProps = {
  f: InspectedFile;
  onRemove?: () => void;
  dimmed?: boolean;
};

function CompactFileRow({ f, onRemove, dimmed = false }: CompactFileRowProps) {
  return (
    <div className={`flex items-center gap-2 py-1.5 ${dimmed ? 'opacity-50' : ''}`}>
      <FileKindIcon kind={f.kind} className="size-4 shrink-0" />
      <span className="flex-1 text-xs font-medium truncate" title={f.name}>
        {f.name}
      </span>
      {f.kind !== 'unknown' && (
        <span className="text-[10px] font-medium uppercase text-muted-foreground shrink-0">
          {f.kind === 'pdf' ? 'PDF' : f.kind === 'image' ? f.ext.toUpperCase() : f.kind.toUpperCase()}
        </span>
      )}
      <span className="text-[10px] text-muted-foreground shrink-0">
        {formatBytes(f.sizeBytes)}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${f.name}`}
          className="shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-150"
        >
          <X className="size-3" aria-hidden />
        </button>
      )}
    </div>
  );
}

type CompactFileListProps = {
  files: readonly InspectedFile[];
  onRemove?: (id: string) => void;
  dimmed?: boolean;
};

export function CompactFileList({ files, onRemove, dimmed = false }: CompactFileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-col px-3" aria-label="Selected files">
      {files.map((f) => (
        <CompactFileRow
          key={f.id}
          f={f}
          onRemove={onRemove ? () => onRemove(f.id) : undefined}
          dimmed={dimmed}
        />
      ))}
    </div>
  );
}
