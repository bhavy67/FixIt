'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { MousePointerClick, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { useFilesStore } from '@/stores/files-store';

type DropZoneProps = {
  compact?: boolean;
};

export function DropZone({ compact = false }: DropZoneProps) {
  const add = useFilesStore((s) => s.add);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputId = useId();

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const handleFiles = useCallback(
    async (list: FileList | null) => {
      if (!list || list.length === 0) return;
      await add(Array.from(list));
    },
    [add],
  );

  // Prevent the browser from navigating away when a file is dropped anywhere on the page.
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  }, []);

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        if (!e.dataTransfer.types.includes('Files')) return;
        dragCounter.current += 1;
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        dragCounter.current = Math.max(0, dragCounter.current - 1);
        if (dragCounter.current === 0) setIsDragging(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        dragCounter.current = 0;
        setIsDragging(false);
        void handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        'border-border bg-card relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-colors',
        compact ? 'p-5' : 'p-8 sm:p-12',
        isDragging && 'border-primary bg-primary/5',
      )}
      data-testid="drop-zone"
      data-dragging={isDragging || undefined}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        className="sr-only"
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <UploadCloud
        className={cn(
          'text-muted-foreground mb-3 transition-colors',
          compact ? 'size-6' : 'size-8',
          isDragging && 'text-primary',
        )}
        aria-hidden
      />
      <p
        className={cn(
          'font-medium',
          compact ? 'text-sm' : 'text-sm sm:text-base',
          isDragging ? 'text-primary' : 'text-foreground',
        )}
      >
        {isDragging ? 'Drop them here' : compact ? 'Add more files' : 'Drop files here'}
      </p>
      {!compact && <p className="text-muted-foreground my-3 text-xs">or</p>}
      <Button
        size={compact ? 'sm' : 'default'}
        type="button"
        onClick={openPicker}
        className={compact ? 'mt-2' : ''}
      >
        <MousePointerClick className="size-4" aria-hidden />
        Choose files
      </Button>
      {!compact && (
        <p className="text-muted-foreground mt-4 max-w-sm text-xs">
          PDF, images, JSON, CSV, text — inspected locally in your browser.
        </p>
      )}
    </div>
  );
}
