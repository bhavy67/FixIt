'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfToJpgOptions, RenderScale } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';

const SCALE_LABELS: Record<RenderScale, string> = {
  1: '1× — 72 DPI (screen)',
  2: '2× — 144 DPI (recommended)',
  3: '3× — 216 DPI (high quality)',
};

export function PdfToJpgOptionsForm({ value, onChange }: OptionsFormProps<PdfToJpgOptions>) {
  const scaleId = useId();
  const qualityId = useId();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={scaleId} className={labelCls}>
          Resolution
        </label>
        <select
          id={scaleId}
          value={value.scale}
          onChange={(e) => onChange({ ...value, scale: Number(e.target.value) as RenderScale })}
          className={inputCls}
        >
          {(Object.keys(SCALE_LABELS) as unknown as RenderScale[]).map((k) => (
            <option key={k} value={k}>
              {SCALE_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={qualityId} className={labelCls}>
            Quality
          </label>
          <span className="text-muted-foreground text-xs tabular-nums">
            {Math.round(value.quality * 100)}%
          </span>
        </div>
        <input
          id={qualityId}
          type="range"
          min={0.5}
          max={1}
          step={0.05}
          value={value.quality}
          onChange={(e) => onChange({ ...value, quality: Number(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}
