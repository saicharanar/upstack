import { z } from 'zod';

export const CHAPTER_STATUSES = ['draft', 'published'] as const;
export const PASS_RULE_ALL_REQUIRED = 'all-required';

export const chapterFrontmatterSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int().nonnegative(),
  module: z.string().min(1),
  summary: z.string().min(1),
  concepts: z.array(z.string().min(1)).default([]),
  estMinutes: z.number().int().positive(),
  status: z.enum(CHAPTER_STATUSES).default('draft'),
  assessment: z.string().min(1).nullable().default(null),
  prereqs: z.array(z.string().min(1)).default([]),
  assets: z.array(z.string().min(1)).default([]),
});

export const moduleFrontmatterSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int().nonnegative(),
  summary: z.string().min(1),
  icon: z.string().min(1),
});

export const conceptSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  tests: z.array(z.string().min(1)).min(1),
  required: z.boolean().default(true),
});

export const passRuleSchema = z.union([
  z.literal(PASS_RULE_ALL_REQUIRED),
  z.object({ minPercent: z.number().int().min(1).max(100) }),
]);

export const assessmentMetaSchema = z.object({
  id: z.string().min(1),
  // Which in-browser engine runs this exercise. 'sandpack' is the only one
  // implemented today; the field is the seam for future runners (e.g. a
  // WebContainer runtime for server frameworks).
  runner: z.string().min(1).default('sandpack'),
  template: z.string().min(1).default('react'),
  entry: z.string().min(1),
  passRule: passRuleSchema.default(PASS_RULE_ALL_REQUIRED),
  visibleFiles: z.array(z.string()).default([]),
  readOnlyFiles: z.array(z.string()).default([]),
  // Extra npm dependencies the sandbox should install (name → version range).
  dependencies: z.record(z.string()).default({}),
  concepts: z.array(conceptSchema).min(1),
});

export type ChapterFrontmatter = z.infer<typeof chapterFrontmatterSchema>;
export type ModuleFrontmatter = z.infer<typeof moduleFrontmatterSchema>;
export type Concept = z.infer<typeof conceptSchema>;
export type PassRule = z.infer<typeof passRuleSchema>;
export type AssessmentMeta = z.infer<typeof assessmentMetaSchema>;
