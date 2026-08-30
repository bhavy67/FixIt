'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LayoutDashboard, Workflow, Camera } from 'lucide-react';
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
import { toolsByCategory } from '@/tools/meta';
import { toolCategories } from '@/lib/site-config';
import { getToolIcon } from '@/lib/tool-icons';
import { categoryDot } from '@/lib/tool-category-styles';
import { cn } from '@/lib/cn';

const GROUPED = toolsByCategory();

const TOP_NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/workflow', icon: Workflow, label: 'Workflow', exact: false },
  { href: '/scan', icon: Camera, label: 'Scan', exact: false },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu className="size-5" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[80vw] max-w-[280px] flex flex-col p-0 gap-0">
        <SheetHeader className="px-4 py-4 border-b border-border shrink-0">
          <SheetTitle asChild>
            <span>
              <BrandMark size="sm" />
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>

        {/* Scrollable content */}
        <nav className="flex-1 overflow-y-auto scrollbar-none py-2" aria-label="Mobile navigation">
          {/* Primary links */}
          <div className="px-2 space-y-0.5">
            {TOP_NAV.map(({ href, icon: Icon, label, exact }) => {
              const active = exact
                ? pathname === href
                : pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] font-medium transition-colors duration-150',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                  )}
                >
                  <Icon className="size-[15px] shrink-0" aria-hidden />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="mx-3 my-3 border-t border-border/60" />

          {/* Tools by category */}
          <div className="px-2 pb-4 space-y-5">
            {toolCategories.map((cat) => {
              const tools = GROUPED[cat.slug] ?? [];
              if (tools.length === 0) return null;
              return (
                <div key={cat.slug}>
                  {/* Category header */}
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <span
                      className={cn(
                        'size-[7px] rounded-full shrink-0',
                        categoryDot[cat.slug] ?? 'bg-muted-foreground',
                      )}
                    />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                      {cat.label}
                    </span>
                  </div>

                  {/* Tool list */}
                  <div className="space-y-0.5">
                    {tools.map((tool) => {
                      const Icon = getToolIcon(tool.id, tool.category);
                      const active = pathname === `/tools/${tool.slug}`;
                      return (
                        <Link
                          key={tool.id}
                          href={`/tools/${tool.slug}`}
                          onClick={close}
                          className={cn(
                            'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12.5px] leading-snug transition-colors duration-150',
                            active
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                          )}
                        >
                          <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
                          <span className="truncate">{tool.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
