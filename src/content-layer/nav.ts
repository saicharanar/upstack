import type { Manifest } from './manifest';
import { isChapterComplete, type ProgressState } from '@/progress/store';

export type NavChapterState = 'completed' | 'in-progress' | 'available';

export interface NavChapter {
  readonly moduleId: string;
  readonly chapterId: string;
  readonly title: string;
  readonly order: number;
  readonly estMinutes: number;
  readonly hasAssessment: boolean;
  readonly prereqs: readonly string[];
  readonly href: string;
}

export interface NavModule {
  readonly moduleId: string;
  readonly title: string;
  readonly icon: string;
  readonly order: number;
  readonly chapters: readonly NavChapter[];
}

export interface NavModel {
  readonly stack: string;
  readonly modules: readonly NavModule[];
  readonly order: readonly string[];
}

export function chapterHref(stack: string, moduleId: string, chapterId: string): string {
  return `/learn/${stack}/${moduleId}/${chapterId}`;
}

export function assessmentHref(stack: string, moduleId: string, chapterId: string): string {
  return `/learn/${stack}/${moduleId}/${chapterId}/assessment`;
}

export function toNavModel(manifest: Manifest): NavModel {
  const stack = manifest.stack;
  const modules = manifest.modules.map((module) => ({
    moduleId: module.moduleId,
    title: module.frontmatter.title,
    icon: module.frontmatter.icon,
    order: module.frontmatter.order,
    chapters: module.chapters.map((chapter) => ({
      moduleId: chapter.moduleId,
      chapterId: chapter.chapterId,
      title: chapter.frontmatter.title,
      order: chapter.frontmatter.order,
      estMinutes: chapter.frontmatter.estMinutes,
      hasAssessment: chapter.frontmatter.assessment !== null,
      prereqs: chapter.frontmatter.prereqs,
      href: chapterHref(stack, chapter.moduleId, chapter.chapterId),
    })),
  }));

  return { stack, modules, order: manifest.chaptersInOrder.map((chapter) => chapter.chapterId) };
}

// No locking: every chapter is freely navigable. State is purely a reflection
// of the learner's progress — completed, in-progress, or not yet started.
export function computeChapterStates(
  model: NavModel,
  state: ProgressState,
): Readonly<Record<string, NavChapterState>> {
  const byId = new Map<string, NavChapter>();
  model.modules.forEach((module) => module.chapters.forEach((chapter) => byId.set(chapter.chapterId, chapter)));

  const result: Record<string, NavChapterState> = {};

  model.order.forEach((chapterId) => {
    if (!byId.has(chapterId)) return;

    if (isChapterComplete(state.chapters[chapterId])) {
      result[chapterId] = 'completed';
      return;
    }
    result[chapterId] = state.chapters[chapterId]?.status === 'in-progress' ? 'in-progress' : 'available';
  });

  return result;
}
