/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfHeadersFootersWorkerInput, PdfHeadersFootersWorkerResult } from './worker-types';
import type { Alignment } from './options';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(
  message: WorkerMessage<PdfHeadersFootersWorkerResult>,
  transfer?: Transferable[],
): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

function resolveTokens(template: string, page: number, total: number): string {
  return template.replace(/\{page\}/g, String(page)).replace(/\{total\}/g, String(total));
}

function calcX(alignment: Alignment, textWidth: number, pageWidth: number, margin: number): number {
  if (alignment === 'center') return (pageWidth - textWidth) / 2;
  if (alignment === 'right') return pageWidth - textWidth - margin;
  return margin;
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

const MARGIN = 28; // points (~10mm)

ctx.addEventListener('message', async (e: MessageEvent<PdfHeadersFootersWorkerInput>) => {
  try {
    const { buffer, options } = e.data;
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

    const doc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
    });

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
    const numberedTotal = total - options.skipFirstN;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]!;
      const { width, height } = page.getSize();

      if (i < options.skipFirstN) {
        post({ type: 'progress', value: (i + 1) / pages.length });
        continue;
      }

      const displayPage = i - options.skipFirstN + 1;

      const header = resolveTokens(options.headerText, displayPage, numberedTotal).trim();
      if (header) {
        const textWidth = font.widthOfTextAtSize(header, options.fontSize);
        const x = calcX(options.alignment, textWidth, width, MARGIN);
        const y = height - MARGIN - options.fontSize;
        page.drawText(header, {
          x,
          y,
          size: options.fontSize,
          font,
          color: rgb(0, 0, 0),
          opacity: 0.7,
        });
      }

      const footer = resolveTokens(options.footerText, displayPage, numberedTotal).trim();
      if (footer) {
        const textWidth = font.widthOfTextAtSize(footer, options.fontSize);
        const x = calcX(options.alignment, textWidth, width, MARGIN);
        page.drawText(footer, {
          x,
          y: MARGIN,
          size: options.fontSize,
          font,
          color: rgb(0, 0, 0),
          opacity: 0.7,
        });
      }

      post({ type: 'progress', value: (i + 1) / pages.length });
    }

    const bytes = await doc.save();
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
