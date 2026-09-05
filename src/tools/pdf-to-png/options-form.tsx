'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfToPngOptions, RenderScale } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';

const SCALE_LABELS: Record<RenderScale, string> = {
  1: '1× — 72 DPI (screen)',
  2: '2× — 144 DPI (recommended)',
  3: '3× — 216 DPI (high quality)',
};

export function PdfToPngOptionsForm({ value, onChange }: OptionsFormProps<PdfToPngOptions>) {
  const scaleId = useId();
  const bundleId = useId();

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

      <label className="flex items-start gap-3">
        <input
          id={bundleId}
          type="checkbox"
          checked={value.bundle}
          onChange={(e) => onChange({ ...value, bundle: e.target.checked })}
          className="mt-0.5 size-4 rounded"
        />
        <div className="flex flex-col gap-0.5">
          <span className={labelCls}>Bundle pages as a ZIP</span>
          <span className="text-muted-foreground text-xs">
            Downloads a single archive instead of one image per page.
          </span>
        </div>
      </label>
    </div>
  );
}
