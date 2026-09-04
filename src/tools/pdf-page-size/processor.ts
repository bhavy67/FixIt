import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfPageSizeOptions } from './options';
import type { PdfPageSizeWorkerInput, PdfPageSizeWorkerResult } from './worker-types';

export async function processPdfPageSize(
  ctx: ProcessingContext<PdfPageSizeOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;

  onProgress(0.1);
  const buffer = await files[0]!.file.arrayBuffer();
  const base = files[0]!.name.replace(/\.pdf$/i, '');
  onProgress(0.3);

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: PdfPageSizeWorkerInput = { buffer, options };

  const result = await runInWorker<PdfPageSizeWorkerResult>({
    worker,
    input,
    transfer: [buffer],
    signal,
    onProgress: (p) => onProgress(0.3 + p * 0.7),
  });

  if (result.kind === 'json') {
    const blob = new Blob([result.json], { type: 'application/json' });
    return { outputs: [{ blob, filename: `${base}-page-sizes.json`, bytes: blob.size }] };
  }

  const blob = new Blob([result.bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: `${base}-${options.targetSize}.pdf`, bytes: blob.size }],
  };
}
