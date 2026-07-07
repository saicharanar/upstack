/**
 * The catalogue of tech-stack tracks shown on the home page. React is live;
 * the rest are placeholders so the home page (and the mental model) is
 * multi-stack from day one. When a new stack gets authored content under
 * `content/<id>/`, flip its status to 'available' and wire its manifest.
 */
export type StackStatus = 'available' | 'coming-soon';

export interface StackSummary {
  readonly id: string;
  readonly name: string;
  readonly tagline: string;
  readonly icon: string;
  readonly status: StackStatus;
}

export const STACKS: readonly StackSummary[] = [
  {
    id: 'react',
    name: 'React',
    tagline: 'Components, props, state, and hooks — from your first component to production patterns.',
    icon: '⚛️',
    status: 'available',
  },
  {
    id: 'go',
    name: 'Go',
    tagline: 'Goroutines, interfaces, and a batteries-included standard library — build fast, simple backend services.',
    icon: '🐹',
    status: 'coming-soon',
  },
  {
    id: 'ruby',
    name: 'Ruby',
    tagline: 'Objects, blocks, and famously expressive syntax — the language behind Rails.',
    icon: '💎',
    status: 'coming-soon',
  },
];

export const AVAILABLE_STACK_ID = 'react';
