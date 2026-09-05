/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfPageNumbersWorkerInput, PdfPageNumbersWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(
  message: WorkerMessage<PdfPageNumbersWorkerResult>,
  transfer?: Transferable[],
): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

const MARGIN = 28; // points (~10mm)

function resolvePattern(pattern: string, page: number, total: number): string {
  return pattern.replace(/\{page\}/g, String(page)).replace(/\{total\}/g, String(total));
}

async function loadUnicodeFont(): Promise<Uint8Array | null> {
  try {
    const res = await fetch('/fonts/Geist-Regular.ttf');
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

ctx.addEventListener('message', async (e: MessageEvent<PdfPageNumbersWorkerInput>) => {
  try {
    const { buffer, options } = e.data;
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

    let font;
    const ttfBytes = await loadUnicodeFont();
    if (ttfBytes) {
      const fontkit = (await import('@pdf-lib/fontkit')).default;
      doc.registerFontkit(fontkit);
      font = await doc.embedFont(ttfBytes, { subset: true });
    } else {
      font = await doc.embedFont(StandardFonts.Helvetica);
    }

    const pages = doc.getPages();
    const total = pages.length;
    const isTop = options.position.startsWith('top');

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]!;
      const { width, height } = page.getSize();

      if (i < options.skipFirstN) {
        post({ type: 'progress', value: (i + 1) / pages.length });
        continue;
      }

      const displayNum = options.startNumber + (i - options.skipFirstN);
      const label = resolvePattern(options.pattern, displayNum, total - options.skipFirstN);
      const textWidth = font.widthOfTextAtSize(label, options.fontSize);

      let x: number;
      if (options.position.endsWith('center')) {
        x = (width - textWidth) / 2;
      } else if (options.position.endsWith('right')) {
        x = width - textWidth - MARGIN;
      } else {
        x = MARGIN;
      }
      const y = isTop ? height - MARGIN - options.fontSize : MARGIN;

      page.drawText(label, {
        x,
        y,
        size: options.fontSize,
        font,
        color: rgb(0, 0, 0),
        opacity: 0.7,
      });

      post({ type: 'progress', value: (i + 1) / pages.length });
    }

    const bytes = await doc.save();
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
