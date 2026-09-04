'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfCompressLevel, PdfCompressOptions } from './options';

const selectCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none';
const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-xs';

const LEVEL_LABELS: Record<PdfCompressLevel, string> = {
  lossless: 'Lossless (metadata + object-stream repack)',
  light: 'Light (rasterize @ 150 DPI, JPEG q85)',
  strong: 'Strong (rasterize @ 100 DPI, JPEG q65)',
};

export function PdfCompressOptionsForm({
  value,
  onChange,
}: OptionsFormProps<PdfCompressOptions>) {
  const levelId = useId();
  const stripId = useId();
  const isRaster = value.level !== 'lossless';

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={levelId} className={labelCls}>
          Compression level
        </label>
        <select
          id={levelId}
          value={value.level}
          onChange={(e) => onChange({ ...value, level: e.target.value as PdfCompressLevel })}
          className={selectCls}
        >
          {(Object.keys(LEVEL_LABELS) as PdfCompressLevel[]).map((k) => (
            <option key={k} value={k}>
              {LEVEL_LABELS[k]}
            </option>
          ))}
        </select>
        <p className={helperCls}>
          {isRaster
            ? 'Rasterize modes convert every page to a JPEG — file gets much smaller but text becomes an image (no longer selectable).'
            : 'Lossless mode preserves text and vectors. Typical savings are modest unless the source has embedded metadata or duplicate objects.'}
        </p>
      </div>

      <label className="flex items-start gap-3">
        <input
          id={stripId}
          type="checkbox"
          checked={value.stripMetadata}
          onChange={(e) => onChange({ ...value, stripMetadata: e.target.checked })}
          className="mt-0.5 size-4 rounded"
        />
        <div className="flex flex-col gap-0.5">
          <span className={labelCls}>Strip metadata</span>
          <span className={helperCls}>
            Also clears the XMP stream, thumbnails, and app-specific tracking data.
          </span>
        </div>
      </label>
    </div>
  );
}
