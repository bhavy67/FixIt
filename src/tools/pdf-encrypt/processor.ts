import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfEncryptOptions } from './options';
import type { PdfEncryptWorkerInput, PdfEncryptWorkerResult } from './worker-types';

export async function processPdfEncrypt(
  ctx: ProcessingContext<PdfEncryptOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;

  onProgress(0.1);
  const buffer = await files[0]!.file.arrayBuffer();
  const base = files[0]!.name.replace(/\.pdf$/i, '');
  onProgress(0.3);

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
    onProgress: (p) => onProgress(0.3 + p * 0.7),
  });

  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: `${base}-encrypted.pdf`, bytes: blob.size }],
  };
}
