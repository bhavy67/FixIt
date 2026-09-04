'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type {
  PdfPageSizeMode,
  PdfPageSizeOptions,
  ResizeOrientation,
  ResizePageSize,
} from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-xs';

const SIZE_LABELS: Record<ResizePageSize, string> = {
  a4: 'A4',
  letter: 'US Letter',
  legal: 'US Legal',
  a3: 'A3',
  a5: 'A5',
};

const ORIENT_LABELS: Record<ResizeOrientation, string> = {
  auto: 'Auto (match page)',
  portrait: 'Portrait',
  landscape: 'Landscape',
};

export function PdfPageSizeOptionsForm({
  value,
  onChange,
}: OptionsFormProps<PdfPageSizeOptions>) {
  const modeId = useId();
  const sizeId = useId();
  const orientId = useId();
  const isResize = value.mode === 'resize';

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={modeId} className={labelCls}>
          Mode
        </label>
        <select
          id={modeId}
          value={value.mode}
          onChange={(e) => onChange({ ...value, mode: e.target.value as PdfPageSizeMode })}
          className={inputCls}
        >
          <option value="inspect">Inspect (report page sizes as JSON)</option>
          <option value="resize">Resize (normalise all pages to a target size)</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={sizeId} className={labelCls}>
          Target page size
        </label>
        <select
          id={sizeId}
          value={value.targetSize}
          onChange={(e) => onChange({ ...value, targetSize: e.target.value as ResizePageSize })}
          disabled={!isResize}
          className={inputCls}
        >
          {(Object.keys(SIZE_LABELS) as ResizePageSize[]).map((k) => (
            <option key={k} value={k}>
              {SIZE_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={orientId} className={labelCls}>
          Orientation
        </label>
        <select
          id={orientId}
          value={value.orientation}
          onChange={(e) =>
            onChange({ ...value, orientation: e.target.value as ResizeOrientation })
          }
          disabled={!isResize}
          className={inputCls}
        >
          {(Object.keys(ORIENT_LABELS) as ResizeOrientation[]).map((k) => (
            <option key={k} value={k}>
              {ORIENT_LABELS[k]}
            </option>
          ))}
        </select>
        <p className={helperCls}>
          {isResize
            ? 'Original page contents are scaled to fit inside the target page (text stays selectable).'
            : 'Inspect mode outputs a JSON report — no PDF is produced.'}
        </p>
      </div>
    </div>
  );
}
