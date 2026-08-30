/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfPageSizeWorkerInput, PdfPageSizeWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(message: WorkerMessage<PdfPageSizeWorkerResult>): void {
  ctx.postMessage(message);
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
  const TOL = 3; // points tolerance
  for (const f of KNOWN) {
    if (Math.abs(w - f.w) <= TOL && Math.abs(h - f.h) <= TOL) return `${f.name} Portrait`;
    if (Math.abs(w - f.h) <= TOL && Math.abs(h - f.w) <= TOL) return `${f.name} Landscape`;
  }
  return 'Custom';
}

ctx.addEventListener('message', async (e: MessageEvent<PdfPageSizeWorkerInput>) => {
  try {
    const { buffer } = e.data;
    const { PDFDocument } = await import('pdf-lib');

    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    const result = pages.map((page, i) => {
      const { width, height } = page.getSize();
      const rotation = page.getRotation().angle;
      // Swap dimensions if page is rotated 90/270
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

    const output = {
      pageCount: pages.length,
      pages: result,
    };

    post({ type: 'progress', value: 0.9 });
    post({ type: 'result', value: { json: JSON.stringify(output, null, 2) } });
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
