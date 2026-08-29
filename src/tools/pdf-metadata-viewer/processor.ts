import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfMetaViewOptions } from './options';
import type { PdfMetaViewWorkerInput, PdfMetaViewWorkerResult } from './worker-types';

export async function processPdfMetaView(
  ctx: ProcessingContext<PdfMetaViewOptions>,
): Promise<ProcessingResult> {
  const { files, signal, onProgress } = ctx;

  onProgress(0.1);
  const buffer = await files[0]!.file.arrayBuffer();
  onProgress(0.3);

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: PdfMetaViewWorkerInput = { buffer };

  const { json } = await runInWorker<PdfMetaViewWorkerResult>({
    worker,
    input,
    transfer: [buffer],
    signal,
    onProgress: (p) => onProgress(0.3 + p * 0.7),
  });

  const blob = new Blob([json], { type: 'application/json' });
  return {
    outputs: [{ blob, filename: 'metadata.json', bytes: blob.size }],
  };
}
