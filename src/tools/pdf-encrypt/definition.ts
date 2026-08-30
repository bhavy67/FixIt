import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfEncryptOptions } from './options';
import { processPdfEncrypt } from './processor';
import { PdfEncryptOptionsForm } from './options-form';

export const pdfEncryptTool: ToolDefinition<PdfEncryptOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfEncryptOptionsForm,
  process: processPdfEncrypt,
};
