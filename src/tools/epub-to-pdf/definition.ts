import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import type { EpubToPdfOptions } from './options';
import { processEpubToPdf } from './processor';

export const epubToPdfTool: ToolDefinition<EpubToPdfOptions> = {
  ...meta,
  process: processEpubToPdf,
};
