'use client';

import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfEncryptOptions } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-xs';

export function PdfEncryptOptionsForm({ value, onChange }: OptionsFormProps<PdfEncryptOptions>) {
  const userPwdId = useId();
  const ownerPwdId = useId();
  const [showUser, setShowUser] = useState(false);
  const [showOwner, setShowOwner] = useState(false);

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={userPwdId} className={labelCls}>
          Password
        </label>
        <div className="relative">
          <input
            id={userPwdId}
            type={showUser ? 'text' : 'password'}
            value={value.userPassword}
            onChange={(e) => onChange({ ...value, userPassword: e.target.value })}
            className={inputCls}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            aria-label={showUser ? 'Hide password' : 'Show password'}
            onClick={() => setShowUser((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground h-7 w-7 inline-flex items-center justify-center rounded-md transition-colors hover:bg-accent"
          >
            {showUser ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={ownerPwdId} className={labelCls}>
          Owner password
        </label>
        <div className="relative">
          <input
            id={ownerPwdId}
            type={showOwner ? 'text' : 'password'}
            value={value.ownerPassword}
            onChange={(e) => onChange({ ...value, ownerPassword: e.target.value })}
            className={inputCls}
            autoComplete="new-password"
          />
          <button
            type="button"
            aria-label={showOwner ? 'Hide owner password' : 'Show owner password'}
            onClick={() => setShowOwner((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground h-7 w-7 inline-flex items-center justify-center rounded-md transition-colors hover:bg-accent"
          >
            {showOwner ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <p className={helperCls}>Optional — restricts editing. If blank, uses the same password.</p>
      </div>
    </div>
  );
}
