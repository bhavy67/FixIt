import type { ProcessingContext, ProcessingResult, ProcessingResultBlob } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfExtractImagesOptions } from './options';
import type {
  PdfExtractImagesWorkerInput,
  PdfExtractImagesWorkerResult,
} from './worker-types';

export async function processPdfExtractImages(
  ctx: ProcessingContext<PdfExtractImagesOptions>,
): Promise<ProcessingResult> {
  const { files, options, onProgress, signal } = ctx;
  const file = files[0]!;

  onProgress(0.05);
  const buffer = await file.file.arrayBuffer();
  const basename = file.name.replace(/\.pdf$/i, '');
  onProgress(0.1);

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: PdfExtractImagesWorkerInput = { buffer, options, basename };

  const { images } = await runInWorker<PdfExtractImagesWorkerResult>({
    worker,
    input,
    transfer: [buffer],
    signal,
    onProgress: (p) => onProgress(0.1 + p * 0.9),
  });

  const outputs: ProcessingResultBlob[] = images.map((im) => ({
    blob: new Blob([im.bytes as BlobPart], { type: im.mime }),
    filename: im.filename,
    bytes: im.bytes.length,
  }));

  onProgress(1);
  return { outputs };
}
