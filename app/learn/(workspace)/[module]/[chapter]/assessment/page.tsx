import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { AssessmentWorkspace } from '@/assessment/AssessmentWorkspace';
import { getAssessmentBundle, getManifest } from '@/content-layer/loader';
import { chapterIndex, findChapter } from '@/content-layer/manifest';
import { chapterHref } from '@/content-layer/nav';
import type { AssessmentMeta } from '@/content-layer/schema';

interface AssessmentParams {
  readonly module: string;
  readonly chapter: string;
}

export function generateStaticParams(): AssessmentParams[] {
  return getManifest()
    .chaptersInOrder.filter((entry) => entry.frontmatter.assessment !== null)
    .map((entry) => ({ module: entry.moduleId, chapter: entry.chapterId }));
}

function InstructionsPane({ title, meta }: { title: string; meta: AssessmentMeta }): ReactNode {
  return (
    <aside className="workspace__instructions">
      <p className="workspace__eyebrow">Graded exercise</p>
      <h1 className="workspace__title">{title}</h1>
      <p className="workspace__lead">
        Edit the code in the center panel. The tests run automatically as you type; the preview on
        the right shows your component live. Pass every required concept to complete the chapter.
      </p>
      <p className="workspace__rubric-label">You pass when you</p>
      <ul className="workspace__rubric">
        {meta.concepts.map((concept) => (
          <li key={concept.id} className="workspace__rubric-item">
            <span className="workspace__rubric-mark" aria-hidden="true">
              ›
            </span>
            <span>{concept.label}</span>
            {!concept.required ? <span className="workspace__rubric-tag">(optional)</span> : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default async function AssessmentWorkspacePage({
  params,
}: {
  params: Promise<AssessmentParams>;
}): Promise<ReactNode> {
  const { module: moduleId, chapter: chapterId } = await params;
  const manifest = getManifest();
  const entry = findChapter(manifest, moduleId, chapterId);
  if (!entry || entry.frontmatter.assessment === null) notFound();

  const index = chapterIndex(manifest, entry.chapterId);
  const next = manifest.chaptersInOrder[index + 1];
  const nextHref = next ? chapterHref(next.moduleId, next.chapterId) : null;
  const bundle = await getAssessmentBundle(entry.frontmatter.assessment);

  return (
    <div className="workspace">
      <div className="workspace__bar">
        <Link className="workspace__back" href={chapterHref(moduleId, chapterId)}>
          ← Back to chapter
        </Link>
        <h2 className="workspace__heading">{entry.frontmatter.title}</h2>
      </div>

      <div className="workspace__panes">
        <InstructionsPane title={entry.frontmatter.title} meta={bundle.meta} />
        <div className="workspace__runner">
          <AssessmentWorkspace
            bundle={bundle}
            chapterId={entry.chapterId}
            backHref={chapterHref(moduleId, chapterId)}
            nextHref={nextHref}
          />
        </div>
      </div>
    </div>
  );
}
