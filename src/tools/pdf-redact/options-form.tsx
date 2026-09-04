'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfRedactOptions } from './options';

const textareaCls =
  'border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-y';
const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-xs';

export function PdfRedactOptionsForm({ value, onChange }: OptionsFormProps<PdfRedactOptions>) {
  const patternsId = useId();
  const caseId = useId();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={patternsId} className={labelCls}>
          Words or phrases to redact
        </label>
        <textarea
          id={patternsId}
          rows={5}
          value={value.patterns}
          onChange={(e) => onChange({ ...value, patterns: e.target.value })}
          placeholder={'John Doe\n555-1234\nconfidential'}
          className={textareaCls}
        />
        <p className={helperCls}>
          Enter one word or phrase per line. Pages with matches are rasterized so the underlying
          text is permanently removed — clean pages stay vector-perfect.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          id={caseId}
          type="checkbox"
          checked={value.caseSensitive}
          onChange={(e) => onChange({ ...value, caseSensitive: e.target.checked })}
          className="h-4 w-4 rounded border"
        />
        <label htmlFor={caseId} className={labelCls}>
          Case-sensitive matching
        </label>
      </div>
    </div>
  );
}
