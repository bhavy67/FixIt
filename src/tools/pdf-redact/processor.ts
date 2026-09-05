import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfRedactOptions } from './options';
import type { PdfRedactWorkerInput, PdfRedactWorkerResult } from './worker-types';

export async function processPdfRedact(
  ctx: ProcessingContext<PdfRedactOptions>,
): Promise<ProcessingResult> {
  const { files, options, onProgress, signal } = ctx;
  const file = files[0]!;

  onProgress(0.02);
  const buffer = await file.file.arrayBuffer();
  onProgress(0.05);

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: PdfRedactWorkerInput = { buffer, options };

  const { bytes } = await runInWorker<PdfRedactWorkerResult>({
    worker,
    input,
    transfer: [buffer],
    signal,
    onProgress: (p) => onProgress(0.05 + p * 0.95),
  });

  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const base = file.name.replace(/\.pdf$/i, '');
  onProgress(1);
  return { outputs: [{ blob, filename: `${base}-redacted.pdf`, bytes: blob.size }] };
}
