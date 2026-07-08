import type { ReactNode } from 'react';
import { Home, type AvailableStackData } from '@/components/Home';
import { getManifest } from '@/content-layer/loader';
import { chapterHref } from '@/content-layer/nav';
import { STACKS, availableStackIds } from '@/stacks/registry';

/** Roughly how many modules the full curriculum is aiming at (for the home stats). */
const PLANNED_MODULE_COUNT = 8;

function stackData(stack: string): AvailableStackData {
  const manifest = getManifest(stack);
  const order = manifest.chaptersInOrder;
  const hrefByChapterId = Object.fromEntries(
    order.map((entry) => [entry.chapterId, chapterHref(stack, entry.moduleId, entry.chapterId)]),
  );
  const first = order[0];
  const exerciseCount = order.filter((entry) => entry.frontmatter.assessment !== null).length;

  return {
    firstHref: first ? chapterHref(stack, first.moduleId, first.chapterId) : '/',
    hrefByChapterId,
    chapterOrder: order.map((entry) => entry.chapterId),
    moduleCount: manifest.modules.length,
    plannedModuleCount: PLANNED_MODULE_COUNT,
    exerciseCount,
  };
}

export default function HomePage(): ReactNode {
  const available = Object.fromEntries(availableStackIds().map((id) => [id, stackData(id)]));
  return <Home stacks={STACKS} available={available} />;
}
