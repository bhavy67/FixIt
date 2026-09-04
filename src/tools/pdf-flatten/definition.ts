import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfFlattenOptions } from './options';
import { PdfFlattenOptionsForm } from './options-form';
import { processPdfFlatten } from './processor';

export const pdfFlattenTool: ToolDefinition<PdfFlattenOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfFlattenOptionsForm,
  process: processPdfFlatten,
};
