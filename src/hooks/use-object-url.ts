'use client';

import { useEffect, useState } from 'react';

export function useObjectURL(source: Blob | File | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!source) {
      setUrl(null);
      return;
    }
    const created = URL.createObjectURL(source);
    setUrl(created);
    return () => {
      URL.revokeObjectURL(created);
    };
  }, [source]);

  return url;
}
