'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfCropOptions, MarginUnit } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-xs';

export function PdfCropOptionsForm({ value, onChange }: OptionsFormProps<PdfCropOptions>) {
  const topId = useId();
  const rightId = useId();
  const bottomId = useId();
  const leftId = useId();
  const unitId = useId();

  const set = <K extends keyof PdfCropOptions>(k: K, v: PdfCropOptions[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={unitId} className={labelCls}>
          Unit
        </label>
        <select
          id={unitId}
          value={value.unit}
          onChange={(e) => set('unit', e.target.value as MarginUnit)}
          className={inputCls}
        >
          <option value="mm">mm</option>
          <option value="pt">pt</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={topId} className={labelCls}>
            Top
          </label>
          <input
            id={topId}
            type="number"
            min={0}
            value={value.top}
            onChange={(e) => set('top', Math.max(0, Number(e.target.value)))}
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={rightId} className={labelCls}>
            Right
          </label>
          <input
            id={rightId}
            type="number"
            min={0}
            value={value.right}
            onChange={(e) => set('right', Math.max(0, Number(e.target.value)))}
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={bottomId} className={labelCls}>
            Bottom
          </label>
          <input
            id={bottomId}
            type="number"
            min={0}
            value={value.bottom}
            onChange={(e) => set('bottom', Math.max(0, Number(e.target.value)))}
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={leftId} className={labelCls}>
            Left
          </label>
          <input
            id={leftId}
            type="number"
            min={0}
            value={value.left}
            onChange={(e) => set('left', Math.max(0, Number(e.target.value)))}
            className={inputCls}
          />
        </div>
      </div>

      <p className={helperCls}>
        Sets the MediaBox on every page — the cropped region is what viewers, print
        drivers, and downstream tools will see.
      </p>
    </div>
  );
}
