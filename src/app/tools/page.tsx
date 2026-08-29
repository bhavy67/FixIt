import type { Metadata } from 'next';
import Link from 'next/link';
import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Tools',
  description: 'Browse FixIt tools.',
};

export default function ToolsPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="bg-secondary text-secondary-foreground mb-5 inline-flex size-12 items-center justify-center rounded-full"
        aria-hidden
      >
        <Wrench className="size-6" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tools coming soon</h1>
      <p className="text-muted-foreground mt-4 max-w-md text-balance">
        The tool catalog goes live in a later phase. For now, browse the popular picks on the home
        page.
      </p>
      <Button asChild variant="outline" className="mt-8">
        <Link href="/">Back to home</Link>
      </Button>
    </main>
  );
}
