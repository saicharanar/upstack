import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { ChapterActions } from '@/components/ChapterActions';
import { ChapterNav, type ChapterNavLink } from '@/components/ChapterNav';
import { OnThisPage } from '@/components/OnThisPage';
import { getChapterSource, getManifest } from '@/content-layer/loader';
import { chapterIndex, findChapter, type ChapterEntry, type Manifest } from '@/content-layer/manifest';
import { chapterHref } from '@/content-layer/nav';
import { extractHeadings } from '@/content-layer/toc';
import { ChapterMarkup } from '@/mdx/mdx';
import { availableStackIds } from '@/stacks/registry';

interface ChapterParams {
  readonly stack: string;
  readonly module: string;
  readonly chapter: string;
}

export function generateStaticParams(): ChapterParams[] {
  return availableStackIds().flatMap((stack) =>
    getManifest(stack).chaptersInOrder.map((entry) => ({
      stack,
      module: entry.moduleId,
      chapter: entry.chapterId,
    })),
  );
}

function toNavLink(stack: string, entry: ChapterEntry | undefined): ChapterNavLink | null {
  if (!entry) return null;
  return { title: entry.frontmatter.title, href: chapterHref(stack, entry.moduleId, entry.chapterId) };
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function chapterEyebrow(manifest: Manifest, entry: ChapterEntry): string {
  const module = manifest.modules.find((candidate) => candidate.moduleId === entry.moduleId);
  const modulePart = module ? `Module ${pad(module.frontmatter.order)}` : entry.moduleId;
  return `${modulePart} · Chapter ${pad(entry.frontmatter.order)} · ${entry.frontmatter.estMinutes} min`;
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<ChapterParams>;
}): Promise<ReactNode> {
  const { stack, module: moduleId, chapter: chapterId } = await params;
  const manifest = getManifest(stack);
  const entry = findChapter(manifest, moduleId, chapterId);
  if (!entry) notFound();

  const index = chapterIndex(manifest, entry.chapterId);
  const source = getChapterSource(entry.filePath);
  const headings = extractHeadings(source);
  const next = manifest.chaptersInOrder[index + 1];
  const nextHref = next ? chapterHref(stack, next.moduleId, next.chapterId) : null;

  return (
    <div className="chapter-layout">
      <article className="chapter-layout__reading">
        <header className="chapter__header">
          <p className="chapter__eyebrow">{chapterEyebrow(manifest, entry)}</p>
          <h1 className="chapter__title">{entry.frontmatter.title}</h1>
          <p className="chapter__summary">{entry.frontmatter.summary}</p>
        </header>

        <div className="chapter__body">
          <ChapterMarkup
            source={source}
            chapterId={entry.chapterId}
            moduleId={entry.moduleId}
            stack={stack}
          />
        </div>

        <div className="chapter-actions">
          <ChapterActions chapterId={entry.chapterId} nextHref={nextHref} />
        </div>

        <ChapterNav
          previous={toNavLink(stack, manifest.chaptersInOrder[index - 1])}
          next={toNavLink(stack, next)}
        />
      </article>

      <OnThisPage items={headings} />
    </div>
  );
}
