/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { TxtToPdfWorkerInput, TxtToPdfWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(
  message: WorkerMessage<TxtToPdfWorkerResult>,
  transfer?: Transferable[],
): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

ctx.addEventListener('message', async (e: MessageEvent<TxtToPdfWorkerInput>) => {
  try {
    const { text, fontSize } = e.data;
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Courier); // monospace for TXT

    const PAGE_W = 595.28;
    const PAGE_H = 841.89;
    const MARGIN = 56;
    const availW = PAGE_W - MARGIN * 2;
    const lineH = fontSize * 1.4;

    let page = doc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    const lines = text.split('\n');
    const totalLines = lines.length;
    let processed = 0;

    for (const rawLine of lines) {
      // word-wrap
      const words = rawLine === '' ? [''] : rawLine.split(' ');
      let cur = '';
      const wrapped: string[] = [];

      for (const w of words) {
        const test = cur ? `${cur} ${w}` : w;
        if (font.widthOfTextAtSize(test, fontSize) <= availW) {
          cur = test;
        } else {
          if (cur) wrapped.push(cur);
          cur = w;
        }
      }
      wrapped.push(cur);

      for (const wLine of wrapped) {
        if (y - lineH < MARGIN) {
          page = doc.addPage([PAGE_W, PAGE_H]);
          y = PAGE_H - MARGIN;
        }
        if (wLine) {
          page.drawText(wLine, {
            x: MARGIN,
            y: y - fontSize,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });
        }
        y -= lineH;
      }

      processed++;
      if (processed % 100 === 0) {
        post({ type: 'progress', value: processed / totalLines * 0.9 });
      }
    }

    const bytes = await doc.save();
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
