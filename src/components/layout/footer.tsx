import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { BrandMark } from '@/components/common/brand-mark';

export function Footer() {
  return (
    <footer className="border-border bg-background border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-2">
          <BrandMark size="sm" />
          <p className="text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" aria-hidden />
              Processed locally in your browser.
            </span>
          </p>
        </div>
        <nav className="text-muted-foreground flex items-center gap-6" aria-label="Footer">
          <Link
            href="/tools"
            className="hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Tools
          </Link>
        </nav>
      </div>
    </footer>
  );
}
