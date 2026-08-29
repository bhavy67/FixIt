import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="border-border bg-secondary text-muted-foreground mb-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
        Phase 1 · Foundation
      </div>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
        <span className="text-primary">FixIt</span>
      </h1>
      <p className="text-muted-foreground mt-4 text-lg sm:text-xl">Drop it. Fix it. Done.</p>
      <p className="text-muted-foreground mt-6 max-w-xl text-sm text-balance sm:text-base">
        A local-first browser utility for annoying file operations. Nothing to install, nothing
        uploaded — everything happens on your device.
      </p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/tools"
          className="bg-primary text-primary-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm font-medium shadow-sm transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Browse tools
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <span className="text-muted-foreground text-xs">Coming in later phases</span>
      </div>

      <footer className="text-muted-foreground mt-24 text-xs">
        Foundation scaffold — real UI arrives in Phase 2.
      </footer>
    </main>
  );
}
