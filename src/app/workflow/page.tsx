import type { Metadata } from 'next';
import { TOOLS_META } from '@/tools/meta';
import { WorkflowClient } from './_components/workflow-client';

export const metadata: Metadata = {
  title: 'Workflow Builder — FixIt',
  description: 'Chain multiple file tools together into a single automated workflow.',
};

export default function WorkflowPage() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Workflow Builder</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Chain multiple tools together. The output of each step feeds into the next.
        </p>
      </div>
      <WorkflowClient tools={TOOLS_META} />
    </main>
  );
}
