import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { ContinueCard } from '@/components/ContinueCard';
import { getManifest } from '@/content-layer/loader';
import { toNavModel } from '@/content-layer/nav';
import { STACKS, availableStackIds } from '@/stacks/registry';

interface StackParams {
  readonly stack: string;
}

export function generateStaticParams(): StackParams[] {
  return availableStackIds().map((stack) => ({ stack }));
}

export default async function StackOverviewPage({
  params,
}: {
  params: Promise<StackParams>;
}): Promise<ReactNode> {
  const { stack } = await params;
  const summary = STACKS.find((entry) => entry.id === stack && entry.status === 'available');
  if (!summary) notFound();

  const model = toNavModel(getManifest(stack));

  return (
    <section className="overview">
      <h1 className="overview__title">{summary.name}</h1>
      <p className="overview__lead">
        Work through each chapter in order — read the concept, see it running, and pass its exercise
        to make it your own. Jump around freely; nothing is locked.
      </p>
      <ContinueCard model={model} />
    </section>
  );
}
