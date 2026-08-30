import type { Metadata } from 'next';
import { ScanClient } from './_components/scan-client';

export const metadata: Metadata = {
  title: 'Scan Document — Fixit',
  description: 'Use your camera to scan documents and save them as a PDF.',
};

export default function ScanPage() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Scan Document</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Capture pages with your camera and download as a single PDF.
        </p>
      </div>
      <ScanClient />
    </main>
  );
}
