'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfUnlockOptions } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-[11px]';

export function PdfUnlockOptionsForm({ value, onChange }: OptionsFormProps<PdfUnlockOptions>) {
  const pwdId = useId();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={pwdId} className={labelCls}>
          Password
        </label>
        <input
          id={pwdId}
          type="password"
          value={value.password}
          onChange={(e) => onChange({ ...value, password: e.target.value })}
          className={inputCls}
          autoComplete="current-password"
        />
        <p className={helperCls}>
          Leave blank if the PDF only has restrictions (no reading password)
        </p>
      </div>
    </div>
  );
}
