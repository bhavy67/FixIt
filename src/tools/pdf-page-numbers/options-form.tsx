'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import { POSITION_LABELS, type PageNumberPosition, type PdfPageNumbersOptions } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-[11px]';

export function PdfPageNumbersOptionsForm({
  value,
  onChange,
}: OptionsFormProps<PdfPageNumbersOptions>) {
  const posId = useId();
  const startId = useId();
  const patternId = useId();
  const sizeId = useId();
  const skipId = useId();

  const set = <K extends keyof PdfPageNumbersOptions>(k: K, v: PdfPageNumbersOptions[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={posId} className={labelCls}>
          Position
        </label>
        <select
          id={posId}
          value={value.position}
          onChange={(e) => set('position', e.target.value as PageNumberPosition)}
          className={inputCls}
        >
          {(Object.keys(POSITION_LABELS) as PageNumberPosition[]).map((k) => (
            <option key={k} value={k}>
              {POSITION_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={patternId} className={labelCls}>
          Format
        </label>
        <input
          id={patternId}
          type="text"
          value={value.pattern}
          onChange={(e) => set('pattern', e.target.value)}
          placeholder='e.g. "Page {page} of {total}"'
          className={inputCls}
        />
        <p className={helperCls}>
          Use <code>{'{page}'}</code> and <code>{'{total}'}</code>. Leave as <code>{'{page}'}</code>{' '}
          for a bare number.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={startId} className={labelCls}>
            Start at
          </label>
          <input
            id={startId}
            type="number"
            min={0}
            max={9999}
            step={1}
            value={value.startNumber}
            onChange={(e) => set('startNumber', Math.max(0, Number(e.target.value)))}
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={skipId} className={labelCls}>
            Skip first
          </label>
          <input
            id={skipId}
            type="number"
            min={0}
            step={1}
            value={value.skipFirstN}
            onChange={(e) => set('skipFirstN', Math.max(0, Number(e.target.value)))}
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={sizeId} className={labelCls}>
            Font (pt)
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
      </div>
      <p className={helperCls}>
        Skip first N pages leaves title/cover pages un-numbered. Numbering restarts from “Start
        at” on the first numbered page.
      </p>
    </div>
  );
}
