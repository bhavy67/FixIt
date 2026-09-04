/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { ResizeOrientation, ResizePageSize } from './options';
import type { PdfPageSizeWorkerInput, PdfPageSizeWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(
  message: WorkerMessage<PdfPageSizeWorkerResult>,
  transfer?: Transferable[],
): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

const PT_TO_MM = 0.352778;

interface KnownFormat {
  name: string;
  w: number;
  h: number;
}

const KNOWN: KnownFormat[] = [
  { name: 'A0', w: 2384, h: 3370 },
  { name: 'A1', w: 1684, h: 2384 },
  { name: 'A2', w: 1191, h: 1684 },
  { name: 'A3', w: 842, h: 1191 },
  { name: 'A4', w: 595, h: 842 },
  { name: 'A5', w: 420, h: 595 },
  { name: 'A6', w: 298, h: 420 },
  { name: 'US Letter', w: 612, h: 792 },
  { name: 'US Legal', w: 612, h: 1008 },
  { name: 'US Tabloid', w: 792, h: 1224 },
  { name: 'B4', w: 709, h: 1001 },
  { name: 'B5', w: 499, h: 709 },
];

function detectFormat(w: number, h: number): string {
  const TOL = 3;
  for (const f of KNOWN) {
    if (Math.abs(w - f.w) <= TOL && Math.abs(h - f.h) <= TOL) return `${f.name} Portrait`;
    if (Math.abs(w - f.h) <= TOL && Math.abs(h - f.w) <= TOL) return `${f.name} Landscape`;
  }
  return 'Custom';
}

const TARGET_SIZES_PT: Record<ResizePageSize, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008],
  a3: [841.89, 1190.55],
  a5: [419.53, 595.28],
};

function resolveTarget(
  size: ResizePageSize,
  orientation: ResizeOrientation,
  srcW: number,
  srcH: number,
): [number, number] {
  const [w, h] = TARGET_SIZES_PT[size];
  const srcIsLandscape = srcW > srcH;
  if (orientation === 'landscape') return [Math.max(w, h), Math.min(w, h)];
  if (orientation === 'portrait') return [Math.min(w, h), Math.max(w, h)];
  return srcIsLandscape ? [Math.max(w, h), Math.min(w, h)] : [Math.min(w, h), Math.max(w, h)];
}

ctx.addEventListener('message', async (e: MessageEvent<PdfPageSizeWorkerInput>) => {
  try {
    const { buffer, options } = e.data;
    const { PDFDocument } = await import('pdf-lib');

    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    if (options.mode === 'inspect') {
      const result = pages.map((page, i) => {
        const { width, height } = page.getSize();
        const rotation = page.getRotation().angle;
        const [w, h] =
          rotation === 90 || rotation === 270 ? [height, width] : [width, height];
        return {
          page: i + 1,
          width_pt: Math.round(w * 100) / 100,
          height_pt: Math.round(h * 100) / 100,
          width_mm: Math.round(w * PT_TO_MM * 10) / 10,
          height_mm: Math.round(h * PT_TO_MM * 10) / 10,
          rotation_deg: rotation,
          format: detectFormat(Math.round(w), Math.round(h)),
        };
      });
      const output = { pageCount: pages.length, pages: result };
      post({ type: 'progress', value: 0.9 });
      post({ type: 'result', value: { kind: 'json', json: JSON.stringify(output, null, 2) } });
      return;
    }

    // Resize mode: embed each source page as a form XObject (preserves text /
    // vectors) and draw it centred + scaled onto a new fixed-size page.
    const outDoc = await PDFDocument.create();
    const embedded = await outDoc.embedPages(pages);
    for (let i = 0; i < embedded.length; i++) {
      const src = pages[i]!;
      const { width: srcW, height: srcH } = src.getSize();
      const [tw, th] = resolveTarget(options.targetSize, options.orientation, srcW, srcH);
      const scale = Math.min(tw / srcW, th / srcH);
      const drawW = srcW * scale;
      const drawH = srcH * scale;
      const x = (tw - drawW) / 2;
      const y = (th - drawH) / 2;
      const newPage = outDoc.addPage([tw, th]);
      newPage.drawPage(embedded[i]!, { x, y, width: drawW, height: drawH });
      post({ type: 'progress', value: (i + 1) / embedded.length });
    }

    const bytes = await outDoc.save();
    post({ type: 'result', value: { kind: 'pdf', bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
