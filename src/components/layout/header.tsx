import Link from 'next/link';
import { BrandMark } from '@/components/common/brand-mark';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { MobileNav } from '@/components/layout/mobile-nav';
import { CommandPaletteTrigger } from '@/components/tools/command-palette';
import { navItems } from '@/lib/site-config';

export function Header() {
  return (
    <header className="border-border bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="focus-visible:ring-ring focus-visible:ring-offset-background rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label="FixIt — home"
        >
          <BrandMark size="sm" />
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-1" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring focus-visible:ring-offset-background rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <CommandPaletteTrigger />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
