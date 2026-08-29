import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type JsonFormatterOptions } from './options';
import { processJsonFormat } from './processor';
import { JsonFormatterOptionsForm } from './options-form';

export const jsonFormatterTool: ToolDefinition<JsonFormatterOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: JsonFormatterOptionsForm,
  process: processJsonFormat,
};
