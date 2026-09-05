import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfExtractTextOptions } from './options';
import type { PdfExtractTextWorkerInput, PdfExtractTextWorkerResult } from './worker-types';

export async function processPdfExtractText(
  ctx: ProcessingContext<PdfExtractTextOptions>,
): Promise<ProcessingResult> {
  const { files, signal, onProgress } = ctx;

  onProgress(0.05);
  const buffer = await files[0]!.file.arrayBuffer();
  const base = files[0]!.name.replace(/\.pdf$/i, '');
  onProgress(0.1);

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: PdfExtractTextWorkerInput = { buffer };

  const { text } = await runInWorker<PdfExtractTextWorkerResult>({
    worker,
    input,
    transfer: [buffer],
    signal,
    onProgress: (p) => onProgress(0.1 + p * 0.9),
  });

  const blob = new Blob([text], { type: 'text/plain' });
  return { outputs: [{ blob, filename: `${base}-text.txt`, bytes: blob.size }] };
}
