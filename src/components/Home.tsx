'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useProgressState } from '@/progress/ProgressProvider';
import { isChapterComplete } from '@/progress/store';
import type { StackSummary } from '@/stacks/registry';

export interface AvailableStackData {
  readonly firstHref: string;
  readonly hrefByChapterId: Readonly<Record<string, string>>;
  readonly chapterOrder: readonly string[];
  readonly moduleCount: number;
  readonly plannedModuleCount: number;
  readonly exerciseCount: number;
}

export interface HomeProps {
  readonly stacks: readonly StackSummary[];
  readonly available: Readonly<Record<string, AvailableStackData>>;
}

function FeaturedStack({
  stack,
  data,
}: {
  stack: StackSummary;
  data: AvailableStackData;
}): ReactNode {
  const progress = useProgressState();
  const total = data.chapterOrder.length;
  const completed = data.chapterOrder.filter((id) => isChapterComplete(progress.chapters[id])).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const resumeHref =
    (progress.lastVisited && data.hrefByChapterId[progress.lastVisited]) || data.firstHref;
  const started = completed > 0 || Boolean(progress.lastVisited);

  return (
    <article className="featured">
      <div className="featured__head">
        <span className="featured__icon" aria-hidden="true">
          {stack.icon}
        </span>
        <div className="featured__heading">
          <h2 className="featured__name">
            {stack.name}
            {started ? <span className="featured__tag">In progress</span> : null}
          </h2>
          <p className="featured__tagline">{stack.tagline}</p>
        </div>
      </div>

      <dl className="featured__stats">
        <div className="featured__stat">
          <dt>Chapters</dt>
          <dd>{total}</dd>
        </div>
        <div className="featured__stat">
          <dt>Exercises</dt>
          <dd>{data.exerciseCount}</dd>
        </div>
        <div className="featured__stat">
          <dt>Modules</dt>
          <dd>{data.moduleCount}</dd>
        </div>
      </dl>

      <div className="featured__progress" aria-hidden={total === 0}>
        <span className="featured__track">
          <span className="featured__fill" style={{ inlineSize: `${percent}%` }} />
        </span>
        <span className="featured__percent">
          {completed} / {total} done
        </span>
      </div>

      <div className="featured__actions">
        <Link className="button button--primary featured__cta" href={resumeHref}>
          {started ? 'Resume where you left off' : 'Start learning'}
        </Link>
        <span className="featured__meta">free · runs in your browser</span>
      </div>
    </article>
  );
}

function ComingSoonCard({ stack }: { stack: StackSummary }): ReactNode {
  return (
    <article className="soon-card" aria-disabled="true">
      <span className="soon-card__icon" aria-hidden="true">
        {stack.icon}
      </span>
      <div className="soon-card__body">
        <h3 className="soon-card__name">
          {stack.name} <span className="soon-card__badge">Coming soon</span>
        </h3>
        <p className="soon-card__tagline">{stack.tagline}</p>
      </div>
    </article>
  );
}

export function Home({ stacks, available }: HomeProps): ReactNode {
  const featured = stacks
    .filter((stack) => stack.status === 'available')
    .map((stack) => ({ stack, data: available[stack.id] }))
    .filter((entry): entry is { stack: StackSummary; data: AvailableStackData } =>
      Boolean(entry.data),
    );
  const soon = stacks.filter((stack) => stack.status === 'coming-soon');

  return (
    <main className="home">
      <section className="home__hero">
        <p className="home__eyebrow">upstack</p>
        <h1 className="home__title">Learn a stack by building, not memorising.</h1>
        <p className="home__lead">
          Pick a track and go chapter by chapter. Each one explains a concept, shows it running,
          and ends with a graded, in-browser exercise — write real code, run real tests, mark your
          progress. Jump around freely; nothing is locked.
        </p>
      </section>

      {featured.length > 0 ? (
        <section className="home__featured" aria-label="Your tracks">
          {featured.map(({ stack, data }) => (
            <FeaturedStack key={stack.id} stack={stack} data={data} />
          ))}
        </section>
      ) : null}

      {soon.length > 0 ? (
        <section className="home__more" aria-label="More tracks">
          <h2 className="home__more-title">More tracks on the way</h2>
          <div className="home__soon-grid">
            {soon.map((stack) => (
              <ComingSoonCard key={stack.id} stack={stack} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
