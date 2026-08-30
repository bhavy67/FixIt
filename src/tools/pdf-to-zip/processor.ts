import JSZip from 'jszip';
import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { PdfToZipOptions } from './options';

export async function processPdfToZip(
  ctx: ProcessingContext<PdfToZipOptions>,
): Promise<ProcessingResult> {
  const { files, signal, onProgress } = ctx;

  onProgress(0.05);
  const zip = new JSZip();

  for (let i = 0; i < files.length; i++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
    const f = files[i]!;
    const buf = await f.file.arrayBuffer();
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
    zip.file(f.name, buf);
    onProgress(0.05 + (i / files.length) * 0.75);
  }

  onProgress(0.8);
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });

  onProgress(1);
  return {
    outputs: [{ blob, filename: 'pdfs.zip', bytes: blob.size }],
  };
}
