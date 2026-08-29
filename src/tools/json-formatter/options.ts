export type JsonMode = 'pretty' | 'minify';
export type JsonIndent = 2 | 4;

export interface JsonFormatterOptions {
  mode: JsonMode;
  indent: JsonIndent;
}

export const DEFAULT_OPTIONS: JsonFormatterOptions = {
  mode: 'pretty',
  indent: 2,
};

export const MODE_LABELS: Record<JsonMode, string> = {
  pretty: 'Pretty (indented)',
  minify: 'Minify (no whitespace)',
};

export const INDENT_LABELS: Record<JsonIndent, string> = {
  2: '2 spaces',
  4: '4 spaces',
};
