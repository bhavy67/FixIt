import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type CsvToPdfOptions } from './options';
import { CsvToPdfOptionsForm } from './options-form';
import { processCsvToPdf } from './processor';

export const csvToPdfTool: ToolDefinition<CsvToPdfOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: CsvToPdfOptionsForm,
  process: processCsvToPdf,
};
