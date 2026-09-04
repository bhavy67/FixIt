'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfFormFillMode, PdfFormFillOptions } from './options';

const textareaCls =
  'border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-y';
const selectCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none';
const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-xs';

export function PdfFormFillOptionsForm({
  value,
  onChange,
}: OptionsFormProps<PdfFormFillOptions>) {
  const modeId = useId();
  const fieldsId = useId();
  const flattenId = useId();
  const isFill = value.mode === 'fill';

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={modeId} className={labelCls}>
          Mode
        </label>
        <select
          id={modeId}
          value={value.mode}
          onChange={(e) => onChange({ ...value, mode: e.target.value as PdfFormFillMode })}
          className={selectCls}
        >
          <option value="detect">Detect fields (list every field as JSON)</option>
          <option value="fill">Fill fields (write values into the form)</option>
        </select>
        <p className={helperCls}>
          {isFill
            ? 'Supports text, checkbox, radio, dropdown, and list boxes. For list boxes, separate multiple selections with commas or semicolons.'
            : 'Run once to discover every field name and type — then switch to Fill mode.'}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldsId} className={labelCls}>
          Field values
        </label>
        <textarea
          id={fieldsId}
          rows={6}
          value={value.fields}
          onChange={(e) => onChange({ ...value, fields: e.target.value })}
          placeholder={'fullName: Jane Doe\nsubscribed: yes\ncountry: France'}
          disabled={!isFill}
          className={textareaCls}
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          id={flattenId}
          type="checkbox"
          checked={value.flatten}
          onChange={(e) => onChange({ ...value, flatten: e.target.checked })}
          disabled={!isFill}
          className="h-4 w-4 rounded border"
        />
        <span className={labelCls}>Flatten after filling (locks values permanently)</span>
      </label>
    </div>
  );
}
