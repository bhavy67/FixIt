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

/**
 * Full-spec RFC 4180 parser: handles quoted fields, embedded newlines, escaped
 * `""` quotes, CRLF line endings, and empty trailing rows.
 */
function parseCSV(text: string, sep: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQ = false;
  const s = sep[0]!;

  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQ = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQ = true;
    } else if (c === s) {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      row.push(field);
      field = '';
      // Skip \n after \r
      if (c === '\r' && text[i + 1] === '\n') i++;
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== '') rows.push(row);
  }
  return rows;
}

function wrapCell(text: string, font: {
  widthOfTextAtSize: (t: string, s: number) => number;
}, size: number, maxWidth: number): string[] {
  if (!text) return [''];
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      cur = test;
    } else {
      if (cur) lines.push(cur);
      // char break for long words
      if (font.widthOfTextAtSize(w, size) > maxWidth) {
        let chunk = '';
        for (const ch of w) {
          if (font.widthOfTextAtSize(chunk + ch, size) > maxWidth && chunk) {
            lines.push(chunk);
            chunk = ch;
          } else {
            chunk += ch;
          }
        }
        cur = chunk;
      } else {
        cur = w;
      }
    }
  }
  if (cur) lines.push(cur);
  if (lines.length === 0) lines.push('');
  return lines;
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
    const fontSize = 9;
    const lineH = fontSize * 1.3;
    const PADDING = 4;

    let page = doc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    const cellHeight = (row: string[]): number => {
      let maxLines = 1;
      for (const cell of row) {
        const wrapped = wrapCell(cell, fontReg, fontSize, colW - PADDING * 2);
        if (wrapped.length > maxLines) maxLines = wrapped.length;
      }
      return maxLines * lineH + PADDING * 2;
    };

    for (let ri = 0; ri < rows.length; ri++) {
      const row = rows[ri]!;
      const isHeader = hasHeader && ri === 0;
      const h = cellHeight(row);
      if (y - h < MARGIN) {
        page = doc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN;
      }

      if (isHeader) {
        page.drawRectangle({
          x: MARGIN,
          y: y - h,
          width: availW,
          height: h,
          color: rgb(0.9, 0.9, 0.9),
        });
      }

      for (let ci = 0; ci < numCols; ci++) {
        const cellX = MARGIN + ci * colW;
        page.drawRectangle({
          x: cellX,
          y: y - h,
          width: colW,
          height: h,
          borderColor: rgb(0.7, 0.7, 0.7),
          borderWidth: 0.5,
        });
        const cellText = row[ci] ?? '';
        const wrapped = wrapCell(cellText, fontReg, fontSize, colW - PADDING * 2);
        let ty = y - PADDING - fontSize;
        for (const line of wrapped) {
          page.drawText(line, {
            x: cellX + PADDING,
            y: ty,
            size: fontSize,
            font: isHeader ? fontBold : fontReg,
            color: rgb(0, 0, 0),
          });
          ty -= lineH;
        }
      }
      y -= h;

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
