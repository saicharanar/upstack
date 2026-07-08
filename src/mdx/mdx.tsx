import { MDXRemote } from 'next-mdx-remote/rsc';
import type { ReactNode } from 'react';
import { createMdxComponents } from './components';

export function ChapterMarkup({
  source,
  chapterId,
  moduleId,
  stack,
}: {
  source: string;
  chapterId: string;
  moduleId: string;
  stack: string;
}): ReactNode {
  return <MDXRemote source={source} components={createMdxComponents(chapterId, moduleId, stack)} />;
}
