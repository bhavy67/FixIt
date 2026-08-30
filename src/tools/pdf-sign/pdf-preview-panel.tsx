'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { OptionsFormProps } from '@/core/tool-types';
import type { PdfSignOptions } from './options';
import { useFilesStore } from '@/stores/files-store';
import { ChevronLeft, ChevronRight, PenLine } from 'lucide-react';

export function PdfSignPreviewPanel({ value, onChange }: OptionsFormProps<PdfSignOptions>) {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<{ doc: PDFDocumentProxy; fileId: string } | null>(null);

  const [totalPages, setTotalPages] = useState(1);
  const [pdfLoaded, setPdfLoaded] = useState(false);

  const dragState = useRef<{
    startX: number; startY: number; startSigX: number; startSigY: number;
  } | null>(null);
  const resizeState = useRef<{ startX: number; startSigW: number } | null>(null);

  const file = useFilesStore((s) => s.files[0]);

  useEffect(() => {
    const canvas = pdfCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !file || file.kind !== 'pdf') return;

    let cancelled = false;
    setPdfLoaded(false);

    (async () => {
      let doc: PDFDocumentProxy;

      if (pdfDocRef.current?.fileId === file.id) {
        doc = pdfDocRef.current.doc;
      } else {
        const buf = await file.file.arrayBuffer();
        if (cancelled) return;
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();
        doc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
        if (cancelled) return;
        pdfDocRef.current = { doc, fileId: file.id };
        setTotalPages(doc.numPages);
      }

      const pageNum = Math.max(1, Math.min(value.page, doc.numPages));
      const page = await doc.getPage(pageNum);
      if (cancelled) return;

      const containerW = container.clientWidth || 600;
      const vp = page.getViewport({ scale: 1 });
      const scale = containerW / vp.width;
      const scaled = page.getViewport({ scale });

      canvas.width = Math.round(scaled.width);
      canvas.height = Math.round(scaled.height);

      const ctx = canvas.getContext('2d');
      if (!ctx || cancelled) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport: scaled, canvas }).promise;
      if (!cancelled) setPdfLoaded(true);
    })().catch(console.error);

    return () => { cancelled = true; };
  }, [file, value.page]);

  const handleSigDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        startSigX: value.sigX,
        startSigY: value.sigY,
      };
    },
    [value.sigX, value.sigY],
  );

  const handleSigMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const canvas = pdfCanvasRef.current;
      if (!dragState.current || !canvas) return;
      const { startX, startY, startSigX, startSigY } = dragState.current;
      const rect = canvas.getBoundingClientRect();
      onChange({
        ...value,
        sigX: Math.max(0, Math.min(1 - value.sigW, startSigX + (e.clientX - startX) / rect.width)),
        sigY: Math.max(0, Math.min(0.95, startSigY + (e.clientY - startY) / rect.height)),
      });
    },
    [value, onChange],
  );

  const handleSigUp = useCallback(() => { dragState.current = null; }, []);

  const handleResizeDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      resizeState.current = { startX: e.clientX, startSigW: value.sigW };
    },
    [value.sigW],
  );

  const handleResizeMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      const canvas = pdfCanvasRef.current;
      if (!resizeState.current || !canvas) return;
      const { startX, startSigW } = resizeState.current;
      const dx = (e.clientX - startX) / canvas.getBoundingClientRect().width;
      onChange({ ...value, sigW: Math.max(0.06, Math.min(1 - value.sigX, startSigW + dx)) });
    },
    [value, onChange],
  );

  const handleResizeUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    resizeState.current = null;
  }, []);

  const hasSig = !!value.signatureDataUrl;

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 shrink-0 bg-card">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <PenLine className="size-3.5 shrink-0" aria-hidden />
          {hasSig
            ? 'Drag to reposition · drag the dot to resize'
            : value.signMode === 'type'
              ? 'Type your name on the left to place it here'
              : 'Draw your signature on the left to place it here'}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={value.page <= 1}
              onClick={() => onChange({ ...value, page: value.page - 1 })}
              className="rounded p-1 disabled:opacity-40 hover:bg-muted transition-colors cursor-pointer disabled:cursor-default"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <span className="text-xs text-muted-foreground tabular-nums min-w-[52px] text-center">
              Page {value.page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={value.page >= totalPages}
              onClick={() => onChange({ ...value, page: value.page + 1 })}
              className="rounded p-1 disabled:opacity-40 hover:bg-muted transition-colors cursor-pointer disabled:cursor-default"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* PDF area */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-6 bg-muted/20">
        <div
          ref={containerRef}
          className="relative bg-white shadow-lg rounded-sm"
          style={{ width: '100%', maxWidth: 740, userSelect: 'none' }}
        >
          {/* PDF canvas */}
          <canvas ref={pdfCanvasRef} className="block w-full rounded-sm" />

          {/* Loading overlay */}
          {!pdfLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-sm">
              <span className="text-xs text-muted-foreground">Loading preview…</span>
            </div>
          )}

          {/* No-sig hint */}
          {!hasSig && pdfLoaded && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center bg-background/90 backdrop-blur-sm px-5 py-3.5 rounded-xl border border-border shadow-sm">
                <PenLine className="size-5 mx-auto mb-2 text-muted-foreground" aria-hidden />
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  {value.signMode === 'type'
                    ? 'Type your name on the left — your signature will appear here'
                    : 'Draw your signature on the left — it will appear here to drag into place'}
                </p>
              </div>
            </div>
          )}

          {/* Draggable signature overlay */}
          {hasSig && pdfLoaded && (
            <div
              style={{
                position: 'absolute',
                left: `${value.sigX * 100}%`,
                top: `${value.sigY * 100}%`,
                width: `${value.sigW * 100}%`,
                cursor: 'move',
                touchAction: 'none',
              }}
              onPointerDown={handleSigDown}
              onPointerMove={handleSigMove}
              onPointerUp={handleSigUp}
            >
              {/* Selection border */}
              <div className="absolute inset-0 rounded border-2 border-dashed border-primary/60 pointer-events-none" />

              <img
                src={value.signatureDataUrl}
                alt="Signature"
                className="block w-full"
                draggable={false}
              />

              {/* Resize handle */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -7,
                  right: -7,
                  width: 16,
                  height: 16,
                  cursor: 'se-resize',
                  touchAction: 'none',
                }}
                className="rounded-full bg-primary border-2 border-white shadow-md"
                onPointerDown={handleResizeDown}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeUp}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
