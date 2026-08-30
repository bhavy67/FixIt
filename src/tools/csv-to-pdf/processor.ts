import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { CsvToPdfOptions } from './options';
import type { CsvToPdfWorkerInput, CsvToPdfWorkerResult } from './worker-types';

export async function processCsvToPdf(
  ctx: ProcessingContext<CsvToPdfOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;

  onProgress(0.05);
  const text = await files[0]!.file.text();
  const base = files[0]!.name.replace(/\.(csv|tsv)$/i, '');
  onProgress(0.15);

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: CsvToPdfWorkerInput = {
    text,
    separator: options.separator,
    hasHeader: options.hasHeader,
  };

  const { bytes } = await runInWorker<CsvToPdfWorkerResult>({
    worker,
    input,
    signal,
    onProgress: (p) => onProgress(0.15 + p * 0.85),
  });

  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: `${base}-table.pdf`, bytes: blob.size }],
  };
}
