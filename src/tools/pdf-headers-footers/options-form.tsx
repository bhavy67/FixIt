'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import { type Alignment, type PdfHeadersFootersOptions } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-[11px]';

export function PdfHeadersFootersOptionsForm({
  value,
  onChange,
}: OptionsFormProps<PdfHeadersFootersOptions>) {
  const headerId = useId();
  const footerId = useId();
  const sizeId = useId();
  const alignId = useId();

  const set = <K extends keyof PdfHeadersFootersOptions>(
    k: K,
    v: PdfHeadersFootersOptions[K],
  ) => onChange({ ...value, [k]: v });

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={headerId} className={labelCls}>
          Header text
        </label>
        <input
          id={headerId}
          type="text"
          value={value.headerText}
          onChange={(e) => set('headerText', e.target.value)}
          placeholder="Leave blank for no header"
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={footerId} className={labelCls}>
          Footer text
        </label>
        <input
          id={footerId}
          type="text"
          value={value.footerText}
          onChange={(e) => set('footerText', e.target.value)}
          placeholder="Leave blank for no footer"
          className={inputCls}
        />
        <p className={helperCls}>
          Use <code>{'{page}'}</code> for current page and <code>{'{total}'}</code> for total pages
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={sizeId} className={labelCls}>
            Font size (pt)
          </label>
          <input
            id={sizeId}
            type="number"
            min={6}
            max={24}
            step={1}
            value={value.fontSize}
            onChange={(e) => set('fontSize', Math.max(6, Math.min(24, Number(e.target.value))))}
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={alignId} className={labelCls}>
            Alignment
          </label>
          <select
            id={alignId}
            value={value.alignment}
            onChange={(e) => set('alignment', e.target.value as Alignment)}
            className={inputCls}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
    </div>
  );
}
