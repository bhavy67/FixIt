'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { ImageToPdfOptions, Orientation, PageSize } from './image-to-pdf';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-xs';

const PAGE_SIZE_LABELS: Record<PageSize, string> = {
  a4: 'A4',
  letter: 'Letter',
  legal: 'Legal',
  'fit-image': 'Fit to image',
};

const ORIENTATION_LABELS: Record<Orientation, string> = {
  auto: 'Auto (match image)',
  portrait: 'Portrait',
  landscape: 'Landscape',
};

export function ImageToPdfOptionsForm({
  value,
  onChange,
}: OptionsFormProps<ImageToPdfOptions>) {
  const pageSizeId = useId();
  const orientationId = useId();
  const marginId = useId();
  const isFit = value.pageSize === 'fit-image';

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={pageSizeId} className={labelCls}>
          Page size
        </label>
        <select
          id={pageSizeId}
          value={value.pageSize}
          onChange={(e) => onChange({ ...value, pageSize: e.target.value as PageSize })}
          className={inputCls}
        >
          {(Object.keys(PAGE_SIZE_LABELS) as PageSize[]).map((k) => (
            <option key={k} value={k}>
              {PAGE_SIZE_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={orientationId} className={labelCls}>
          Orientation
        </label>
        <select
          id={orientationId}
          value={value.orientation}
          onChange={(e) => onChange({ ...value, orientation: e.target.value as Orientation })}
          disabled={isFit}
          className={inputCls}
        >
          {(Object.keys(ORIENTATION_LABELS) as Orientation[]).map((k) => (
            <option key={k} value={k}>
              {ORIENTATION_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={marginId} className={labelCls}>
          Margin (mm)
        </label>
        <input
          id={marginId}
          type="number"
          min={0}
          max={50}
          step={1}
          value={value.marginMm}
          onChange={(e) => onChange({ ...value, marginMm: Math.max(0, Number(e.target.value)) })}
          disabled={isFit}
          className={inputCls}
        />
        <p className={helperCls}>
          {isFit
            ? 'Fit-to-image mode uses the image size directly — margin and orientation don’t apply.'
            : 'Images are scaled to fit within the page minus this margin, preserving aspect ratio.'}
        </p>
      </div>
    </div>
  );
}
