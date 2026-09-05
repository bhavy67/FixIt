'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfCompareOptions } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-xs';

export function PdfCompareOptionsForm({ value, onChange }: OptionsFormProps<PdfCompareOptions>) {
  const scaleId = useId();
  const thresholdId = useId();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={scaleId} className={labelCls}>
          Comparison resolution
        </label>
        <select
          id={scaleId}
          value={value.scale}
          onChange={(e) => onChange({ ...value, scale: Number(e.target.value) as 1 | 2 })}
          className={inputCls}
        >
          <option value={1}>1× — faster (72 DPI)</option>
          <option value={2}>2× — more detail (144 DPI)</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={thresholdId} className={labelCls}>
          Diff sensitivity: {value.threshold}
        </label>
        <input
          id={thresholdId}
          type="range"
          min={0}
          max={50}
          step={1}
          value={value.threshold}
          onChange={(e) => onChange({ ...value, threshold: Number(e.target.value) })}
          className="w-full"
        />
        <p className={helperCls}>
          Lower is stricter (0 flags any pixel difference). Higher tolerates minor rendering
          jitter. Default 15 works for most PDFs.
        </p>
      </div>

      <p className={helperCls}>
        Differences are highlighted in red. Pages that exist in only one file produce a marker
        page you can spot in the download list.
      </p>
    </div>
  );
}
