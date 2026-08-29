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
}

ensureRegistered();

/** Idempotent re-registration hook (useful for tests). */
export function registerAllTools(): void {
  registered = false;
  ensureRegistered();
}
