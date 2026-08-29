import { describe, expect, it } from 'vitest';
import { processJsonFormat } from './processor';
import type { InspectedFile } from '@/core/file-types';
import type { ProcessingContext } from '@/core/tool-types';
import type { JsonFormatterOptions } from './options';

function makeInspected(name: string, content: string): InspectedFile {
  const file = new File([content], name, { type: 'application/json' });
  return {
    id: `id-${name}`,
    file,
    kind: 'json',
    mime: 'application/json',
    ext: 'json',
    name,
    sizeBytes: file.size,
  };
}

function makeCtx(
  files: readonly InspectedFile[],
  options: JsonFormatterOptions,
): ProcessingContext<JsonFormatterOptions> {
  return {
    files,
    options,
    signal: new AbortController().signal,
    onProgress: () => {},
  };
}

async function textOf(blob: Blob): Promise<string> {
  return blob.text();
}

describe('processJsonFormat', () => {
  it('pretty-prints with a 2-space indent by default', async () => {
    const ctx = makeCtx([makeInspected('a.json', '{"foo":1,"bar":[1,2]}')], {
      mode: 'pretty',
      indent: 2,
    });
    const result = await processJsonFormat(ctx);
    const out = result.outputs[0];
    expect(out).toBeDefined();
    expect(await textOf(out!.blob)).toBe('{\n  "foo": 1,\n  "bar": [\n    1,\n    2\n  ]\n}');
  });

  it('honors a 4-space indent', async () => {
    const ctx = makeCtx([makeInspected('a.json', '{"foo":1}')], { mode: 'pretty', indent: 4 });
    const result = await processJsonFormat(ctx);
    expect(await textOf(result.outputs[0]!.blob)).toBe('{\n    "foo": 1\n}');
  });

  it('minifies when mode is minify', async () => {
    const ctx = makeCtx([makeInspected('a.json', '{\n  "foo": 1,\n  "bar": true\n}')], {
      mode: 'minify',
      indent: 2,
    });
    const result = await processJsonFormat(ctx);
    expect(await textOf(result.outputs[0]!.blob)).toBe('{"foo":1,"bar":true}');
  });

  it('names pretty output with .formatted.json suffix', async () => {
    const ctx = makeCtx([makeInspected('data.json', '{}')], { mode: 'pretty', indent: 2 });
    const result = await processJsonFormat(ctx);
    expect(result.outputs[0]!.filename).toBe('data.formatted.json');
  });

  it('names minified output with .min.json suffix', async () => {
    const ctx = makeCtx([makeInspected('data.json', '{}')], { mode: 'minify', indent: 2 });
    const result = await processJsonFormat(ctx);
    expect(result.outputs[0]!.filename).toBe('data.min.json');
  });

  it('throws a descriptive error for invalid JSON', async () => {
    const ctx = makeCtx([makeInspected('broken.json', '{ this is not valid')], {
      mode: 'pretty',
      indent: 2,
    });
    await expect(processJsonFormat(ctx)).rejects.toThrow(/Invalid JSON in broken\.json/);
  });

  it('processes multiple files', async () => {
    const ctx = makeCtx([makeInspected('a.json', '{"a":1}'), makeInspected('b.json', '[1,2,3]')], {
      mode: 'minify',
      indent: 2,
    });
    const result = await processJsonFormat(ctx);
    expect(result.outputs).toHaveLength(2);
    expect(await textOf(result.outputs[0]!.blob)).toBe('{"a":1}');
    expect(await textOf(result.outputs[1]!.blob)).toBe('[1,2,3]');
  });

  it('sets application/json MIME on output blobs', async () => {
    const ctx = makeCtx([makeInspected('a.json', '{}')], { mode: 'pretty', indent: 2 });
    const result = await processJsonFormat(ctx);
    expect(result.outputs[0]!.blob.type).toBe('application/json');
  });
});
