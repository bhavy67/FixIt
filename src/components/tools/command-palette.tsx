'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Image, Database, Search } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { TOOLS_META } from '@/tools/meta';
import { toolCategories } from '@/lib/site-config';

const categoryIcon = (slug: string) => {
  if (slug === 'pdf') return FileText;
  if (slug === 'image') return Image;
  return Database;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [toggle]);

  const byCategory = toolCategories
    .map((cat) => ({
      ...cat,
      tools: TOOLS_META.filter((t) => t.category === cat.slug),
    }))
    .filter((cat) => cat.tools.length > 0);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search tools…" />
      <CommandList>
        <CommandEmpty>No tools found.</CommandEmpty>
        {byCategory.map((cat) => {
          const Icon = categoryIcon(cat.slug);
          return (
            <CommandGroup key={cat.slug} heading={cat.label}>
              {cat.tools.map((tool) => (
                <CommandItem
                  key={tool.id}
                  value={`${tool.name} ${tool.tagline}`}
                  onSelect={() => {
                    router.push(`/tools/${tool.slug}`);
                    setOpen(false);
                  }}
                  className="gap-3"
                >
                  <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden />
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-medium">{tool.name}</span>
                    <span className="text-muted-foreground block truncate text-xs">
                      {tool.tagline}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}

export function CommandPaletteTrigger() {
  return (
    <button
      onClick={() => {
        const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
        document.dispatchEvent(e);
      }}
      className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring focus-visible:ring-offset-background hidden items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:flex"
      aria-label="Open command palette"
    >
      <Search className="size-3.5" aria-hidden />
      Search
      <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
