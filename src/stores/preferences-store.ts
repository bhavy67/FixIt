import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_RECENT = 5;

interface PreferencesState {
  recentToolIds: string[];
  recordToolUse: (toolId: string) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      recentToolIds: [],

      recordToolUse: (toolId) =>
        set((s) => {
          const filtered = s.recentToolIds.filter((id) => id !== toolId);
          return { recentToolIds: [toolId, ...filtered].slice(0, MAX_RECENT) };
        }),
    }),
    { name: 'fixit-preferences' },
  ),
);
