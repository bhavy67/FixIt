import type { ProcessingContext, ProcessingResult, ProcessingResultBlob } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfCompareOptions } from './options';
import type { PdfCompareWorkerInput, PdfCompareWorkerResult } from './worker-types';

export async function processPdfCompare(
  ctx: ProcessingContext<PdfCompareOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;

  onProgress(0.05);
  const [bufA, bufB] = await Promise.all([
    files[0]!.file.arrayBuffer(),
    files[1]!.file.arrayBuffer(),
  ]);
  onProgress(0.1);

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: PdfCompareWorkerInput = {
    buffers: [bufA, bufB],
    names: [files[0]!.name, files[1]!.name],
    options,
  };

  const { outputs } = await runInWorker<PdfCompareWorkerResult>({
    worker,
    input,
    transfer: [bufA, bufB],
    signal,
    onProgress: (p) => onProgress(0.1 + p * 0.9),
  });

  const results: ProcessingResultBlob[] = outputs.map((o) => ({
    blob: new Blob([o.bytes as BlobPart], { type: o.mime }),
    filename: o.filename,
    bytes: o.bytes.length,
  }));

  onProgress(1);
  return { outputs: results };
}
