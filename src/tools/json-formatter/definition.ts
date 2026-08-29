import type { ToolDefinition } from '@/core/tool-types';
import { DEFAULT_OPTIONS, type JsonFormatterOptions } from './options';
import { processJsonFormat } from './processor';
import { JsonFormatterOptionsForm } from './options-form';

export const jsonFormatterTool: ToolDefinition<JsonFormatterOptions> = {
  id: 'json-formatter',
  slug: 'json-formatter',
  name: 'JSON Formatter',
  tagline: 'Pretty-print or minify JSON, instantly.',
  category: 'data',
  input: { accepts: ['json'] },
  output: { kind: 'json', multiple: true },
  mode: 'local',
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: JsonFormatterOptionsForm,
  process: processJsonFormat,
};
