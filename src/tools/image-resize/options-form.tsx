'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import {
  FIT_LABELS,
  FORMAT_LABELS,
  type ImageResizeOptions,
  type ResizeFit,
  type ResizeFormat,
} from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

const labelCls = 'text-foreground text-xs font-medium';

const supportsQuality = (format: ResizeFormat) => format !== 'image/png';

export function ImageResizeOptionsForm({ value, onChange }: OptionsFormProps<ImageResizeOptions>) {
  const widthId = useId();
  const heightId = useId();
  const fitId = useId();
  const formatId = useId();
  const qualityId = useId();

  const set = <K extends keyof ImageResizeOptions>(key: K, val: ImageResizeOptions[K]) =>
    onChange({ ...value, [key]: val });

  const clampInt = (raw: string, min = 1, max = 8192): number => {
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
  };

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={widthId} className={labelCls}>
            Width (px)
          </label>
          <input
            id={widthId}
            type="number"
            inputMode="numeric"
            min={1}
            max={8192}
            step={1}
            value={value.width}
            onChange={(e) => set('width', clampInt(e.target.value))}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={heightId} className={labelCls}>
            Height (px)
          </label>
          <input
            id={heightId}
            type="number"
            inputMode="numeric"
            min={1}
            max={8192}
            step={1}
            value={value.height}
            onChange={(e) => set('height', clampInt(e.target.value))}
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={fitId} className={labelCls}>
          Fit
        </label>
        <select
          id={fitId}
          value={value.fit}
          onChange={(e) => set('fit', e.target.value as ResizeFit)}
          className={inputCls}
        >
          {(Object.keys(FIT_LABELS) as ResizeFit[]).map((k) => (
            <option key={k} value={k}>
              {FIT_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={formatId} className={labelCls}>
          Format
        </label>
        <select
          id={formatId}
          value={value.format}
          onChange={(e) => set('format', e.target.value as ResizeFormat)}
          className={inputCls}
        >
          {(Object.keys(FORMAT_LABELS) as ResizeFormat[]).map((k) => (
            <option key={k} value={k}>
              {FORMAT_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      {supportsQuality(value.format) && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor={qualityId} className={labelCls}>
              Quality
            </label>
            <span className="text-muted-foreground text-xs tabular-nums">
              {Math.round(value.quality * 100)}%
            </span>
          </div>
          <input
            id={qualityId}
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={value.quality}
            onChange={(e) => set('quality', Number.parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
