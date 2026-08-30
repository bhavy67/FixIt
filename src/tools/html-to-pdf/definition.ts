import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import type { HtmlToPdfOptions } from './options';
import { processHtmlToPdf } from './processor';

export const htmlToPdfTool: ToolDefinition<HtmlToPdfOptions> = {
  ...meta,
  process: processHtmlToPdf,
};
