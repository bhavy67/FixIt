'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfFlattenOptions } from './options';

const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-xs';

export function PdfFlattenOptionsForm({ value, onChange }: OptionsFormProps<PdfFlattenOptions>) {
  const formsId = useId();
  const annotsId = useId();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <label className="flex items-start gap-3">
        <input
          id={formsId}
          type="checkbox"
          checked={value.flattenForms}
          onChange={(e) => onChange({ ...value, flattenForms: e.target.checked })}
          className="mt-0.5 size-4 rounded"
        />
        <div className="flex flex-col gap-0.5">
          <span className={labelCls}>Flatten form fields</span>
          <span className={helperCls}>
            Bakes filled values into the page. Fields become non-editable text.
          </span>
        </div>
      </label>

      <label className="flex items-start gap-3">
        <input
          id={annotsId}
          type="checkbox"
          checked={value.removeAnnotations}
          onChange={(e) => onChange({ ...value, removeAnnotations: e.target.checked })}
          className="mt-0.5 size-4 rounded"
        />
        <div className="flex flex-col gap-0.5">
          <span className={labelCls}>Remove annotations</span>
          <span className={helperCls}>
            Strips highlights, sticky notes, freetext boxes, and other markup.
          </span>
        </div>
      </label>
    </div>
  );
}
