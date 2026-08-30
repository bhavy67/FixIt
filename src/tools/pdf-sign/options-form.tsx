'use client';

import { useId, useRef, useCallback } from 'react';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfSignOptions, SignPosition, SignSize } from './options';

const inputCls =
  'border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelCls = 'text-foreground text-xs font-medium';
const helperCls = 'text-muted-foreground text-xs';

export function PdfSignOptionsForm({ value, onChange }: OptionsFormProps<PdfSignOptions>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const pageId = useId();
  const positionId = useId();
  const sizeId = useId();

  const getCanvasPoint = (canvas: HTMLCanvasElement, e: React.PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const draw = (canvas: HTMLCanvasElement, x: number, y: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !lastPoint.current) return;
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPoint.current = { x, y };
  };

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const point = getCanvasPoint(canvas, e);
    isDrawing.current = true;
    lastPoint.current = point;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing.current) return;
    const point = getCanvasPoint(canvas, e);
    draw(canvas, point.x, point.y);
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !isDrawing.current) return;
      const point = getCanvasPoint(canvas, e);
      draw(canvas, point.x, point.y);
      isDrawing.current = false;
      lastPoint.current = null;
      const dataUrl = canvas.toDataURL('image/png');
      onChange({ ...value, signatureDataUrl: dataUrl });
    },
    [value, onChange],
  );

  const handlePointerLeave = useCallback(
    (_e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !isDrawing.current) return;
      isDrawing.current = false;
      lastPoint.current = null;
      const dataUrl = canvas.toDataURL('image/png');
      onChange({ ...value, signatureDataUrl: dataUrl });
    },
    [value, onChange],
  );

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onChange({ ...value, signatureDataUrl: '' });
  }, [value, onChange]);

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className={labelCls}>Signature</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2 transition-colors"
          >
            Clear
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width={380}
          height={120}
          className="rounded-md border border-dashed border-input bg-white"
          style={{ touchAction: 'none', cursor: 'crosshair' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        />
        <p className={helperCls}>
          Draw your signature in the box above, then adjust placement options.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={pageId} className={labelCls}>
          Page
        </label>
        <input
          id={pageId}
          type="number"
          min={1}
          value={value.page}
          onChange={(e) => onChange({ ...value, page: Math.max(1, Number(e.target.value)) })}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={positionId} className={labelCls}>
            Position
          </label>
          <select
            id={positionId}
            value={value.position}
            onChange={(e) => onChange({ ...value, position: e.target.value as SignPosition })}
            className={inputCls}
          >
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-center">Bottom Center</option>
            <option value="bottom-right">Bottom Right</option>
            <option value="top-left">Top Left</option>
            <option value="top-center">Top Center</option>
            <option value="top-right">Top Right</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={sizeId} className={labelCls}>
            Size
          </label>
          <select
            id={sizeId}
            value={value.size}
            onChange={(e) => onChange({ ...value, size: e.target.value as SignSize })}
            className={inputCls}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>
    </div>
  );
}
