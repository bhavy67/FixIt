'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfRotateOptions, RotateDegrees } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';

const DEGREE_LABELS: Record<RotateDegrees, string> = {
  90: '90° clockwise',
  180: '180°',
  270: '270° clockwise',
};

export function PdfRotateOptionsForm({ value, onChange }: OptionsFormProps<PdfRotateOptions>) {
  const degreesId = useId();
  const pagesId = useId();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={degreesId} className={labelCls}>
          Rotation
        </label>
        <select
          id={degreesId}
          value={value.degrees}
          onChange={(e) => onChange({ ...value, degrees: Number(e.target.value) as RotateDegrees })}
          className={inputCls}
        >
          {(Object.keys(DEGREE_LABELS) as unknown as RotateDegrees[]).map((k) => (
            <option key={k} value={k}>
              {DEGREE_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={pagesId} className={labelCls}>
          Apply to
        </label>
        <input
          id={pagesId}
          type="text"
          value={value.pages}
          onChange={(e) => onChange({ ...value, pages: e.target.value })}
          placeholder="all"
          className={inputCls}
        />
        <p className="text-muted-foreground text-xs">
          Enter page numbers or ranges, or leave &ldquo;all&rdquo; to rotate every page.
        </p>
      </div>
    </div>
  );
}
