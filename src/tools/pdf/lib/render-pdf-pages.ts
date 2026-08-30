export interface RenderPdfOptions {
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number;
  scale: number;
  basename: string;
}

export interface RenderedPage {
  blob: Blob;
  filename: string;
  bytes: number;
}

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas.toBlob returned null'));
      },
      type,
      quality,
    );
  });
}

export async function renderPdfPages(
  buffer: ArrayBuffer,
  opts: RenderPdfOptions,
  onProgress: (p: number) => void,
  signal: AbortSignal,
): Promise<RenderedPage[]> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  const total = pdf.numPages;
  const results: RenderedPage[] = [];
  const ext = EXT[opts.format] ?? 'png';
  const padLen = String(total).length;

  for (let i = 1; i <= total; i++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: opts.scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const blob = await canvasToBlob(canvas, opts.format, opts.quality);
    const pageLabel = String(i).padStart(padLen, '0');
    results.push({
      blob,
      filename: `${opts.basename}-page-${pageLabel}.${ext}`,
      bytes: blob.size,
    });

    onProgress(i / total);
  }

  return results;
}
