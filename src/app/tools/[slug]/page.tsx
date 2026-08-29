import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MousePointerClick, ShieldCheck, Sliders, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Workspace } from '@/components/drop/workspace';
import { TOOLS_META, getToolMetaBySlug } from '@/tools/meta';
import { toolCategories } from '@/lib/site-config';

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

export default async function ToolPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const tool = getToolMetaBySlug(slug);
  if (!tool) notFound();

  const category = toolCategories.find((c) => c.slug === tool.category)?.label ?? tool.category;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
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
          Local · nothing uploaded
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

      <div className="mt-8">
        <Workspace presetToolId={tool.id} />
      </div>

      <section className="mt-14" aria-labelledby="how-it-works">
        <h2
          id="how-it-works"
          className="text-muted-foreground mb-6 text-center text-xs font-medium tracking-wider uppercase"
        >
          How it works
        </h2>
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
      </section>
    </main>
  );
}
