import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ChevronDown,
  MousePointerClick,
  ShieldCheck,
  Sliders,
  Download,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Workspace } from '@/components/drop/workspace';
import { TOOLS_META, getToolMetaBySlug } from '@/tools/meta';
import { toolCategories } from '@/lib/site-config';
import { cn } from '@/lib/cn';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return TOOLS_META.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolMetaBySlug(slug);
  if (!tool) return { title: 'Tool not found' };
  return {
    title: tool.name,
    description: `${tool.tagline} Runs locally in your browser — no upload, no signup.`,
    openGraph: {
      title: `${tool.name} · FixIt`,
      description: tool.tagline,
      type: 'website',
    },
  };
}

const HOW_IT_WORKS: readonly {
  icon: typeof MousePointerClick;
  title: string;
  body: string;
}[] = [
  {
    icon: MousePointerClick,
    title: 'Drop or choose files',
    body: 'Files stay in your browser — nothing is uploaded.',
  },
  {
    icon: Sliders,
    title: 'Adjust options',
    body: 'Sensible defaults are ready; tweak if you need to.',
  },
  {
    icon: Download,
    title: 'Download the result',
    body: 'Each output is a real file, ready to save or share.',
  },
];

const categoryDot: Record<string, string> = {
  pdf: 'bg-blue-500',
  'pdf-security': 'bg-violet-500',
  image: 'bg-amber-500',
  data: 'bg-emerald-500',
  text: 'bg-slate-400',
};

export default async function ToolPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const tool = getToolMetaBySlug(slug);
  if (!tool) notFound();

  const category = toolCategories.find((c) => c.slug === tool.category)?.label ?? tool.category;

  const relatedTools = TOOLS_META.filter(
    (t) => t.category === tool.category && t.id !== tool.id,
  ).slice(0, 3);

  return (
    <main>
      {/* Tool header */}
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-4">
        <Link
          href="/tools"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center gap-1 rounded-md text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          All tools
        </Link>

        <header className="mt-6 text-center">
          <Badge variant="secondary" className="mb-3 rounded-full font-medium">
            <ShieldCheck className="size-3" aria-hidden />
            Local &middot; nothing uploaded
          </Badge>
          <p className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wider uppercase">
            {category}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            {tool.name}
          </h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-balance sm:text-lg">
            {tool.tagline}
          </p>
        </header>
      </div>

      {/* Workspace */}
      <section className="px-4 py-6">
        <div className="mx-auto max-w-6xl">
          <Workspace presetToolId={tool.id} />
        </div>
      </section>

      {/* About + Related */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-6xl">
          {/* Collapsible "About this tool" */}
          <details className="group border border-border rounded-xl overflow-hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none
              hover:bg-muted/50 transition-colors duration-150">
              <h2 className="text-sm font-semibold">How it works</h2>
              <ChevronDown className="size-4 text-muted-foreground transition-transform duration-150 group-open:rotate-180" />
            </summary>
            <div className="p-4 pt-0 border-t border-border">
              <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3 mt-4">
                {HOW_IT_WORKS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <li
                      key={step.title}
                      className="border-border bg-card flex flex-col items-start gap-2 rounded-xl border p-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className="bg-secondary text-secondary-foreground inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold">
                          {i + 1}
                        </span>
                        <Icon className="text-muted-foreground size-4" aria-hidden />
                      </div>
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-muted-foreground text-xs">{step.body}</p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </details>

          {/* Related tools */}
          {relatedTools.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Related tools
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {relatedTools.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tools/${t.slug}`}
                    className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3
                      hover:shadow-sm hover:border-primary/20 transition-all duration-150"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'size-1.5 rounded-full',
                          categoryDot[t.category] ?? 'bg-muted-foreground',
                        )}
                      />
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {t.category}
                      </span>
                    </div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{t.tagline}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
