import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { PdfFingerprintOptions } from './options';

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// CRC-32 (IEEE 802.3, table-driven).
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes: Uint8Array): string {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]!) & 0xff]! ^ (crc >>> 8);
  }
  crc = (crc ^ 0xffffffff) >>> 0;
  return crc.toString(16).padStart(8, '0');
}

export async function processPdfFingerprint(
  ctx: ProcessingContext<PdfFingerprintOptions>,
): Promise<ProcessingResult> {
  const { files, signal, onProgress } = ctx;
  const file = files[0]!;

  onProgress(0.1);
  const buffer = await file.file.arrayBuffer();
  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

  onProgress(0.25);
  const [sha256, sha1, sha512] = await Promise.all([
    crypto.subtle.digest('SHA-256', buffer),
    crypto.subtle.digest('SHA-1', buffer),
    crypto.subtle.digest('SHA-512', buffer),
  ]);

  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
  onProgress(0.75);

  const crcHex = crc32(new Uint8Array(buffer));

  const result = {
    file: file.name,
    sizeBytes: buffer.byteLength,
    crc32: crcHex,
    sha1: toHex(sha1),
    sha256: toHex(sha256),
    sha512: toHex(sha512),
  };

  const base = file.name.replace(/\.pdf$/i, '');
  const jsonBlob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });

  // Copy-friendly text: one hash per line, prefixed with algorithm name.
  const textReport =
    `File:    ${result.file}\n` +
    `Size:    ${result.sizeBytes} bytes\n` +
    `CRC32:   ${result.crc32}\n` +
    `SHA-1:   ${result.sha1}\n` +
    `SHA-256: ${result.sha256}\n` +
    `SHA-512: ${result.sha512}\n`;
  const txtBlob = new Blob([textReport], { type: 'text/plain' });

  onProgress(1);
  return {
    outputs: [
      { blob: jsonBlob, filename: `${base}-fingerprint.json`, bytes: jsonBlob.size },
      { blob: txtBlob, filename: `${base}-fingerprint.txt`, bytes: txtBlob.size },
    ],
  };
}
