'use client';

import { useState, useEffect } from 'react';

const TAGLINES = [
  'Your files never leave this tab.',
  'Runs here. Stays here.',
  'All processing happens in your browser.',
  'Everything stays on your device.',
  'Open tab. Fix file. Close tab.',
  'Private by design, not policy.',
  'Files in. Files out. Nothing stored.',
  '100% on-device. 0% our business.',
  'No account. No trace. No drama.',
] as const;

export function PrivacyTagline() {
  const [line, setLine] = useState<string>(TAGLINES[0]);

  useEffect(() => {
    const picked = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
    if (picked) setLine(picked);
  }, []);

  return <>{line}</>;
}
