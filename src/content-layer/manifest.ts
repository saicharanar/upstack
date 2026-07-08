import type { ChapterFrontmatter, ModuleFrontmatter } from './schema';

export interface ChapterEntry {
  readonly moduleId: string;
  readonly chapterId: string;
  readonly filePath: string;
  readonly frontmatter: ChapterFrontmatter;
}

export interface ModuleEntry {
  readonly moduleId: string;
  readonly filePath: string;
  readonly frontmatter: ModuleFrontmatter;
  readonly chapters: readonly ChapterEntry[];
}

export interface Manifest {
  readonly stack: string;
  readonly modules: readonly ModuleEntry[];
  readonly chaptersInOrder: readonly ChapterEntry[];
}

export function findChapter(
  manifest: Manifest,
  moduleId: string,
  chapterId: string,
): ChapterEntry | null {
  return (
    manifest.chaptersInOrder.find(
      (chapter) => chapter.moduleId === moduleId && chapter.chapterId === chapterId,
    ) ?? null
  );
}

export function chapterIndex(manifest: Manifest, chapterId: string): number {
  return manifest.chaptersInOrder.findIndex((chapter) => chapter.chapterId === chapterId);
}
