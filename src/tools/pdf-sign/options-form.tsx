'use client';

import { useRef, useCallback } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfSignOptions } from './options';
import { cn } from '@/lib/cn';

const COLORS = [
  { value: '#1a1a1a', label: 'Black' },
  { value: '#1e40af', label: 'Blue' },
  { value: '#15803d', label: 'Green' },
  { value: '#b91c1c', label: 'Red' },
  { value: '#7c3aed', label: 'Purple' },
];

// Cross-OS signature font stack — falls through Windows/Mac/Linux cursive
// scripts, with the generic `cursive` family as a last resort. Same string
// is used for the canvas and the on-screen preview so they always match.
const SIGNATURE_FONT_STACK =
  '"Segoe Script", "Bradley Hand", "Snell Roundhand", "Brush Script MT", "Lucida Handwriting", "URW Chancery L", cursive';
const SIGNATURE_FONT = `62px ${SIGNATURE_FONT_STACK}`;

function getDrawPoint(e: React.PointerEvent<HTMLCanvasElement>) {
  const canvas = e.currentTarget;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function renderTypedSignature(text: string, color: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 130;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.font = SIGNATURE_FONT;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(text, 240, 68, 460);
  return canvas.toDataURL('image/png');
}

export function PdfSignOptionsForm({ value, onChange }: OptionsFormProps<PdfSignOptions>) {
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const activeColor = value.color ?? '#1a1a1a';
  const isType = value.signMode === 'type';

  // ── Draw handlers ─────────────────────────────────────────────────────────
  const handleDrawDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = drawCanvasRef.current;
      if (!canvas) return;
      canvas.setPointerCapture(e.pointerId);
      isDrawing.current = true;
      lastPoint.current = getDrawPoint(e);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    },
    [activeColor],
  );

  const handleDrawMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !lastPoint.current) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const pt = getDrawPoint(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPoint.current = pt;
  }, []);

  const commitDraw = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current) return;
      handleDrawMove(e);
      isDrawing.current = false;
      lastPoint.current = null;
      const dataUrl = drawCanvasRef.current?.toDataURL('image/png') ?? '';
      onChange({ ...value, signatureDataUrl: dataUrl });
    },
    [value, onChange, handleDrawMove],
  );

  const handleClear = useCallback(() => {
    const canvas = drawCanvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    onChange({ ...value, signatureDataUrl: '', typedText: '' });
  }, [value, onChange]);

  const applyColor = (c: string) => {
    if (isType && value.typedText) {
      onChange({ ...value, color: c, signatureDataUrl: renderTypedSignature(value.typedText, c) });
    } else {
      onChange({ ...value, color: c });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Mode tabs */}
      <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium">
        {(['draw', 'type'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange({ ...value, signMode: mode, signatureDataUrl: '', typedText: '' })}
            className={cn(
              'flex-1 py-2 transition-colors capitalize',
              value.signMode === mode
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground bg-card',
            )}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Signature input */}
      {isType ? (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Type your name…"
            value={value.typedText ?? ''}
            onChange={(e) => {
              const text = e.target.value;
              const dataUrl = text ? renderTypedSignature(text, activeColor) : '';
              onChange({ ...value, typedText: text, signatureDataUrl: dataUrl });
            }}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {value.typedText && (
            <div
              className="rounded-md border border-dashed border-input bg-white min-h-[56px] flex items-center justify-center overflow-hidden px-3"
              style={{
                fontFamily: SIGNATURE_FONT_STACK,
                fontSize: 36,
                color: activeColor,
                lineHeight: 1.2,
              }}
            >
              {value.typedText}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Draw signature</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
          <canvas
            ref={drawCanvasRef}
            width={480}
            height={130}
            className="rounded-md border border-dashed border-input bg-white w-full"
            style={{ touchAction: 'none', cursor: 'crosshair', height: 100 }}
            onPointerDown={handleDrawDown}
            onPointerMove={handleDrawMove}
            onPointerUp={commitDraw}
            onPointerLeave={commitDraw}
          />
        </div>
      )}

      {/* Ink color */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Ink color</span>
        <div className="flex items-center gap-2.5">
          {COLORS.map(({ value: c, label }) => (
            <button
              key={c}
              type="button"
              title={label}
              onClick={() => applyColor(c)}
              className={cn(
                'size-6 rounded-full border-2 transition-all shrink-0 cursor-pointer',
                activeColor === c
                  ? 'border-foreground scale-110'
                  : 'border-transparent hover:border-muted-foreground',
              )}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={activeColor}
            onChange={(e) => applyColor(e.target.value)}
            className="size-6 rounded-full cursor-pointer p-0 border border-border bg-transparent overflow-hidden"
            title="Custom color"
          />
        </div>
      </div>
    </div>
  );
}
