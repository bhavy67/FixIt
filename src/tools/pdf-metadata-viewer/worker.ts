/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfMetaViewWorkerInput, PdfMetaViewWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(message: WorkerMessage<PdfMetaViewWorkerResult>): void {
  ctx.postMessage(message);
}

/**
 * Parses "%PDF-1.7" (or "%PDF-2.0") from the first 32 bytes without relying
 * on pdf-lib internals (which don't expose header parsing publicly).
 */
function readPdfVersion(buffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buffer, 0, Math.min(32, buffer.byteLength));
  let head = '';
  for (const b of bytes) head += String.fromCharCode(b);
  const m = head.match(/%PDF-(\d\.\d)/);
  return m ? m[1]! : null;
}

ctx.addEventListener('message', async (e: MessageEvent<PdfMetaViewWorkerInput>) => {
  try {
    const { buffer } = e.data;
    const { PDFDocument, PDFName, PDFDict, PDFArray } = await import('pdf-lib');

    const version = readPdfVersion(buffer);
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

    // Enumerate embedded fonts by walking each page's Resources → Font dict
    // and collecting unique BaseFont names.
    const fonts = new Set<string>();
    for (const page of doc.getPages()) {
      const resources = page.node.Resources();
      const fontDict = resources?.get(PDFName.of('Font'));
      if (!(fontDict instanceof PDFDict)) continue;
      for (const [, ref] of fontDict.entries()) {
        const fontObj = ref instanceof PDFDict ? ref : doc.context.lookup(ref, PDFDict);
        if (!(fontObj instanceof PDFDict)) continue;
        const baseFont = fontObj.get(PDFName.of('BaseFont'));
        if (baseFont) fonts.add(String(baseFont).replace(/^\//, ''));
      }
    }

    // Detect a JavaScript action anywhere in the standard places: catalog
    // OpenAction, /AA (Additional Actions), and /Names /JavaScript.
    const catalog = doc.catalog;
    let hasJavaScript = false;
    const openAction = catalog.get(PDFName.of('OpenAction'));
    if (openAction instanceof PDFDict) {
      const s = openAction.get(PDFName.of('S'));
      if (s && String(s) === '/JavaScript') hasJavaScript = true;
    }
    const aa = catalog.get(PDFName.of('AA'));
    if (aa instanceof PDFDict && aa.entries().length > 0) hasJavaScript = true;
    const names = catalog.get(PDFName.of('Names'));
    if (names instanceof PDFDict && names.get(PDFName.of('JavaScript'))) hasJavaScript = true;

    // Attachments: catalog /Names /EmbeddedFiles.
    let attachments = 0;
    if (names instanceof PDFDict) {
      const ef = names.get(PDFName.of('EmbeddedFiles'));
      if (ef instanceof PDFDict) {
        const namesArr = ef.get(PDFName.of('Names'));
        if (namesArr instanceof PDFArray) attachments = Math.floor(namesArr.size() / 2);
      }
    }

    // Form field count.
    let formFieldCount = 0;
    try {
      formFieldCount = doc.getForm().getFields().length;
    } catch {
      /* ignore */
    }

    const hasXmpMetadata = catalog.get(PDFName.of('Metadata')) !== undefined;

    const info = {
      pdfVersion: version,
      pageCount: doc.getPageCount(),
      isEncrypted: doc.isEncrypted,
      hasJavaScript,
      hasXmpMetadata,
      formFieldCount,
      attachmentCount: attachments,
      embeddedFonts: Array.from(fonts).sort(),
      title: doc.getTitle() ?? '',
      author: doc.getAuthor() ?? '',
      subject: doc.getSubject() ?? '',
      keywords: doc.getKeywords() ?? '',
      creator: doc.getCreator() ?? '',
      producer: doc.getProducer() ?? '',
      creationDate: doc.getCreationDate()?.toISOString() ?? '',
      modificationDate: doc.getModificationDate()?.toISOString() ?? '',
    };

    post({ type: 'progress', value: 0.9 });
    post({ type: 'result', value: { json: JSON.stringify(info, null, 2) } });
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
