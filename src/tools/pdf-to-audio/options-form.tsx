'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfToAudioOptions } from './options';

const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-xs';
const selectCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none';

const SAMPLE_TEXT =
  'This is a preview of how your PDF will sound when read aloud by your browser.';

export function PdfToAudioOptionsForm({ value, onChange }: OptionsFormProps<PdfToAudioOptions>) {
  const voiceId = useId();
  const rateId = useId();
  const pitchId = useId();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return;
    const load = () => setVoices(speechSynthesis.getVoices());
    load();
    speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', load);
      speechSynthesis.cancel();
    };
  }, []);

  const stop = () => {
    if (typeof speechSynthesis === 'undefined') return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const play = () => {
    if (typeof speechSynthesis === 'undefined') return;
    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(SAMPLE_TEXT);
    const voice = voices.find((v) => v.voiceURI === value.voiceURI);
    if (voice) u.voice = voice;
    u.rate = value.rate;
    u.pitch = value.pitch;
    u.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    u.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utteranceRef.current = u;
    speechSynthesis.speak(u);
    setIsSpeaking(true);
  };

  const pause = () => {
    if (typeof speechSynthesis === 'undefined') return;
    speechSynthesis.pause();
    setIsPaused(true);
  };

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={voiceId} className={labelCls}>
          Voice
        </label>
        <select
          id={voiceId}
          value={value.voiceURI}
          onChange={(e) => onChange({ ...value, voiceURI: e.target.value })}
          className={selectCls}
        >
          <option value="">System default</option>
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={rateId} className={labelCls}>
          Rate: {value.rate.toFixed(1)}×
        </label>
        <input
          id={rateId}
          type="range"
          min={0.5}
          max={2}
          step={0.1}
          value={value.rate}
          onChange={(e) => onChange({ ...value, rate: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={pitchId} className={labelCls}>
          Pitch: {value.pitch.toFixed(1)}
        </label>
        <input
          id={pitchId}
          type="range"
          min={0}
          max={2}
          step={0.1}
          value={value.pitch}
          onChange={(e) => onChange({ ...value, pitch: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        {!isSpeaking || isPaused ? (
          <button
            type="button"
            onClick={play}
            className="border-input bg-background hover:bg-accent inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors"
          >
            <Play size={13} />
            {isPaused ? 'Resume' : 'Preview'}
          </button>
        ) : (
          <button
            type="button"
            onClick={pause}
            className="border-input bg-background hover:bg-accent inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors"
          >
            <Pause size={13} />
            Pause
          </button>
        )}
        {isSpeaking && (
          <button
            type="button"
            onClick={stop}
            className="border-input bg-background hover:bg-accent inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors"
          >
            <Square size={13} />
            Stop
          </button>
        )}
      </div>
      <p className={helperCls}>
        Processing exports the PDF text as a .txt file you can play back in any TTS reader — the
        controls above preview your voice settings.
      </p>
    </div>
  );
}
