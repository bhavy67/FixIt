import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfHeadersFootersOptions } from './options';
import { PdfHeadersFootersOptionsForm } from './options-form';
import { processPdfHeadersFooters } from './processor';

export const pdfHeadersFootersTool: ToolDefinition<PdfHeadersFootersOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfHeadersFootersOptionsForm,
  process: processPdfHeadersFooters,
};
