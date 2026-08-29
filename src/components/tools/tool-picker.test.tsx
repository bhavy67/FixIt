import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToolPicker } from './tool-picker';
import { useFilesStore } from '@/stores/files-store';
import { _resetRegistryForTests, registerTool } from '@/core/tool-registry';
import type { ToolDefinition } from '@/core/tool-types';

function makeFile(name: string, type = 'text/plain') {
  return new File(['hi'], name, { type });
}

function makeTool(overrides: Partial<ToolDefinition> & Pick<ToolDefinition, 'id'>): ToolDefinition {
  return {
    slug: overrides.id,
    name: overrides.id,
    tagline: 'do a thing',
    category: 'pdf',
    mode: 'local',
    input: { accepts: ['pdf'] },
    output: { kind: 'pdf' },
    process: async () => ({ outputs: [] }),
    ...overrides,
  } as ToolDefinition;
}

describe('ToolPicker', () => {
  beforeEach(() => {
    useFilesStore.getState().clear();
    _resetRegistryForTests();
  });

  it('renders nothing when there are no files', () => {
    const { container } = render(<ToolPicker />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the empty state when files exist but no tools match', async () => {
    await useFilesStore.getState().add([makeFile('a.txt')]);
    render(<ToolPicker />);
    expect(screen.getByTestId('tool-picker-empty')).toBeInTheDocument();
    expect(screen.getByText(/no tools for these files yet/i)).toBeInTheDocument();
  });

  it('lists tools that accept the file kind', async () => {
    registerTool(
      makeTool({
        id: 'image-resize',
        name: 'Image Resize',
        tagline: 'Change dimensions',
        category: 'image',
        input: { accepts: ['image'] },
        output: { kind: 'image' },
      }),
    );
    await useFilesStore.getState().add([makeFile('a.png', 'image/png')]);

    render(<ToolPicker />);
    expect(screen.getByText('Image Resize')).toBeInTheDocument();
    expect(screen.getByText('Change dimensions')).toBeInTheDocument();
    expect(screen.getByText(/what would you like to do/i)).toBeInTheDocument();
  });

  it('filters out tools that require more files than dropped', async () => {
    registerTool(
      makeTool({
        id: 'pdf-merge',
        name: 'Merge PDF',
        input: { accepts: ['pdf'], minFiles: 2 },
        output: { kind: 'pdf' },
      }),
    );
    registerTool(
      makeTool({
        id: 'pdf-compress',
        name: 'Compress PDF',
        input: { accepts: ['pdf'] },
        output: { kind: 'pdf' },
      }),
    );
    await useFilesStore.getState().add([makeFile('a.pdf', 'application/pdf')]);

    render(<ToolPicker />);
    expect(screen.queryByText('Merge PDF')).not.toBeInTheDocument();
    expect(screen.getByText('Compress PDF')).toBeInTheDocument();
  });
});
