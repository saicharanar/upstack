import type { ReactNode } from 'react';
import { ContinueCard } from '@/components/ContinueCard';
import { getManifest } from '@/content-layer/loader';
import { toNavModel } from '@/content-layer/nav';

export default function LearnOverviewPage(): ReactNode {
  const model = toNavModel(getManifest());

  return (
    <section className="overview">
      <h1 className="overview__title">Describing UI</h1>
      <p className="overview__lead">
        Your path through React starts here. Work through each chapter in order — pass its exercise
        to unlock the next.
      </p>
      <ContinueCard model={model} />
    </section>
  );
}
