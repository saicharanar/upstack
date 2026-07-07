'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, type ReactNode } from 'react';
import {
  computeChapterStates,
  type NavChapter,
  type NavChapterState,
  type NavModel,
} from '@/content-layer/nav';
import { useProgressState } from '@/progress/ProgressProvider';
import { ProgressBadge } from './ProgressBadge';

function countCompleted(states: Readonly<Record<string, NavChapterState>>): number {
  return Object.values(states).filter((state) => state === 'completed').length;
}

function ChapterLink({
  chapter,
  state,
  active,
}: {
  chapter: NavChapter;
  state: NavChapterState;
  active: boolean;
}): ReactNode {
  return (
    <Link
      className="sidebar__chapter"
      data-state={state}
      data-active={active}
      href={chapter.href}
      aria-current={active ? 'page' : undefined}
    >
      <ProgressBadge state={state} />
      <span className="sidebar__chapter-title">{chapter.title}</span>
    </Link>
  );
}

export function Sidebar({ model }: { model: NavModel }): ReactNode {
  const progress = useProgressState();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const states = useMemo(() => computeChapterStates(model, progress), [model, progress]);
  const completed = countCompleted(states);
  const total = model.order.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const activeModuleId = useMemo(() => {
    const owning = model.modules.find((module) =>
      module.chapters.some((chapter) => chapter.href === pathname),
    );
    return owning?.moduleId ?? model.modules[0]?.moduleId;
  }, [model, pathname]);

  // Per-module collapse. Default: only the module holding the active chapter is
  // open. An explicit toggle overrides that default for that module.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const isModuleOpen = (moduleId: string): boolean => overrides[moduleId] ?? moduleId === activeModuleId;
  const toggleModule = (moduleId: string): void =>
    setOverrides((prev) => ({ ...prev, [moduleId]: !(prev[moduleId] ?? moduleId === activeModuleId) }));

  return (
    <nav className="sidebar" aria-label="Course chapters">
      <button
        type="button"
        className="sidebar__toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        ☰ Chapters ({completed}/{total})
      </button>

      <div className="sidebar__body" data-open={open}>
        <div className="sidebar__rail">
          <span className="sidebar__rail-label">
            {completed} / {total} chapters
          </span>
          <span className="sidebar__rail-track" aria-hidden="true">
            <span className="sidebar__rail-fill" style={{ inlineSize: `${percent}%` }} />
          </span>
        </div>

        {model.modules.map((module) => {
          const expanded = isModuleOpen(module.moduleId);
          const moduleCompleted = module.chapters.filter(
            (chapter) => states[chapter.chapterId] === 'completed',
          ).length;
          return (
            <section key={module.moduleId} className="sidebar__module">
              <button
                type="button"
                className="sidebar__module-toggle"
                aria-expanded={expanded}
                onClick={() => toggleModule(module.moduleId)}
              >
                <span className="sidebar__module-chevron" data-open={expanded} aria-hidden="true">
                  ▸
                </span>
                <span className="sidebar__module-title">
                  <span aria-hidden="true">{module.icon}</span> {module.title}
                </span>
                <span className="sidebar__module-count">
                  {moduleCompleted}/{module.chapters.length}
                </span>
              </button>
              {expanded ? (
                <ul className="sidebar__chapters">
                  {module.chapters.map((chapter) => (
                    <li key={chapter.chapterId}>
                      <ChapterLink
                        chapter={chapter}
                        state={states[chapter.chapterId] ?? 'available'}
                        active={pathname === chapter.href}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}
      </div>
    </nav>
  );
}
