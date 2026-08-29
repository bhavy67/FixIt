'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfReorderOptions } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';

export function PdfReorderOptionsForm({ value, onChange }: OptionsFormProps<PdfReorderOptions>) {
  const orderId = useId();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={orderId} className={labelCls}>
          New page order
        </label>
        <input
          id={orderId}
          type="text"
          value={value.order}
          onChange={(e) => onChange({ ...value, order: e.target.value })}
          placeholder="e.g. 3, 1, 2, 4"
          className={inputCls}
        />
        <p className="text-muted-foreground text-xs">
          List all page numbers in the new order, separated by commas.
        </p>
      </div>
    </div>
  );
}
