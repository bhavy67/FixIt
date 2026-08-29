import { beforeEach, describe, expect, it } from 'vitest';
import { useFilesStore } from './files-store';

function makeFile(name: string, type = 'text/plain') {
  return new File(['hello'], name, { type });
}

describe('files-store', () => {
  beforeEach(() => {
    useFilesStore.getState().clear();
  });

  it('starts empty', () => {
    expect(useFilesStore.getState().files).toEqual([]);
  });

  it('adds inspected files', async () => {
    await useFilesStore.getState().add([makeFile('a.txt'), makeFile('b.txt')]);
    const files = useFilesStore.getState().files;
    expect(files).toHaveLength(2);
    expect(files.map((f) => f.name)).toEqual(['a.txt', 'b.txt']);
    expect(files[0]?.kind).toBe('text');
  });

  it('removes a file by id', async () => {
    await useFilesStore.getState().add([makeFile('a.txt'), makeFile('b.txt')]);
    const [first] = useFilesStore.getState().files;
    if (!first) throw new Error('expected a file');
    useFilesStore.getState().remove(first.id);
    const remaining = useFilesStore.getState().files;
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.name).toBe('b.txt');
  });

  it('clear empties the store', async () => {
    await useFilesStore.getState().add([makeFile('a.txt')]);
    useFilesStore.getState().clear();
    expect(useFilesStore.getState().files).toEqual([]);
  });

  it('appends to existing files', async () => {
    await useFilesStore.getState().add([makeFile('a.txt')]);
    await useFilesStore.getState().add([makeFile('b.txt')]);
    expect(useFilesStore.getState().files.map((f) => f.name)).toEqual(['a.txt', 'b.txt']);
  });
});
