import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfFormFillOptions } from './options';
import type { PdfFormFillWorkerInput, PdfFormFillWorkerResult } from './worker-types';

export async function processPdfFormFill(
  ctx: ProcessingContext<PdfFormFillOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;

  onProgress(0.1);
  const buffer = await files[0]!.file.arrayBuffer();
  const base = files[0]!.name.replace(/\.pdf$/i, '');
  onProgress(0.3);

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: PdfFormFillWorkerInput = { buffer, options };

  const result = await runInWorker<PdfFormFillWorkerResult>({
    worker,
    input,
    transfer: [buffer],
    signal,
    onProgress: (p) => onProgress(0.3 + p * 0.7),
  });

  if (result.kind === 'json') {
    const blob = new Blob([result.json], { type: 'application/json' });
    return { outputs: [{ blob, filename: `${base}-fields.json`, bytes: blob.size }] };
  }

  if (result.warnings.length > 0) {
    // Surface warnings as an error if every field lookup failed — otherwise
    // proceed but include the count in meta for the UI to display.
    // For now, throw if nothing was actually filled successfully.
    const requestedNonEmpty = options.fields
      .split('\n')
      .filter((l) => l.trim() && l.includes(':')).length;
    if (result.warnings.length >= requestedNonEmpty && requestedNonEmpty > 0) {
      throw new Error(result.warnings.join('\n'));
    }
  }

  const blob = new Blob([result.bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: `${base}-filled.pdf`, bytes: blob.size }],
    meta: result.warnings.length > 0 ? { warnings: result.warnings } : undefined,
  };
}
