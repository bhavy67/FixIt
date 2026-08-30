'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfWatermarkOptions } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';

export function PdfWatermarkOptionsForm({ value, onChange }: OptionsFormProps<PdfWatermarkOptions>) {
  const textId = useId();
  const fontSizeId = useId();
  const opacityId = useId();
  const rotationId = useId();

  const set = <K extends keyof PdfWatermarkOptions>(k: K, v: PdfWatermarkOptions[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={textId} className={labelCls}>
          Watermark text
        </label>
        <input
          id={textId}
          type="text"
          value={value.text}
          onChange={(e) => set('text', e.target.value)}
          placeholder="CONFIDENTIAL"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={fontSizeId} className={labelCls}>
            Font size (pt)
          </label>
          <input
            id={fontSizeId}
            type="number"
            min={12}
            max={120}
            step={4}
            value={value.fontSize}
            onChange={(e) => set('fontSize', Math.max(12, Math.min(120, Number(e.target.value))))}
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={rotationId} className={labelCls}>
            Angle (°)
          </label>
          <input
            id={rotationId}
            type="number"
            min={-90}
            max={90}
            step={5}
            value={value.rotation}
            onChange={(e) => set('rotation', Math.max(-90, Math.min(90, Number(e.target.value))))}
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={opacityId} className={labelCls}>
            Opacity
          </label>
          <span className="text-muted-foreground text-xs tabular-nums">
            {Math.round(value.opacity * 100)}%
          </span>
        </div>
        <input
          id={opacityId}
          type="range"
          min={0.05}
          max={0.8}
          step={0.05}
          value={value.opacity}
          onChange={(e) => set('opacity', Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
