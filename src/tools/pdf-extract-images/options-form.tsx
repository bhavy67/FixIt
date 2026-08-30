'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfExtractImagesOptions, ImageFormat } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-xs';

export function PdfExtractImagesOptionsForm({
  value,
  onChange,
}: OptionsFormProps<PdfExtractImagesOptions>) {
  const formatId = useId();
  const qualityId = useId();
  const minSizeId = useId();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={formatId} className={labelCls}>
          Format
        </label>
        <select
          id={formatId}
          value={value.format}
          onChange={(e) => onChange({ ...value, format: e.target.value as ImageFormat })}
          className={inputCls}
        >
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
        </select>
      </div>

      {value.format === 'jpeg' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={qualityId} className={labelCls}>
            Quality — {value.quality}%
          </label>
          <input
            id={qualityId}
            type="range"
            min={50}
            max={100}
            value={value.quality}
            onChange={(e) => onChange({ ...value, quality: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor={minSizeId} className={labelCls}>
          Min dimension (px)
        </label>
        <input
          id={minSizeId}
          type="number"
          min={1}
          value={value.minSize}
          onChange={(e) => onChange({ ...value, minSize: Math.max(1, Number(e.target.value)) })}
          className={inputCls}
        />
        <p className={helperCls}>Images smaller than this are skipped.</p>
      </div>
    </div>
  );
}
