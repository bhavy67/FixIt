'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { BrandMark } from '@/components/common/brand-mark';
import { navItems } from '@/lib/site-config';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="size-5" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[80vw] max-w-xs">
        <SheetHeader>
          <SheetTitle asChild>
            <span>
              <BrandMark size="sm" />
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation and settings</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-foreground hover:bg-accent hover:text-accent-foreground flex h-12 items-center rounded-md px-2 text-base font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
