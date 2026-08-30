'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { TxtToPdfOptions } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';

export function TxtToPdfOptionsForm({ value, onChange }: OptionsFormProps<TxtToPdfOptions>) {
  const sizeId = useId();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={sizeId} className={labelCls}>
          Font size (pt)
        </label>
        <input
          id={sizeId}
          type="number"
          min={7}
          max={18}
          step={1}
          value={value.fontSize}
          onChange={(e) =>
            onChange({ ...value, fontSize: Math.max(7, Math.min(18, Number(e.target.value))) })
          }
          className={inputCls}
        />
      </div>
    </div>
  );
}
