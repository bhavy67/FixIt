import { beforeEach, describe, expect, it } from 'vitest';
import {
  _resetRegistryForTests,
  getAllTools,
  getToolById,
  matchToolsForFiles,
  registerTool,
} from './tool-registry';
import type { ToolDefinition } from './tool-types';
import type { FileKind, InspectedFile } from './file-types';

function makeInspected(name: string, kind: FileKind, sizeBytes = 100): InspectedFile {
  return {
    id: `id-${name}`,
    file: new File([''], name),
    kind,
    mime: '',
    ext: name.split('.').pop() ?? '',
    name,
    sizeBytes,
  };
}

function makeTool(
  overrides: Partial<ToolDefinition> & Pick<ToolDefinition, 'id' | 'input' | 'output'>,
): ToolDefinition {
  return {
    slug: overrides.id,
    name: overrides.id,
    tagline: '',
    category: 'pdf',
    mode: 'local',
    process: async () => ({ outputs: [] }),
    ...overrides,
  } as ToolDefinition;
}

describe('tool-registry', () => {
  beforeEach(() => {
    _resetRegistryForTests();
  });

  it('registers and retrieves a tool by id', () => {
    const t = makeTool({
      id: 'pdf-merge',
      input: { accepts: ['pdf'], minFiles: 2 },
      output: { kind: 'pdf' },
    });
    registerTool(t);
    expect(getToolById('pdf-merge')).toBe(t);
    expect(getAllTools()).toEqual([t]);
  });

  it('ignores duplicate id registration', () => {
    const a = makeTool({
      id: 'x',
      input: { accepts: ['pdf'] },
      output: { kind: 'pdf' },
    });
    const b = makeTool({
      id: 'x',
      input: { accepts: ['pdf'] },
      output: { kind: 'pdf' },
    });
    registerTool(a);
    registerTool(b);
    expect(getToolById('x')).toBe(a);
    expect(getAllTools()).toHaveLength(1);
  });

  it('matches tools accepting the file kind', () => {
    registerTool(
      makeTool({
        id: 'image-resize',
        input: { accepts: ['image'] },
        output: { kind: 'image' },
      }),
    );
    registerTool(
      makeTool({
        id: 'pdf-merge',
        input: { accepts: ['pdf'], minFiles: 2 },
        output: { kind: 'pdf' },
      }),
    );

    const matches = matchToolsForFiles([makeInspected('a.png', 'image')]);
    expect(matches.map((t) => t.id)).toEqual(['image-resize']);
  });

  it('enforces minFiles', () => {
    registerTool(
      makeTool({
        id: 'pdf-merge',
        input: { accepts: ['pdf'], minFiles: 2 },
        output: { kind: 'pdf' },
      }),
    );
    expect(matchToolsForFiles([makeInspected('a.pdf', 'pdf')])).toHaveLength(0);
    expect(
      matchToolsForFiles([makeInspected('a.pdf', 'pdf'), makeInspected('b.pdf', 'pdf')]),
    ).toHaveLength(1);
  });

  it('enforces maxFiles', () => {
    registerTool(
      makeTool({
        id: 'image-resize',
        input: { accepts: ['image'], maxFiles: 1 },
        output: { kind: 'image' },
      }),
    );
    expect(
      matchToolsForFiles([makeInspected('a.png', 'image'), makeInspected('b.png', 'image')]),
    ).toHaveLength(0);
  });

  it('rejects mixed kinds that a tool does not accept', () => {
    registerTool(
      makeTool({
        id: 'image-resize',
        input: { accepts: ['image'] },
        output: { kind: 'image' },
      }),
    );
    expect(
      matchToolsForFiles([makeInspected('a.png', 'image'), makeInspected('b.pdf', 'pdf')]),
    ).toHaveLength(0);
  });

  it('returns [] when no files are supplied', () => {
    registerTool(
      makeTool({
        id: 'anything',
        input: { accepts: ['pdf'] },
        output: { kind: 'pdf' },
      }),
    );
    expect(matchToolsForFiles([])).toEqual([]);
  });
});
