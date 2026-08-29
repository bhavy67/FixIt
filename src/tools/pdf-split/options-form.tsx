'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfSplitOptions, SplitMode } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';

export function PdfSplitOptionsForm({ value, onChange }: OptionsFormProps<PdfSplitOptions>) {
  const modeId = useId();
  const rangesId = useId();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={modeId} className={labelCls}>
          Split mode
        </label>
        <select
          id={modeId}
          value={value.mode}
          onChange={(e) => onChange({ ...value, mode: e.target.value as SplitMode })}
          className={inputCls}
        >
          <option value="each-page">Each page as a separate PDF</option>
          <option value="custom">Custom ranges</option>
        </select>
      </div>

      {value.mode === 'custom' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={rangesId} className={labelCls}>
            Ranges
          </label>
          <input
            id={rangesId}
            type="text"
            value={value.ranges}
            onChange={(e) => onChange({ ...value, ranges: e.target.value })}
            placeholder="e.g. 1-3, 4-6, 7"
            className={inputCls}
          />
          <p className="text-muted-foreground text-xs">
            Each range becomes a separate PDF file.
          </p>
        </div>
      )}
    </div>
  );
}
