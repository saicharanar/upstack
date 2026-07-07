import fs from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';
import { z } from 'zod';
import {
  assessmentMetaSchema,
  chapterFrontmatterSchema,
  moduleFrontmatterSchema,
  type AssessmentMeta,
} from './schema';
import type { ChapterEntry, Manifest, ModuleEntry } from './manifest';

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'react');
const MODULE_INTRO_FILE = '_module.mdx';
const EDITABLE_DIR = 'files';
const TESTS_DIR = 'tests';

export interface AssessmentFile {
  readonly code: string;
  readonly readOnly: boolean;
  readonly hidden: boolean;
  readonly active: boolean;
}

export interface AssessmentBundle {
  readonly meta: AssessmentMeta;
  readonly template: string;
  readonly entry: string;
  readonly activeFile: string;
  readonly visibleFiles: readonly string[];
  readonly files: Readonly<Record<string, AssessmentFile>>;
}

function relativeToContent(absPath: string): string {
  return path.relative(CONTENT_ROOT, absPath);
}

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
}

function parseChapter(absPath: string): ChapterEntry {
  const raw = fs.readFileSync(absPath, 'utf8');
  const parsed = chapterFrontmatterSchema.safeParse(matter(raw).data);

  if (!parsed.success) {
    throw new Error(
      `Invalid chapter frontmatter in ${relativeToContent(absPath)}:\n${formatZodError(parsed.error)}`,
    );
  }

  return {
    moduleId: parsed.data.module,
    chapterId: parsed.data.id,
    filePath: absPath,
    frontmatter: parsed.data,
  };
}

function parseModule(absPath: string, chapters: readonly ChapterEntry[]): ModuleEntry {
  const raw = fs.readFileSync(absPath, 'utf8');
  const parsed = moduleFrontmatterSchema.safeParse(matter(raw).data);

  if (!parsed.success) {
    throw new Error(
      `Invalid module frontmatter in ${relativeToContent(absPath)}:\n${formatZodError(parsed.error)}`,
    );
  }

  const ordered = [...chapters].sort((a, b) => a.frontmatter.order - b.frontmatter.order);

  return {
    moduleId: parsed.data.id,
    filePath: absPath,
    frontmatter: parsed.data,
    chapters: ordered,
  };
}

function collectChaptersByDir(): Map<string, ChapterEntry[]> {
  const chapterFiles = fg.sync('modules/*/*.mdx', {
    cwd: CONTENT_ROOT,
    absolute: true,
    ignore: [`**/${MODULE_INTRO_FILE}`],
  });

  const byDir = new Map<string, ChapterEntry[]>();

  for (const file of chapterFiles) {
    const chapter = parseChapter(file);
    if (chapter.frontmatter.status !== 'published') continue;
    const dir = path.dirname(file);
    const bucket = byDir.get(dir) ?? [];
    bucket.push(chapter);
    byDir.set(dir, bucket);
  }

  return byDir;
}

function buildManifest(): Manifest {
  const moduleFiles = fg.sync(`modules/*/${MODULE_INTRO_FILE}`, {
    cwd: CONTENT_ROOT,
    absolute: true,
  });
  const chaptersByDir = collectChaptersByDir();

  const modules = moduleFiles
    .map((moduleFile) => parseModule(moduleFile, chaptersByDir.get(path.dirname(moduleFile)) ?? []))
    .sort((a, b) => a.frontmatter.order - b.frontmatter.order);

  const chaptersInOrder = modules.flatMap((module) => module.chapters);

  return { modules, chaptersInOrder };
}

let cachedManifest: Manifest | null = null;

export function getManifest(): Manifest {
  if (!cachedManifest) cachedManifest = buildManifest();
  return cachedManifest;
}

export function getChapterSource(filePath: string): string {
  const raw = fs.readFileSync(filePath, 'utf8');
  return matter(raw).content;
}

function readDirIntoFiles(
  dir: string,
  mountPrefix: string,
  options: { readOnly: boolean; hidden: boolean },
): Record<string, AssessmentFile> {
  if (!fs.existsSync(dir)) return {};

  const entries = fg.sync('**/*', { cwd: dir, absolute: false, onlyFiles: true });
  const files: Record<string, AssessmentFile> = {};

  for (const entry of entries) {
    const sandpackPath = `${mountPrefix}${entry}`;
    files[sandpackPath] = {
      code: fs.readFileSync(path.join(dir, entry), 'utf8'),
      readOnly: options.readOnly,
      hidden: options.hidden,
      active: false,
    };
  }

  return files;
}

function locateAssessmentDir(assessmentId: string): { dir: string; moduleDir: string } {
  const matches = fg.sync(`modules/*/assessments/${assessmentId}/meta.ts`, {
    cwd: CONTENT_ROOT,
    absolute: true,
  });

  const metaPath = matches[0];
  if (!metaPath) {
    throw new Error(`Assessment "${assessmentId}" not found under content/react/modules/*/assessments`);
  }

  const dir = path.dirname(metaPath);
  const moduleDir = path.basename(path.dirname(path.dirname(dir)));
  return { dir, moduleDir };
}

async function importAssessmentMeta(moduleDir: string, assessmentId: string): Promise<AssessmentMeta> {
  const module = (await import(
    /* webpackInclude: /assessments\/[^/]+\/meta\.ts$/ */
    `../../content/react/modules/${moduleDir}/assessments/${assessmentId}/meta.ts`
  )) as { default?: unknown; meta?: unknown };

  const parsed = assessmentMetaSchema.safeParse(module.default ?? module.meta);
  if (!parsed.success) {
    throw new Error(
      `Invalid assessment meta for "${assessmentId}":\n${formatZodError(parsed.error)}`,
    );
  }

  return parsed.data;
}

export async function getAssessmentBundle(assessmentId: string): Promise<AssessmentBundle> {
  const { dir, moduleDir } = locateAssessmentDir(assessmentId);
  const meta = await importAssessmentMeta(moduleDir, assessmentId);

  const editable = readDirIntoFiles(path.join(dir, EDITABLE_DIR), '/', {
    readOnly: false,
    hidden: false,
  });
  const hiddenTests = readDirIntoFiles(path.join(dir, TESTS_DIR), '/', {
    readOnly: true,
    hidden: true,
  });

  const merged: Record<string, AssessmentFile> = { ...editable, ...hiddenTests };
  const activeFile = merged[meta.entry] ? meta.entry : Object.keys(editable)[0] ?? meta.entry;

  const files: Record<string, AssessmentFile> = {};
  for (const [filePath, file] of Object.entries(merged)) {
    files[filePath] = { ...file, active: filePath === activeFile };
  }

  const visibleFiles =
    meta.visibleFiles.length > 0
      ? meta.visibleFiles
      : Object.keys(editable);

  return {
    meta,
    template: meta.template,
    entry: meta.entry,
    activeFile,
    visibleFiles,
    files,
  };
}
