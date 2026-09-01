'use client';

import { Download, X, Share } from 'lucide-react';
import { usePwaStore } from '@/stores/pwa-store';
import { cn } from '@/lib/cn';
import { useState, useRef, useEffect } from 'react';

type Props = {
  variant?: 'icon' | 'row';
  className?: string;
};

function useInstallInstructions() {
  const [browser, setBrowser] = useState<'ios' | 'chrome' | 'firefox' | 'other'>('other');
  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream) {
      setBrowser('ios');
    } else if (/Firefox/.test(ua)) {
      setBrowser('firefox');
    } else if (/Chrome|Edg/.test(ua)) {
      setBrowser('chrome');
    }
  }, []);
  return browser;
}

function InstructionsPopover({ onClose }: { onClose: () => void }) {
  const browser = useInstallInstructions();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 w-64 rounded-xl border border-border bg-popover shadow-lg p-4 z-50 text-sm"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-foreground text-[13px]">Install FixIt</p>
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0">
          <X className="size-3.5" />
        </button>
      </div>
      {browser === 'ios' ? (
        <p className="text-muted-foreground text-[12px] leading-relaxed">
          Tap <Share className="inline size-3 align-[-1px] mx-0.5" /> <strong className="text-foreground">Share</strong> at the bottom of Safari, then choose{' '}
          <strong className="text-foreground">Add to Home Screen</strong>.
        </p>
      ) : browser === 'chrome' ? (
        <p className="text-muted-foreground text-[12px] leading-relaxed">
          Click the <strong className="text-foreground">⋮</strong> menu in Chrome, then select{' '}
          <strong className="text-foreground">Install FixIt…</strong> or{' '}
          <strong className="text-foreground">Save and share → Install page as app</strong>.
        </p>
      ) : browser === 'firefox' ? (
        <p className="text-muted-foreground text-[12px] leading-relaxed">
          Look for the <strong className="text-foreground">install</strong> icon in the address bar, or open{' '}
          <strong className="text-foreground">☰ menu → Install</strong>.
        </p>
      ) : (
        <p className="text-muted-foreground text-[12px] leading-relaxed">
          Open your browser menu and look for{' '}
          <strong className="text-foreground">Install app</strong> or{' '}
          <strong className="text-foreground">Add to Home Screen</strong>.
        </p>
      )}
    </div>
  );
}

export function InstallHeaderButton({ variant = 'icon', className }: Props) {
  const prompt = usePwaStore((s) => s.prompt);
  const isInstalled = usePwaStore((s) => s.isInstalled);
  const triggerInstall = usePwaStore((s) => s.triggerInstall);
  const [showInstructions, setShowInstructions] = useState(false);

  if (isInstalled) return null;

  const handleClick = async () => {
    if (prompt) {
      await triggerInstall();
    } else {
      setShowInstructions((v) => !v);
    }
  };

  if (variant === 'row') {
    return (
      <div className="relative">
        {showInstructions && <InstructionsPopover onClose={() => setShowInstructions(false)} />}
        <button
          type="button"
          onClick={() => void handleClick()}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium',
            'text-primary hover:bg-primary/10 transition-colors duration-150 cursor-pointer',
            className,
          )}
        >
          <Download className="size-[15px] shrink-0" aria-hidden />
          Install app
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {showInstructions && <InstructionsPopover onClose={() => setShowInstructions(false)} />}
      <button
        type="button"
        onClick={() => void handleClick()}
        aria-label="Install app"
        className={cn(
          'inline-flex size-8 items-center justify-center rounded-md text-muted-foreground',
          'hover:text-foreground hover:bg-muted/60 transition-colors duration-150 cursor-pointer',
          className,
        )}
      >
        <Download className="size-4" aria-hidden />
      </button>
    </div>
  );
}
