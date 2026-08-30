import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { PdfFingerprintOptions } from './options';

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function processPdfFingerprint(
  ctx: ProcessingContext<PdfFingerprintOptions>,
): Promise<ProcessingResult> {
  const { files, signal, onProgress } = ctx;
  const file = files[0]!;

  onProgress(0.1);
  const buffer = await file.file.arrayBuffer();
  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

  onProgress(0.3);
  const [sha256, sha1] = await Promise.all([
    crypto.subtle.digest('SHA-256', buffer),
    crypto.subtle.digest('SHA-1', buffer),
  ]);

  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
  onProgress(0.9);

  const result = {
    file: file.name,
    sizeBytes: buffer.byteLength,
    sha256: toHex(sha256),
    sha1: toHex(sha1),
  };

  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const base = file.name.replace(/\.pdf$/i, '');

  onProgress(1);
  return { outputs: [{ blob, filename: `${base}-fingerprint.json`, bytes: blob.size }] };
}
