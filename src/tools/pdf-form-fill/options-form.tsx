'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfFormFillOptions } from './options';

const textareaCls =
  'border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-y';
const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-xs';

export function PdfFormFillOptionsForm({
  value,
  onChange,
}: OptionsFormProps<PdfFormFillOptions>) {
  const fieldsId = useId();
  const flattenId = useId();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldsId} className={labelCls}>
          Field values
        </label>
        <textarea
          id={fieldsId}
          rows={6}
          value={value.fields}
          onChange={(e) => onChange({ ...value, fields: e.target.value })}
          placeholder={'fieldName: value\nanotherField: value2'}
          className={textareaCls}
        />
        <p className={helperCls}>
          Enter one field per line as <code>name: value</code>. Field names are case-sensitive.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          id={flattenId}
          type="checkbox"
          checked={value.flatten}
          onChange={(e) => onChange({ ...value, flatten: e.target.checked })}
          className="h-4 w-4 rounded border"
        />
        <label htmlFor={flattenId} className={labelCls}>
          Flatten after filling (locks values permanently)
        </label>
      </div>
    </div>
  );
}
