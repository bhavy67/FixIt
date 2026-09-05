import type { ProcessingContext, ProcessingResult, ProcessingResultBlob } from '@/core/tool-types';
import type { PdfOcrOptions } from './options';

export async function processPdfOcr(
  ctx: ProcessingContext<PdfOcrOptions>,
): Promise<ProcessingResult> {
  const { files, options, onProgress, signal } = ctx;
  const scaleMap = { standard: 1.5, high: 2.0 };
  const scale = scaleMap[options.quality];

  onProgress(0.02);

  // Compute a stable progress window for each page across all files, so
  // tesseract's fine-grained logger events map cleanly onto the tool's bar.
  const totalPages = await countPages(files, options);
  let progressBase = 0.05;
  const usable = 0.9;
  const perPage = totalPages > 0 ? usable / totalPages : usable;

  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker(options.lang, 1, {
    // tesseract.js v7 caches language data in IndexedDB by default — this
    // just ensures we hit the cache on subsequent runs.
    cachePath: '/',
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        onProgress(Math.min(0.98, progressBase + m.progress * perPage));
      }
    },
  });

  try {
    const outputs: ProcessingResultBlob[] = [];

    for (let fi = 0; fi < files.length; fi++) {
      if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
      const file = files[fi]!;
      let text: string;

      if (file.kind === 'pdf') {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();

        const buffer = await file.file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
        const numPages = pdfDoc.numPages;
        const pageTexts: string[] = [];

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx2d = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx2d, viewport, canvas }).promise;

          const { data } = await worker.recognize(canvas);
          pageTexts.push(numPages > 1 ? `--- Page ${pageNum} ---\n${data.text}` : data.text);
          progressBase = Math.min(0.95, progressBase + perPage);
          onProgress(progressBase);
        }

        text = pageTexts.join('\n\n');
      } else {
        const { data } = await worker.recognize(file.file);
        text = data.text;
        progressBase = Math.min(0.95, progressBase + perPage);
        onProgress(progressBase);
      }

      const blob = new Blob([text.trim()], { type: 'text/plain' });
      const base = file.name.replace(/\.[^.]+$/i, '');
      outputs.push({ blob, filename: `${base}-ocr.txt`, bytes: blob.size });
    }

    onProgress(1);
    return { outputs };
  } finally {
    await worker.terminate();
  }
}

async function countPages(
  files: ProcessingContext<PdfOcrOptions>['files'],
  _options: PdfOcrOptions,
): Promise<number> {
  let total = 0;
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  for (const file of files) {
    if (file.kind === 'pdf') {
      const buf = await file.file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
      total += doc.numPages;
    } else {
      total += 1;
    }
  }
  return total;
}
