import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfCompressLevel, PdfCompressOptions } from './options';
import type { PdfCompressWorkerInput, PdfCompressWorkerResult } from './worker-types';

const RASTER_CONFIG: Record<Exclude<PdfCompressLevel, 'lossless'>, { scale: number; quality: number }> = {
  light: { scale: 150 / 72, quality: 0.85 },
  strong: { scale: 100 / 72, quality: 0.65 },
};

export async function processPdfCompress(
  ctx: ProcessingContext<PdfCompressOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;

  onProgress(0.05);
  const buffer = await files[0]!.file.arrayBuffer();
  const base = files[0]!.name.replace(/\.pdf$/i, '');

  if (options.level === 'lossless') {
    return runLossless(buffer, base, options, signal, onProgress);
  }
  return runRasterize(buffer, base, options, signal, onProgress);
}

async function runLossless(
  buffer: ArrayBuffer,
  base: string,
  options: PdfCompressOptions,
  signal: AbortSignal,
  onProgress: (p: number) => void,
): Promise<ProcessingResult> {
  onProgress(0.3);
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: PdfCompressWorkerInput = { buffer, stripMetadata: options.stripMetadata };
  const { bytes } = await runInWorker<PdfCompressWorkerResult>({
    worker,
    input,
    transfer: [buffer],
    signal,
    onProgress: (p) => onProgress(0.3 + p * 0.7),
  });
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return { outputs: [{ blob, filename: `${base}-compressed.pdf`, bytes: blob.size }] };
}

async function runRasterize(
  buffer: ArrayBuffer,
  base: string,
  options: PdfCompressOptions,
  signal: AbortSignal,
  onProgress: (p: number) => void,
): Promise<ProcessingResult> {
  const { scale, quality } = RASTER_CONFIG[options.level as 'light' | 'strong'];

  onProgress(0.05);
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const { PDFDocument, PDFName } = await import('pdf-lib');
  const outDoc = await PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
    const page = await pdf.getPage(i);
    const vp1 = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) throw new Error('Could not create canvas context.');
    // White background for JPEG (no alpha).
    ctx2d.fillStyle = 'white';
    ctx2d.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx2d, viewport: vp, canvas }).promise;

    const jpegBlob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('canvas export failed'))),
        'image/jpeg',
        quality,
      ),
    );
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const img = await outDoc.embedJpg(jpegBytes);
    const newPage = outDoc.addPage([vp1.width, vp1.height]);
    newPage.drawImage(img, { x: 0, y: 0, width: vp1.width, height: vp1.height });

    onProgress(0.05 + (i / pdf.numPages) * 0.9);
  }

  if (options.stripMetadata) {
    outDoc.setTitle('');
    outDoc.setAuthor('');
    outDoc.setSubject('');
    outDoc.setKeywords([]);
    outDoc.setCreator('');
    outDoc.setProducer('');
    outDoc.catalog.delete(PDFName.of('Metadata'));
  }

  const bytes = await outDoc.save({ useObjectStreams: true });
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  onProgress(1);
  return { outputs: [{ blob, filename: `${base}-compressed.pdf`, bytes: blob.size }] };
}
