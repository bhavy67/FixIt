'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import {
  INDENT_LABELS,
  MODE_LABELS,
  type JsonFormatterOptions,
  type JsonIndent,
  type JsonMode,
} from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

const labelCls = 'text-foreground text-xs font-medium';

export function JsonFormatterOptionsForm({
  value,
  onChange,
}: OptionsFormProps<JsonFormatterOptions>) {
  const modeId = useId();
  const indentId = useId();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={modeId} className={labelCls}>
          Mode
        </label>
        <select
          id={modeId}
          value={value.mode}
          onChange={(e) => onChange({ ...value, mode: e.target.value as JsonMode })}
          className={inputCls}
        >
          {(Object.keys(MODE_LABELS) as JsonMode[]).map((k) => (
            <option key={k} value={k}>
              {MODE_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      {value.mode === 'pretty' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={indentId} className={labelCls}>
            Indent
          </label>
          <select
            id={indentId}
            value={value.indent}
            onChange={(e) => onChange({ ...value, indent: Number(e.target.value) as JsonIndent })}
            className={inputCls}
          >
            {(Object.keys(INDENT_LABELS) as unknown as JsonIndent[]).map((k) => (
              <option key={k} value={k}>
                {INDENT_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
