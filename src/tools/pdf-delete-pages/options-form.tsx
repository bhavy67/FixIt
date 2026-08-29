'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfDeleteOptions } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';

export function PdfDeleteOptionsForm({ value, onChange }: OptionsFormProps<PdfDeleteOptions>) {
  const pagesId = useId();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={pagesId} className={labelCls}>
          Pages to delete
        </label>
        <input
          id={pagesId}
          type="text"
          value={value.pages}
          onChange={(e) => onChange({ ...value, pages: e.target.value })}
          placeholder="e.g. 1, 3, 5-7"
          className={inputCls}
        />
        <p className="text-muted-foreground text-xs">
          Separate pages with commas. Use ranges like 2-5.
        </p>
      </div>
    </div>
  );
}
