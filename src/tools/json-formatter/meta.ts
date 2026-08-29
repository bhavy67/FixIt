import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'json-formatter',
  slug: 'json-formatter',
  name: 'JSON Formatter',
  tagline: 'Pretty-print or minify JSON, instantly.',
  category: 'data',
  input: { accepts: ['json'] },
  output: { kind: 'json', multiple: true },
  mode: 'local',
};
