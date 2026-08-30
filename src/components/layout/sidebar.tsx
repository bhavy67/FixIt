'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Workflow, Camera, Moon, Sun } from 'lucide-react';
import { BrandMark } from '@/components/common/brand-mark';
import { CommandPaletteTrigger } from '@/components/tools/command-palette';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { toolsByCategory } from '@/tools/meta';
import { toolCategories } from '@/lib/site-config';
import { getToolIcon } from '@/lib/tool-icons';
import { categoryDot } from '@/lib/tool-category-styles';

const GROUPED = toolsByCategory();

const TOP_NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/workflow', icon: Workflow, label: 'Workflow', exact: false },
  { href: '/scan', icon: Camera, label: 'Scan', exact: false },
] as const;

function ThemeRow() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors duration-150 cursor-pointer"
    >
      {mounted ? (
        isDark ? <Sun className="size-[15px] shrink-0" aria-hidden /> : <Moon className="size-[15px] shrink-0" aria-hidden />
      ) : (
        <div className="size-[15px] shrink-0" />
      )}
      {mounted ? (isDark ? 'Light mode' : 'Dark mode') : 'Toggle theme'}
    </button>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-60 border-r border-border bg-card z-30">
      {/* Logo */}
      <div className="px-4 py-5 shrink-0">
        <Link href="/" className="inline-flex">
          <BrandMark size="md" />
        </Link>
      </div>

      {/* Search */}
      <div className="px-3 pb-3 shrink-0">
        <CommandPaletteTrigger />
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-none" aria-label="Primary">
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

      {/* Bottom — theme toggle as a labelled nav row */}
      <div className="px-2 py-2 border-t border-border shrink-0">
        <ThemeRow />
      </div>
    </aside>
  );
}
