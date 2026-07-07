import Link from 'next/link';
import type { ReactNode } from 'react';

export interface ChapterNavLink {
  readonly title: string;
  readonly href: string;
}

export function ChapterNav({
  previous,
  next,
}: {
  previous: ChapterNavLink | null;
  next: ChapterNavLink | null;
}): ReactNode {
  return (
    <nav className="chapter-nav" aria-label="Chapter navigation">
      {previous ? (
        <Link className="chapter-nav__link" data-direction="previous" href={previous.href}>
          <span className="chapter-nav__hint">Previous</span>
          <span className="chapter-nav__title">{previous.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link className="chapter-nav__link" data-direction="next" href={next.href}>
          <span className="chapter-nav__hint">Next</span>
          <span className="chapter-nav__title">{next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
