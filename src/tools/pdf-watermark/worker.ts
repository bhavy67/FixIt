/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfWatermarkWorkerInput, PdfWatermarkWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(message: WorkerMessage<PdfWatermarkWorkerResult>, transfer?: Transferable[]): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

async function loadUnicodeFont(): Promise<Uint8Array | null> {
  try {
    const res = await fetch('/fonts/Geist-Bold.ttf');
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

ctx.addEventListener('message', async (e: MessageEvent<PdfWatermarkWorkerInput>) => {
  try {
    const { buffer, text, opacity, rotation, fontSize } = e.data;
    const { PDFDocument, rgb, degrees, StandardFonts } = await import('pdf-lib');

    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

    let font;
    const ttfBytes = await loadUnicodeFont();
    if (ttfBytes) {
      const fontkit = (await import('@pdf-lib/fontkit')).default;
      doc.registerFontkit(fontkit);
      font = await doc.embedFont(ttfBytes, { subset: true });
    } else {
      font = await doc.embedFont(StandardFonts.HelveticaBold);
    }

    const pages = doc.getPages();
    const lines = text.split('\n');
    const lineHeight = fontSize * 1.25;
    const blockHeight = lineHeight * lines.length;
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]!;
      const { width, height } = page.getSize();
      const cx = width / 2;
      const cy = height / 2;

      for (let li = 0; li < lines.length; li++) {
        const line = lines[li]!;
        if (!line) continue;
        const lineW = font.widthOfTextAtSize(line, fontSize);
        // Offset of this line's baseline relative to the centre of the whole
        // text block, in unrotated local coordinates. dy > 0 = above centre.
        const dy = blockHeight / 2 - lineHeight * li - fontSize;
        const localX = -lineW / 2;
        // Rotate local (localX, dy) into world space around the page centre.
        const wx = cx + localX * cos - dy * sin;
        const wy = cy + localX * sin + dy * cos;

        page.drawText(line, {
          x: wx,
          y: wy,
          size: fontSize,
          font,
          color: rgb(0.4, 0.4, 0.4),
          opacity,
          rotate: degrees(rotation),
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
