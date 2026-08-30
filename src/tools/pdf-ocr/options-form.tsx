'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import {
  LANG_LABELS,
  QUALITY_LABELS,
  type OcrLang,
  type PdfOcrOptions,
  type RenderQuality,
} from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';

export function PdfOcrOptionsForm({ value, onChange }: OptionsFormProps<PdfOcrOptions>) {
  const langId = useId();
  const qualityId = useId();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={langId} className={labelCls}>
          Language
        </label>
        <select
          id={langId}
          value={value.lang}
          onChange={(e) => onChange({ ...value, lang: e.target.value as OcrLang })}
          className={inputCls}
        >
          {(Object.keys(LANG_LABELS) as OcrLang[]).map((k) => (
            <option key={k} value={k}>
              {LANG_LABELS[k]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={qualityId} className={labelCls}>
          Quality (for PDFs)
        </label>
        <select
          id={qualityId}
          value={value.quality}
          onChange={(e) => onChange({ ...value, quality: e.target.value as RenderQuality })}
          className={inputCls}
        >
          {(Object.keys(QUALITY_LABELS) as RenderQuality[]).map((k) => (
            <option key={k} value={k}>
              {QUALITY_LABELS[k]}
            </option>
          ))}
        </select>
        <p className="text-muted-foreground text-xs">
          Higher quality renders PDF pages at a larger size before OCR — slower but more accurate.
        </p>
      </div>
    </div>
  );
}
