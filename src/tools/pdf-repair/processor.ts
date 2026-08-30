import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfRepairOptions } from './options';
import type { PdfRepairWorkerInput, PdfRepairWorkerResult } from './worker-types';

export async function processPdfRepair(
  ctx: ProcessingContext<PdfRepairOptions>,
): Promise<ProcessingResult> {
  const { files, signal, onProgress } = ctx;

  onProgress(0.1);
  const buffer = await files[0]!.file.arrayBuffer();
  const base = files[0]!.name.replace(/\.pdf$/i, '');
  onProgress(0.3);

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: PdfRepairWorkerInput = { buffer };

  const { bytes } = await runInWorker<PdfRepairWorkerResult>({
    worker,
    input,
    transfer: [buffer],
    signal,
    onProgress: (p) => onProgress(0.3 + p * 0.7),
  });

  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: `${base}-repaired.pdf`, bytes: blob.size }],
  };
}
