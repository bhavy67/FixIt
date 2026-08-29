import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfDeleteOptions } from './options';
import type { PdfDeleteWorkerInput, PdfDeleteWorkerResult } from './worker-types';

export async function processPdfDelete(
  ctx: ProcessingContext<PdfDeleteOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;

  onProgress(0.1);
  const buffer = await files[0]!.file.arrayBuffer();
  const originalName = files[0]!.name.replace(/\.pdf$/i, '');
  onProgress(0.3);

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: PdfDeleteWorkerInput = { buffer, pages: options.pages, originalName };

  const { bytes } = await runInWorker<PdfDeleteWorkerResult>({
    worker,
    input,
    transfer: [buffer],
    signal,
    onProgress: (p) => onProgress(0.3 + p * 0.7),
  });

  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: `${originalName}-deleted.pdf`, bytes: blob.size }],
  };
}
