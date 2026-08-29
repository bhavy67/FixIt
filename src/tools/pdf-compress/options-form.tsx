'use client';

import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfCompressOptions } from './options';

export function PdfCompressOptionsForm({ value, onChange }: OptionsFormProps<PdfCompressOptions>) {
  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={value.stripMetadata}
          onChange={(e) => onChange({ ...value, stripMetadata: e.target.checked })}
          className="size-4 rounded"
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-foreground text-xs font-medium">Strip metadata</span>
          <span className="text-muted-foreground text-xs">
            Removes title, author, and other document properties.
          </span>
        </div>
      </label>
    </div>
  );
}
