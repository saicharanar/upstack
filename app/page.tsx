import type { ReactNode } from 'react';
import { Home, type AvailableStackData } from '@/components/Home';
import { getManifest } from '@/content-layer/loader';
import { chapterHref } from '@/content-layer/nav';
import { STACKS } from '@/stacks/registry';

const LEARN_OVERVIEW_HREF = '/learn';
/** Full planned React curriculum (Modules 0–5); most are not authored yet. */
const PLANNED_MODULE_COUNT = 6;

function availableStackData(): AvailableStackData {
  const manifest = getManifest();
  const order = manifest.chaptersInOrder;
  const hrefByChapterId = Object.fromEntries(
    order.map((entry) => [entry.chapterId, chapterHref(entry.moduleId, entry.chapterId)]),
  );
  const first = order[0];
  const exerciseCount = order.filter((entry) => entry.frontmatter.assessment !== null).length;

  return {
    firstHref: first ? chapterHref(first.moduleId, first.chapterId) : LEARN_OVERVIEW_HREF,
    hrefByChapterId,
    chapterOrder: order.map((entry) => entry.chapterId),
    moduleCount: manifest.modules.length,
    plannedModuleCount: PLANNED_MODULE_COUNT,
    exerciseCount,
  };
}

export default function HomePage(): ReactNode {
  return <Home stacks={STACKS} available={availableStackData()} />;
}
