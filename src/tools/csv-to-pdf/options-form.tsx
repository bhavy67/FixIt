'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { CsvToPdfOptions } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';

export function CsvToPdfOptionsForm({ value, onChange }: OptionsFormProps<CsvToPdfOptions>) {
  const sepId = useId();
  const headerId = useId();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={sepId} className={labelCls}>
          Separator
        </label>
        <select
          id={sepId}
          value={value.separator}
          onChange={(e) =>
            onChange({ ...value, separator: e.target.value as CsvToPdfOptions['separator'] })
          }
          className={inputCls}
        >
          <option value=",">Comma (,)</option>
          <option value=";">Semicolon (;)</option>
          <option value={'\t'}>Tab</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          id={headerId}
          type="checkbox"
          checked={value.hasHeader}
          onChange={(e) => onChange({ ...value, hasHeader: e.target.checked })}
          className="h-4 w-4 rounded border"
        />
        <label htmlFor={headerId} className={labelCls}>
          First row is a header
        </label>
      </div>
    </div>
  );
}
