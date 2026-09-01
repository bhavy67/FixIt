'use client';

import { useState, useEffect } from 'react';
import { Download, WifiOff, Share, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePwaStore } from '@/stores/pwa-store';

const STORAGE_KEY = 'fixit-install-dismissed';

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as Window & { MSStream?: unknown }).MSStream;
}

export function InstallPrompt() {
  const prompt = usePwaStore((s) => s.prompt);
  const isInstalled = usePwaStore((s) => s.isInstalled);
  const triggerInstall = usePwaStore((s) => s.triggerInstall);

  const [ios, setIos] = useState(false);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (isInstalled) return;
    setIos(isIOS());
    setVisible(true);
  }, [isInstalled]);

  // Hide when installed after the fact
  useEffect(() => {
    if (isInstalled) setVisible(false);
  }, [isInstalled]);

  const dismiss = () => {
    setLeaving(true);
    localStorage.setItem(STORAGE_KEY, '1');
    setTimeout(() => setVisible(false), 280);
  };

  const handleInstall = async () => {
    await triggerInstall();
    dismiss();
  };

  if (!visible) return null;

  return (
    <div
      className="w-full border-b border-primary/20 bg-primary/5 px-4 py-2.5 flex items-center gap-3"
      style={{
        transition: 'opacity 280ms ease, transform 280ms ease',
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      <span className="shrink-0 inline-flex size-7 items-center justify-center rounded-md bg-primary/10">
        {ios
          ? <Share className="size-3.5 text-primary" aria-hidden />
          : <WifiOff className="size-3.5 text-primary" aria-hidden />
        }
      </span>

      <p className="flex-1 min-w-0 text-xs text-muted-foreground">
        {ios ? (
          <>
            Works offline on iOS —{' '}
            tap <Share className="inline size-3 align-[-1px] mx-0.5" aria-hidden />{' '}
            then <strong className="font-semibold text-foreground">Add to Home Screen</strong>
          </>
        ) : prompt ? (
          <>
            <strong className="font-semibold text-foreground">Install Fixit</strong>
            {' '}— works offline, instant access, no browser needed.
          </>
        ) : (
          <>
            <strong className="font-semibold text-foreground">Works offline</strong>
            {' '}— all tools run in your browser, no upload or internet required.
          </>
        )}
      </p>

      {prompt && !ios && (
        <Button size="sm" className="shrink-0 h-7 px-3 text-xs gap-1.5" onClick={handleInstall}>
          <Download className="size-3" aria-hidden />
          Install
        </Button>
      )}

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
