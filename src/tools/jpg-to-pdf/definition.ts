import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type JpgToPdfOptions } from './options';
import { processJpgToPdf } from './processor';

export const jpgToPdfTool: ToolDefinition<JpgToPdfOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  process: processJpgToPdf,
};
