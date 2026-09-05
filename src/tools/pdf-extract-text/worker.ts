/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfExtractTextWorkerInput, PdfExtractTextWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(
  message: WorkerMessage<PdfExtractTextWorkerResult>,
  transfer?: Transferable[],
): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

ctx.addEventListener('message', async (e: MessageEvent<PdfExtractTextWorkerInput>) => {
  try {
    const { buffer } = e.data;
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();

    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    const parts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      // Group text items into lines by shared Y baseline; emit blank lines
      // when Y jumps more than a full line height (paragraph break).
      const lines: string[] = [];
      let currentY: number | null = null;
      let lastLineHeight = 10;
      let currentLine = '';

      for (const item of content.items) {
        if (!('str' in item)) continue;
        const typedItem = item as { str: string; transform: number[]; hasEOL?: boolean };
        const y = Math.round(typedItem.transform[5] ?? 0);
        const h = Math.abs(typedItem.transform[3] ?? 10) || 10;

        if (currentY !== null && y !== currentY) {
          if (currentLine.trim()) lines.push(currentLine.trim());
          currentLine = '';
          if (Math.abs(currentY - y) > lastLineHeight * 1.5) lines.push('');
        }
        currentY = y;
        lastLineHeight = h;
        currentLine += typedItem.str;
        if (typedItem.hasEOL) {
          if (currentLine.trim()) lines.push(currentLine.trim());
          currentLine = '';
          currentY = null;
        }
      }
      if (currentLine.trim()) lines.push(currentLine.trim());

      const pageText = lines.join('\n').trim();
      if (pageText) parts.push(`=== Page ${i} ===\n${pageText}`);
      post({ type: 'progress', value: i / pdf.numPages });
    }

    const text = parts.join('\n\n');
    post({ type: 'result', value: { text } });
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
