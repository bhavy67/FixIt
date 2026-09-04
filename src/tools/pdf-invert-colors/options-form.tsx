'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import { FILTER_LABELS, type ColorFilter, type PdfInvertColorsOptions } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-xs';

export function PdfInvertColorsOptionsForm({
  value,
  onChange,
}: OptionsFormProps<PdfInvertColorsOptions>) {
  const filterId = useId();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={filterId} className={labelCls}>
          Color filter
        </label>
        <select
          id={filterId}
          value={value.filter}
          onChange={(e) => onChange({ ...value, filter: e.target.value as ColorFilter })}
          className={inputCls}
        >
          {(Object.keys(FILTER_LABELS) as ColorFilter[]).map((k) => (
            <option key={k} value={k}>
              {FILTER_LABELS[k]}
            </option>
          ))}
        </select>
        <p className={helperCls}>
          {value.filter === 'invert'
            ? 'Uses a blend-mode overlay — text stays selectable and vector graphics stay sharp.'
            : 'Rasterizes each page — text becomes part of the image (no longer selectable).'}
        </p>
      </div>
    </div>
  );
}
