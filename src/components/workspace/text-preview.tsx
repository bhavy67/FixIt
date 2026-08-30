'use client';

import { useEffect, useState } from 'react';
import { Copy, Check, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/format-bytes';

const MAX_PREVIEW_CHARS = 6000;

type Props = {
  blob: Blob;
};

export function TextPreview({ blob }: Props) {
  const [text, setText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void blob.text().then((t) => {
      if (!cancelled) setText(t);
    });
    speechSynthesis.cancel();
    setSpeaking(false);
    return () => {
      cancelled = true;
    };
  }, [blob]);

  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  if (text === null) {
    return (
      <div className="border-border bg-card text-muted-foreground rounded-xl border p-4 text-xs">
        Loading preview…
      </div>
    );
  }

  const truncated = text.length > MAX_PREVIEW_CHARS;
  const display = truncated ? `${text.slice(0, MAX_PREVIEW_CHARS)}\n…` : text;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleListen = () => {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  return (
    <div className="border-border bg-card flex flex-col gap-2 rounded-xl border p-3">
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="sm" onClick={handleListen} aria-label={speaking ? 'Stop speaking' : 'Listen to text'}>
          {speaking ? (
            <VolumeX className="size-3.5" aria-hidden />
          ) : (
            <Volume2 className="size-3.5" aria-hidden />
          )}
          {speaking ? 'Stop' : 'Listen'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCopy} aria-label="Copy to clipboard">
          {copied ? (
            <Check className="size-3.5 text-green-500" aria-hidden />
          ) : (
            <Copy className="size-3.5" aria-hidden />
          )}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="bg-muted max-h-96 overflow-auto rounded-lg p-3 font-mono text-xs whitespace-pre-wrap">
        <code>{display}</code>
      </pre>
      {truncated && (
        <p className="text-muted-foreground text-center text-[11px]">
          Preview truncated · full file is {formatBytes(blob.size)}
        </p>
      )}
    </div>
  );
}
