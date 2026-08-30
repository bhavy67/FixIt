import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import type { PdfToZipOptions } from './options';
import { processPdfToZip } from './processor';

export const pdfToZipTool: ToolDefinition<PdfToZipOptions> = {
  ...meta,
  process: processPdfToZip,
};
