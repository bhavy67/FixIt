import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfCropOptions } from './options';
import { processPdfCrop } from './processor';
import { PdfCropOptionsForm } from './options-form';

export const pdfCropTool: ToolDefinition<PdfCropOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfCropOptionsForm,
  process: processPdfCrop,
};
