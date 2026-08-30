import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfWatermarkOptions } from './options';
import { PdfWatermarkOptionsForm } from './options-form';
import { processPdfWatermark } from './processor';

export const pdfWatermarkTool: ToolDefinition<PdfWatermarkOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfWatermarkOptionsForm,
  process: processPdfWatermark,
};
