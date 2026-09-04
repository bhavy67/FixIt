import type { ProcessingContext, ProcessingResult, ProcessingResultBlob } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfEncryptOptions } from './options';
import type { PdfEncryptWorkerInput, PdfEncryptWorkerResult } from './worker-types';

export async function processPdfEncrypt(
  ctx: ProcessingContext<PdfEncryptOptions>,
): Promise<ProcessingResult> {
  const { files, options, onProgress, signal } = ctx;

  if (options.userPassword.trim() === '') {
    throw new Error('Password cannot be empty.');
  }

  const outputs: ProcessingResultBlob[] = [];

  for (let i = 0; i < files.length; i++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

    const file = files[i]!;
    const perFileBase = i / files.length;
    const perFileSpan = 1 / files.length;
    onProgress(perFileBase);

    const buffer = await file.file.arrayBuffer();
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    const input: PdfEncryptWorkerInput = {
      buffer,
      userPassword: options.userPassword,
      ownerPassword: options.ownerPassword,
    };

    const { bytes } = await runInWorker<PdfEncryptWorkerResult>({
      worker,
      input,
      transfer: [buffer],
      signal,
      onProgress: (p) => onProgress(perFileBase + p * perFileSpan),
    });

    const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
    const base = file.name.replace(/\.pdf$/i, '');
    outputs.push({ blob, filename: `${base}-protected.pdf`, bytes: blob.size });
  }

  onProgress(1);
  return { outputs };
}
