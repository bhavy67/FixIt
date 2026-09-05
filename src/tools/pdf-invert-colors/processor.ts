import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfInvertColorsOptions } from './options';
import type { PdfInvertColorsWorkerInput, PdfInvertColorsWorkerResult } from './worker-types';

export async function processPdfInvertColors(
  ctx: ProcessingContext<PdfInvertColorsOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;
  const buffer = await files[0]!.file.arrayBuffer();
  const base = files[0]!.name.replace(/\.pdf$/i, '');

  onProgress(0.1);
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: PdfInvertColorsWorkerInput = { buffer, options };

  const { bytes } = await runInWorker<PdfInvertColorsWorkerResult>({
    worker,
    input,
    transfer: [buffer],
    signal,
    onProgress: (p) => onProgress(0.1 + p * 0.9),
  });

  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: `${base}-${options.filter}.pdf`, bytes: blob.size }],
  };
}
