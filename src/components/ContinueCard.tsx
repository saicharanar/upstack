'use client';

import Link from 'next/link';
import { useMemo, type ReactNode } from 'react';
import { computeChapterStates, type NavChapter, type NavModel } from '@/content-layer/nav';
import { useProgressState } from '@/progress/ProgressProvider';

function indexChapters(model: NavModel): Map<string, NavChapter> {
  const byId = new Map<string, NavChapter>();
  model.modules.forEach((module) => module.chapters.forEach((chapter) => byId.set(chapter.chapterId, chapter)));
  return byId;
}

export function ContinueCard({ model }: { model: NavModel }): ReactNode {
  const progress = useProgressState();
  const byId = useMemo(() => indexChapters(model), [model]);
  const states = useMemo(() => computeChapterStates(model, progress), [model, progress]);

  const target = useMemo(() => {
    const lastVisited = progress.lastVisited;
    const lastState = lastVisited ? states[lastVisited] : undefined;
    if (lastVisited && (lastState === 'in-progress' || lastState === 'available')) return lastVisited;
    return model.order.find((id) => states[id] === 'in-progress' || states[id] === 'available') ?? null;
  }, [model.order, progress.lastVisited, states]);

  const chapter = target ? byId.get(target) : undefined;
  if (!chapter) return null;

  const resumed = progress.chapters[chapter.chapterId]?.status === 'in-progress';

  return (
    <Link className="continue-card" href={chapter.href}>
      <span className="continue-card__hint">{resumed ? 'Continue where you left off' : 'Start learning'}</span>
      <span className="continue-card__title">{chapter.title}</span>
      <span className="continue-card__meta">~{chapter.estMinutes} min</span>
    </Link>
  );
}
