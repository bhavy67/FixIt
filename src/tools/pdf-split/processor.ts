import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfSplitOptions } from './options';
import type { PdfSplitWorkerInput, PdfSplitWorkerResult } from './worker-types';

export async function processPdfSplit(
  ctx: ProcessingContext<PdfSplitOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;

  onProgress(0.1);
  const buffer = await files[0]!.file.arrayBuffer();
  onProgress(0.3);

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: PdfSplitWorkerInput = { buffer, options };

  const { files: splitFiles } = await runInWorker<PdfSplitWorkerResult>({
    worker,
    input,
    transfer: [buffer],
    signal,
    onProgress: (p) => onProgress(0.3 + p * 0.7),
  });

  return {
    outputs: splitFiles.map((f) => ({
      blob: new Blob([f.bytes as BlobPart], { type: 'application/pdf' }),
      filename: f.name,
      bytes: f.bytes.byteLength,
    })),
    meta: { count: splitFiles.length },
  };
}
