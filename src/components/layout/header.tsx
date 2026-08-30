import Link from 'next/link';
import { MobileNav } from './mobile-nav';
import { ThemeToggle } from './theme-toggle';
import { BrandMark } from '@/components/common/brand-mark';

export function Header() {
  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-12 px-4 border-b border-border bg-background/80 backdrop-blur-sm">
      <Link href="/">
        <BrandMark size="sm" />
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <MobileNav />
      </div>
    </header>
  );
}
