/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { CsvToPdfWorkerInput, CsvToPdfWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(
  message: WorkerMessage<CsvToPdfWorkerResult>,
  transfer?: Transferable[],
): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

function parseCSV(text: string, sep: string): string[][] {
  return text
    .split('\n')
    .filter((l) => l.trim())
    .map((line) => {
      const cells: string[] = [];
      let cur = '';
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i]!;
        if (c === '"') {
          inQ = !inQ;
        } else if (c === sep[0] && !inQ) {
          cells.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      cells.push(cur.trim());
      return cells;
    });
}

ctx.addEventListener('message', async (e: MessageEvent<CsvToPdfWorkerInput>) => {
  try {
    const { text, separator, hasHeader } = e.data;
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

    const rows = parseCSV(text, separator);
    if (rows.length === 0) throw new Error('No data found in CSV');

    post({ type: 'progress', value: 0.2 });

    // Landscape A4
    const PAGE_W = 841.89;
    const PAGE_H = 595.28;
    const MARGIN = 40;
    const doc = await PDFDocument.create();
    const fontReg = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const numCols = Math.max(...rows.map((r) => r.length));
    const availW = PAGE_W - MARGIN * 2;
    const colW = availW / numCols;
    const rowH = 18;
    const fontSize = 9;
    const PADDING = 4;

    let page = doc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    for (let ri = 0; ri < rows.length; ri++) {
      if (y - rowH < MARGIN) {
        page = doc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN;
      }
      const isHeader = hasHeader && ri === 0;
      const row = rows[ri]!;

      // Draw row background for header
      if (isHeader) {
        page.drawRectangle({
          x: MARGIN,
          y: y - rowH,
          width: availW,
          height: rowH,
          color: rgb(0.85, 0.85, 0.85),
        });
      }

      for (let ci = 0; ci < numCols; ci++) {
        const cellX = MARGIN + ci * colW;
        const cellText = (row[ci] ?? '').slice(0, 40); // truncate long cells
        // Draw cell border
        page.drawRectangle({
          x: cellX,
          y: y - rowH,
          width: colW,
          height: rowH,
          borderColor: rgb(0.7, 0.7, 0.7),
          borderWidth: 0.5,
        });
        // Draw text
        if (cellText) {
          page.drawText(cellText, {
            x: cellX + PADDING,
            y: y - rowH + PADDING + 1,
            size: fontSize,
            font: isHeader ? fontBold : fontReg,
            color: rgb(0, 0, 0),
          });
        }
      }
      y -= rowH;

      if (ri % 50 === 0) {
        post({ type: 'progress', value: 0.2 + (ri / rows.length) * 0.7 });
      }
    }

    const bytes = await doc.save();
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
