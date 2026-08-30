import type { ProcessingContext, ProcessingResult, ProcessingResultBlob } from '@/core/tool-types';
import type { PdfOcrOptions } from './options';

export async function processPdfOcr(
  ctx: ProcessingContext<PdfOcrOptions>,
): Promise<ProcessingResult> {
  const { files, options, onProgress, signal } = ctx;
  const scaleMap = { standard: 1.5, high: 2.0 };
  const scale = scaleMap[options.quality];

  onProgress(0.05);

  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker(options.lang);

  try {
    const outputs: ProcessingResultBlob[] = [];

    for (let fi = 0; fi < files.length; fi++) {
      if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
      const file = files[fi]!;
      const fileBase = 0.05 + (fi / files.length) * 0.9;
      const fileStep = 0.9 / files.length;

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
          onProgress(fileBase + (pageNum / numPages) * fileStep);
        }

        text = pageTexts.join('\n\n');
      } else {
        // image: recognize directly
        const { data } = await worker.recognize(file.file);
        text = data.text;
        onProgress(fileBase + fileStep);
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
