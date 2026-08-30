import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfExtractImagesOptions } from './options';
import { processPdfExtractImages } from './processor';
import { PdfExtractImagesOptionsForm } from './options-form';

export const pdfExtractImagesTool: ToolDefinition<PdfExtractImagesOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfExtractImagesOptionsForm,
  process: processPdfExtractImages,
};
