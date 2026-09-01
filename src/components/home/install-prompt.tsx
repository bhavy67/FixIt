'use client';

import { useState, useEffect } from 'react';
import { Download, WifiOff, Share, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const STORAGE_KEY = 'fixit-install-dismissed';

function isIOS() {
  return (
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as Window & { MSStream?: unknown }).MSStream
  );
}

function isStandalone() {
  return (
    typeof window !== 'undefined' &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<'chrome' | 'ios' | null>(null);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (isStandalone()) return;

    if (isIOS()) {
      setMode('ios');
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setMode('chrome');
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    setLeaving(true);
    localStorage.setItem(STORAGE_KEY, '1');
    setTimeout(() => setVisible(false), 300);
  };

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') dismiss();
    setPrompt(null);
  };

  if (!visible) return null;

  return (
    <div
      className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-start sm:items-center gap-3 transition-all duration-300"
      style={{ opacity: leaving ? 0 : 1, transform: leaving ? 'translateY(-6px)' : 'translateY(0)' }}
    >
      {/* Icon */}
      <span className="shrink-0 inline-flex size-8 items-center justify-center rounded-lg bg-primary/10">
        {mode === 'ios' ? (
          <Share className="size-4 text-primary" aria-hidden />
        ) : (
          <WifiOff className="size-4 text-primary" aria-hidden />
        )}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        {mode === 'ios' ? (
          <>
            <p className="text-sm font-semibold leading-snug">Works offline on iOS</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tap <Share className="inline size-3 mx-0.5 align-[-1px]" aria-hidden /> then{' '}
              <strong className="font-medium text-foreground">Add to Home Screen</strong>
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold leading-snug">Install for offline use</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              All tools work without internet — install once, use anywhere.
            </p>
          </>
        )}
      </div>

      {/* CTA (chrome only) */}
      {mode === 'chrome' && (
        <Button size="sm" className="shrink-0 gap-1.5" onClick={handleInstall}>
          <Download className="size-3.5" aria-hidden />
          Install
        </Button>
      )}

      {/* Dismiss */}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
