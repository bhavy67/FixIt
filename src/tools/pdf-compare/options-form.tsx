'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfCompareOptions } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';

export function PdfCompareOptionsForm({ value, onChange }: OptionsFormProps<PdfCompareOptions>) {
  const scaleId = useId();

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
        <p className="text-muted-foreground text-xs">
          Differences are highlighted in red. Identical regions appear faded.
        </p>
      </div>
    </div>
  );
}
