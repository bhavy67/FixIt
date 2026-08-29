import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfMetaViewOptions } from './options';
import { processPdfMetaView } from './processor';

export const pdfMetaViewerTool: ToolDefinition<PdfMetaViewOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  process: processPdfMetaView,
};
