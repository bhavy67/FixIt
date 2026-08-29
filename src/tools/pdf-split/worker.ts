/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfSplitWorkerInput, PdfSplitWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(message: WorkerMessage<PdfSplitWorkerResult>, transfer?: Transferable[]): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

function parseRangeSegments(rangesStr: string, total: number): number[][] {
  const segments: number[][] = [];
  for (const part of rangesStr.split(',')) {
    const seg = part.trim();
    if (!seg) continue;
    if (seg.includes('-')) {
      const [a, b] = seg.split('-').map(Number);
      const from = Math.max(1, a ?? 1);
      const to = Math.min(total, b ?? total);
      const indices: number[] = [];
      for (let i = from; i <= to; i++) indices.push(i - 1);
      if (indices.length > 0) segments.push(indices);
    } else {
      const n = Number(seg);
      if (Number.isFinite(n) && n >= 1 && n <= total) segments.push([n - 1]);
    }
  }
  return segments;
}

ctx.addEventListener('message', async (e: MessageEvent<PdfSplitWorkerInput>) => {
  try {
    const { buffer, options } = e.data;
    const { PDFDocument } = await import('pdf-lib');

    const src = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const total = src.getPageCount();
    const files: Array<{ name: string; bytes: Uint8Array }> = [];

    if (options.mode === 'each-page') {
      for (let i = 0; i < total; i++) {
        const out = await PDFDocument.create();
        const [copied] = await out.copyPages(src, [i]);
        out.addPage(copied!);
        const bytes = await out.save();
        files.push({ name: `page-${i + 1}.pdf`, bytes });
        post({ type: 'progress', value: (i + 1) / total });
      }
    } else {
      const segments = parseRangeSegments(options.ranges, total);
      for (let s = 0; s < segments.length; s++) {
        const indices = segments[s]!;
        const out = await PDFDocument.create();
        const copied = await out.copyPages(src, indices);
        copied.forEach((p) => out.addPage(p));
        const bytes = await out.save();
        const label = indices.length === 1
          ? `page-${(indices[0] ?? 0) + 1}`
          : `pages-${(indices[0] ?? 0) + 1}-${(indices[indices.length - 1] ?? 0) + 1}`;
        files.push({ name: `${label}.pdf`, bytes });
        post({ type: 'progress', value: (s + 1) / segments.length });
      }
    }

    const transfer = files.map((f) => f.bytes.buffer as ArrayBuffer);
    post({ type: 'result', value: { files } }, transfer);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
