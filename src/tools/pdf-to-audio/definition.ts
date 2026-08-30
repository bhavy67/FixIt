import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfToAudioOptions } from './options';
import { processPdfToAudio } from './processor';

export const pdfToAudioTool: ToolDefinition<PdfToAudioOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  process: processPdfToAudio,
};
