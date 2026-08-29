'use client';

import { useState } from 'react';
import { Check, Download, RotateCcw, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/format-bytes';
import { downloadBlob } from '@/lib/download';
import { zipBlobs } from '@/lib/zip';
import type { ProcessingResult } from '@/core/tool-types';
import type { InspectedFile } from '@/core/file-types';
import { BeforeAfter } from './before-after';
import { TextPreview } from './text-preview';

type Props = {
  result: ProcessingResult;
  originalFiles: readonly InspectedFile[];
  onReset: () => void;
};

const isImageBlob = (blob: Blob) => blob.type.startsWith('image/');
const isTextishBlob = (blob: Blob) =>
  blob.type.startsWith('text/') ||
  blob.type === 'application/json' ||
  blob.type === 'application/xml';

export function ResultPanel({ result, originalFiles, onReset }: Props) {
  const [zipping, setZipping] = useState(false);
  const first = result.outputs[0];
  const firstOriginal = originalFiles[0];
  const showBeforeAfter =
    result.outputs.length === 1 &&
    originalFiles.length === 1 &&
    first !== undefined &&
    firstOriginal !== undefined &&
    isImageBlob(first.blob) &&
    firstOriginal.kind === 'image';
  const showTextPreview = !showBeforeAfter && first !== undefined && isTextishBlob(first.blob);

  return (
    <div className="flex flex-col gap-4">
      <div className="border-border bg-card flex items-center gap-3 rounded-xl border p-4">
        <span className="bg-primary text-primary-foreground inline-flex size-8 items-center justify-center rounded-full">
          <Check className="size-4" aria-hidden />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold">Done</p>
          <p className="text-muted-foreground text-xs">
            {result.outputs.length} file{result.outputs.length === 1 ? '' : 's'} ready
          </p>
        </div>
        {result.outputs.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            disabled={zipping}
            onClick={async () => {
              setZipping(true);
              try {
                await zipBlobs(result.outputs, 'fixit-results.zip');
              } finally {
                setZipping(false);
              }
            }}
          >
            <Archive className="size-4" aria-hidden />
            {zipping ? 'Zipping…' : 'Download all'}
          </Button>
        )}
      </div>

      {showBeforeAfter && first && firstOriginal ? (
        <BeforeAfter originalFile={firstOriginal.file} outputBlob={first.blob} />
      ) : showTextPreview && first ? (
        <TextPreview blob={first.blob} />
      ) : null}

      <ul className="divide-border border-border bg-card divide-y overflow-hidden rounded-xl border">
        {result.outputs.map((o) => (
          <li key={o.filename} className="flex items-center gap-3 p-3 sm:p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" title={o.filename}>
                {o.filename}
              </p>
              <p className="text-muted-foreground text-xs">{formatBytes(o.bytes)}</p>
            </div>
            <Button
              size="sm"
              onClick={() => downloadBlob(o.blob, o.filename)}
              aria-label={`Download ${o.filename}`}
            >
              <Download className="size-4" aria-hidden />
              Download
            </Button>
          </li>
        ))}
      </ul>

      <Button variant="outline" onClick={onReset}>
        <RotateCcw className="size-4" aria-hidden />
        Process another
      </Button>
    </div>
  );
}
