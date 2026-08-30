'use client';

import { useId } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfEncryptOptions } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-[11px]';

export function PdfEncryptOptionsForm({ value, onChange }: OptionsFormProps<PdfEncryptOptions>) {
  const userPwdId = useId();
  const ownerPwdId = useId();

  const set = <K extends keyof PdfEncryptOptions>(k: K, v: PdfEncryptOptions[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={userPwdId} className={labelCls}>
          User password
        </label>
        <input
          id={userPwdId}
          type="password"
          value={value.userPassword}
          onChange={(e) => set('userPassword', e.target.value)}
          className={inputCls}
          autoComplete="new-password"
        />
        <p className={helperCls}>PDF readers will prompt for this</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={ownerPwdId} className={labelCls}>
          Owner password <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          id={ownerPwdId}
          type="password"
          value={value.ownerPassword}
          onChange={(e) => set('ownerPassword', e.target.value)}
          className={inputCls}
          autoComplete="new-password"
        />
        <p className={helperCls}>Leave blank to use same as user password</p>
      </div>
    </div>
  );
}
