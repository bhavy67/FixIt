import type { ProcessingContext, ProcessingResult, ProcessingResultBlob } from '@/core/tool-types';
import type { JsonFormatterOptions } from './options';

function formatOne(text: string, opts: JsonFormatterOptions): string {
  const parsed: unknown = JSON.parse(text);
  return opts.mode === 'pretty'
    ? JSON.stringify(parsed, null, opts.indent)
    : JSON.stringify(parsed);
}

function outFilename(originalName: string, opts: JsonFormatterOptions): string {
  const base = originalName.replace(/\.[^.]+$/, '') || 'data';
  const suffix = opts.mode === 'pretty' ? 'formatted' : 'min';
  return `${base}.${suffix}.json`;
}

export async function processJsonFormat(
  ctx: ProcessingContext<JsonFormatterOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;
  const outputs: ProcessingResultBlob[] = [];

  for (let i = 0; i < files.length; i++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
    onProgress(i / files.length);
    const f = files[i]!;
    const text = await f.file.text();

    let formatted: string;
    try {
      formatted = formatOne(text, options);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      throw new Error(`Invalid JSON in ${f.name}: ${detail}`);
    }

    const blob = new Blob([formatted], { type: 'application/json' });
    outputs.push({
      blob,
      filename: outFilename(f.name, options),
      bytes: blob.size,
    });
  }

  return { outputs, meta: { count: files.length } };
}
