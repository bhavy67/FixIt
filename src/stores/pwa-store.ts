import { create } from 'zustand';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

interface PwaStore {
  prompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  setPrompt: (p: BeforeInstallPromptEvent | null) => void;
  setInstalled: (v: boolean) => void;
  triggerInstall: () => Promise<void>;
}

export const usePwaStore = create<PwaStore>((set, get) => ({
  prompt: null,
  isInstalled: false,
  setPrompt: (prompt) => set({ prompt }),
  setInstalled: (isInstalled) => set({ isInstalled }),
  triggerInstall: async () => {
    const { prompt } = get();
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      set({ prompt: null, isInstalled: true });
    }
  },
}));
