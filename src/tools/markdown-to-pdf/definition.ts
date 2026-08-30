import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import type { MarkdownToPdfOptions } from './options';
import { processMarkdownToPdf } from './processor';

export const markdownToPdfTool: ToolDefinition<MarkdownToPdfOptions> = {
  ...meta,
  process: processMarkdownToPdf,
};
