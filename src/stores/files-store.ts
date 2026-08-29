import { create } from 'zustand';
import type { InspectedFile } from '@/core/file-types';
import { inspectFiles } from '@/core/file-inspector';

interface FilesState {
  files: InspectedFile[];
  add: (files: File[]) => Promise<void>;
  remove: (id: string) => void;
  clear: () => void;
}

export const useFilesStore = create<FilesState>((set) => ({
  files: [],
  add: async (incoming) => {
    if (incoming.length === 0) return;
    const inspected = await inspectFiles(incoming);
    set((state) => ({ files: [...state.files, ...inspected] }));
  },
  remove: (id) => {
    set((state) => ({ files: state.files.filter((f) => f.id !== id) }));
  },
  clear: () => set({ files: [] }),
}));
