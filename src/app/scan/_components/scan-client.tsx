'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera,
  Trash2,
  FileDown,
  Loader2,
  Check,
  Download,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type CapturedPage = {
  id: string;
  blob: Blob;
  objectUrl: string;
};

type Phase = 'idle' | 'active' | 'creating' | 'done';

export function ScanClient() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [captures, setCaptures] = useState<CapturedPage[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      // Revoke all object URLs
      captures.forEach((c) => URL.revokeObjectURL(c.objectUrl));
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPhase('active');
    } catch {
      setError('Camera access denied or unavailable. Please allow camera access and try again.');
    }
  };

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCaptures((prev) => [
          ...prev,
          { id: crypto.randomUUID(), blob, objectUrl: URL.createObjectURL(blob) },
        ]);
      },
      'image/jpeg',
      0.92,
    );
  }, []);

  const removeCapture = (id: string) => {
    setCaptures((prev) => {
      const removed = prev.find((c) => c.id === id);
      if (removed) URL.revokeObjectURL(removed.objectUrl);
      return prev.filter((c) => c.id !== id);
    });
  };

  const createPdf = async () => {
    if (captures.length === 0) return;
    setPhase('creating');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();

      for (const capture of captures) {
        const bytes = new Uint8Array(await capture.blob.arrayBuffer());
        const img = await pdfDoc.embedJpg(bytes);
        const { width, height } = img;
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(img, { x: 0, y: 0, width, height });
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPhase('done');
      stopCamera();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create PDF');
      setPhase('active');
    }
  };

  const reset = () => {
    stopCamera();
    captures.forEach((c) => URL.revokeObjectURL(c.objectUrl));
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setCaptures([]);
    setPdfUrl(null);
    setError(null);
    setPhase('idle');
  };

  // ── Idle phase ────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <div className="bg-muted flex size-16 items-center justify-center rounded-full">
          <Camera className="text-muted-foreground size-8" aria-hidden />
        </div>
        <div className="text-center">
          <p className="font-medium">Ready to scan</p>
          <p className="text-muted-foreground text-sm">Your camera will be activated when you start</p>
        </div>
        <Button size="lg" onClick={startCamera}>
          <Camera className="size-4" aria-hidden />
          Start scanning
        </Button>
        {error && <p className="text-destructive text-center text-sm">{error}</p>}
      </div>
    );
  }

  // ── Active phase ──────────────────────────────────────────────────────────
  if (phase === 'active') {
    return (
      <div className="flex flex-col gap-4">
        {/* Camera preview */}
        <div className="bg-black relative aspect-[4/3] overflow-hidden rounded-xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-contain"
          />
        </div>

        {/* Capture button row */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" onClick={() => { stopCamera(); setPhase('idle'); }}>
            Stop camera
          </Button>
          <Button size="lg" onClick={capture} className="px-8">
            <Camera className="size-4" aria-hidden />
            Capture ({captures.length})
          </Button>
        </div>

        {error && <p className="text-destructive text-center text-sm">{error}</p>}

        {/* Captured pages thumbnails */}
        {captures.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium">
              {captures.length} page{captures.length !== 1 ? 's' : ''} captured
            </p>
            <div className="grid grid-cols-4 gap-2">
              {captures.map((c, i) => (
                <div key={c.id} className="group relative aspect-[3/4] overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.objectUrl} alt={`Page ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeCapture(c.id)}
                    className="bg-black/50 text-white absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label={`Remove page ${i + 1}`}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                  <span className="bg-black/50 text-white absolute bottom-1 left-1 rounded px-1 text-[10px]">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
            <Button onClick={createPdf} disabled={captures.length === 0}>
              <FileDown className="size-4" aria-hidden />
              Create PDF ({captures.length} page{captures.length !== 1 ? 's' : ''})
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ── Creating phase ────────────────────────────────────────────────────────
  if (phase === 'creating') {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Loader2 className="text-primary size-8 animate-spin" aria-hidden />
        <p className="text-sm font-medium">Creating PDF&hellip;</p>
      </div>
    );
  }

  // ── Done phase ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <span className="bg-primary text-primary-foreground inline-flex size-12 items-center justify-center rounded-full">
        <Check className="size-6" aria-hidden />
      </span>
      <div className="text-center">
        <p className="font-semibold">PDF ready!</p>
        <p className="text-muted-foreground text-sm">
          {captures.length} page{captures.length !== 1 ? 's' : ''} scanned
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => {
            if (pdfUrl) {
              const a = document.createElement('a');
              a.href = pdfUrl;
              a.download = 'scanned-document.pdf';
              a.click();
            }
          }}
        >
          <Download className="size-4" aria-hidden />
          Download PDF
        </Button>
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="size-4" aria-hidden />
          Scan another
        </Button>
      </div>
    </div>
  );
}
