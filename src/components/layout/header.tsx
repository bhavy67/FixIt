import Link from 'next/link';
import { MobileNav } from './mobile-nav';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-12 px-4 border-b border-border bg-background/80 backdrop-blur-sm">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="size-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground text-xs font-bold select-none">F</span>
        </div>
        <span className="text-sm font-semibold">FixIt</span>
      </Link>
      {/* Right side: theme toggle + hamburger */}
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <MobileNav />
      </div>
    </header>
  );
}
