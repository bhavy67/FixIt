import { registerTool } from '@/core/tool-registry';
import { imageResizeTool } from './image-resize/definition';
import { jsonFormatterTool } from './json-formatter/definition';
import { pdfMergeTool } from './pdf-merge/definition';
import { pdfSplitTool } from './pdf-split/definition';
import { pdfExtractPagesTool } from './pdf-extract-pages/definition';
import { pdfDeletePagesTool } from './pdf-delete-pages/definition';
import { pdfReorderPagesTool } from './pdf-reorder-pages/definition';
import { pdfRotateTool } from './pdf-rotate/definition';
import { pdfCompressTool } from './pdf-compress/definition';
import { pdfMetaRemoverTool } from './pdf-metadata-remover/definition';
import { pdfMetaViewerTool } from './pdf-metadata-viewer/definition';
import { pdfToJpgTool } from './pdf-to-jpg/definition';
import { pdfToPngTool } from './pdf-to-png/definition';
import { pdfToWebpTool } from './pdf-to-webp/definition';
import { jpgToPdfTool } from './jpg-to-pdf/definition';
import { pngToPdfTool } from './png-to-pdf/definition';
import { imagesToPdfTool } from './images-to-pdf/definition';
import { pdfWatermarkTool } from './pdf-watermark/definition';
import { pdfPageNumbersTool } from './pdf-page-numbers/definition';
import { pdfPageSizeTool } from './pdf-page-size/definition';
import { pdfRepairTool } from './pdf-repair/definition';
import { pdfCompareTool } from './pdf-compare/definition';
import { pdfFingerprintTool } from './pdf-fingerprint/definition';
import { pdfFlattenTool } from './pdf-flatten/definition';
import { pdfExtractTextTool } from './pdf-extract-text/definition';
import { pdfHeadersFootersTool } from './pdf-headers-footers/definition';
import { pdfToAudioTool } from './pdf-to-audio/definition';
import { pdfToZipTool } from './pdf-to-zip/definition';
import { pdfInvertColorsTool } from './pdf-invert-colors/definition';
import { pdfFormFillTool } from './pdf-form-fill/definition';
import { markdownToPdfTool } from './markdown-to-pdf/definition';
import { htmlToPdfTool } from './html-to-pdf/definition';
import { txtToPdfTool } from './txt-to-pdf/definition';
import { csvToPdfTool } from './csv-to-pdf/definition';
import { epubToPdfTool } from './epub-to-pdf/definition';
import { pdfSignTool } from './pdf-sign/definition';
import { pdfCropTool } from './pdf-crop/definition';
import { pdfRedactTool } from './pdf-redact/definition';
import { pdfOcrTool } from './pdf-ocr/definition';
import { pdfEncryptTool } from './pdf-encrypt/definition';
import { pdfExtractImagesTool } from './pdf-extract-images/definition';

// Side effect: run once when this module is first imported.
let registered = false;
function ensureRegistered(): void {
  if (registered) return;
  registered = true;
  registerTool(imageResizeTool);
  registerTool(jsonFormatterTool);
  registerTool(pdfMergeTool);
  registerTool(pdfSplitTool);
  registerTool(pdfExtractPagesTool);
  registerTool(pdfDeletePagesTool);
  registerTool(pdfReorderPagesTool);
  registerTool(pdfRotateTool);
  registerTool(pdfCompressTool);
  registerTool(pdfMetaRemoverTool);
  registerTool(pdfMetaViewerTool);
  registerTool(pdfToJpgTool);
  registerTool(pdfToPngTool);
  registerTool(pdfToWebpTool);
  registerTool(jpgToPdfTool);
  registerTool(pngToPdfTool);
  registerTool(imagesToPdfTool);
  registerTool(pdfWatermarkTool);
  registerTool(pdfPageNumbersTool);
  registerTool(pdfPageSizeTool);
  registerTool(pdfRepairTool);
  registerTool(pdfCompareTool);
  registerTool(pdfFingerprintTool);
  registerTool(pdfFlattenTool);
  registerTool(pdfExtractTextTool);
  registerTool(pdfHeadersFootersTool);
  registerTool(pdfToAudioTool);
  registerTool(pdfToZipTool);
  registerTool(pdfInvertColorsTool);
  registerTool(pdfFormFillTool);
  registerTool(markdownToPdfTool);
  registerTool(htmlToPdfTool);
  registerTool(txtToPdfTool);
  registerTool(csvToPdfTool);
  registerTool(epubToPdfTool);
  registerTool(pdfSignTool);
  registerTool(pdfCropTool);
  registerTool(pdfRedactTool);
  registerTool(pdfOcrTool);
  registerTool(pdfEncryptTool);
  registerTool(pdfExtractImagesTool);
}

ensureRegistered();

/** Idempotent re-registration hook (useful for tests). */
export function registerAllTools(): void {
  registered = false;
  ensureRegistered();
}
