'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
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

  if (compact) {
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
          'border-border rounded-xl border border-dashed p-3 text-center transition-all duration-150',
          isDragging && 'border-primary bg-primary/5',
        )}
        data-testid="drop-zone-compact"
        data-dragging={isDragging || undefined}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={openPicker}
          className="w-full text-xs"
        >
          + Add more files
        </Button>
      </div>
    );
  }

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
      onClick={openPicker}
      className={cn(
        'w-full min-h-[420px] rounded-2xl border-2 border-dashed border-border',
        'flex flex-col items-center justify-center gap-6 p-8',
        'cursor-pointer transition-all duration-200',
        'hover:border-primary/50 hover:bg-primary/[0.02]',
        isDragging && 'border-primary bg-primary/5 scale-[1.002]',
      )}
      data-testid="drop-zone"
      data-dragging={isDragging || undefined}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <div
        className={cn(
          'rounded-2xl bg-muted p-5 transition-transform duration-200',
          isDragging ? 'scale-110' : '',
        )}
      >
        <UploadCloud
          className={cn(
            'size-10 transition-colors duration-200',
            isDragging ? 'text-primary' : 'text-muted-foreground',
          )}
          aria-hidden
        />
      </div>
      <div className="text-center">
        <p className="text-xl font-semibold">
          {isDragging ? 'Release to drop' : 'Drop files here'}
        </p>
        <p className="text-muted-foreground mt-1.5 text-sm">
          PDFs · Images · CSVs · HTML · Markdown and more
        </p>
      </div>
      <Button variant="outline" size="sm" tabIndex={-1} type="button">
        Choose files
      </Button>
    </div>
  );
}
