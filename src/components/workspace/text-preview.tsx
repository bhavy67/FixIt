'use client';

import { useEffect, useState } from 'react';
import { formatBytes } from '@/lib/format-bytes';

const MAX_PREVIEW_CHARS = 4000;

type Props = {
  blob: Blob;
};

export function TextPreview({ blob }: Props) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void blob.text().then((t) => {
      if (!cancelled) setText(t);
    });
    return () => {
      cancelled = true;
    };
  }, [blob]);

  if (text === null) {
    return (
      <div className="border-border bg-card text-muted-foreground rounded-xl border p-4 text-xs">
        Loading preview…
      </div>
    );
  }

  const truncated = text.length > MAX_PREVIEW_CHARS;
  const display = truncated ? `${text.slice(0, MAX_PREVIEW_CHARS)}\n…` : text;

  return (
    <div className="border-border bg-card flex flex-col gap-2 rounded-xl border p-3">
      <pre className="bg-muted max-h-64 overflow-auto rounded-lg p-3 font-mono text-xs whitespace-pre-wrap">
        <code>{display}</code>
      </pre>
      {truncated && (
        <p className="text-muted-foreground text-center text-[11px]">
          Preview truncated · full file is {formatBytes(blob.size)}
        </p>
      )}
    </div>
  );
}
