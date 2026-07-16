// @vitest-environment jsdom

import { act, createElement, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorSurfaceBoundary } from '@/assessment/EditorSurfaceBoundary';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function BrokenSurface(): ReactNode {
  throw new Error('surface failed');
}

describe('editor surface failure boundary', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('reports a render failure and displays the recovery content', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    const onFailure = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await act(async () => {
      root.render(
        createElement(
          EditorSurfaceBoundary,
          {
            children: createElement(BrokenSurface),
            fallback: createElement('p', null, 'Loading backup editor…'),
            onFailure,
          },
        ),
      );
    });

    expect(onFailure).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'surface failed' }),
    );
    expect(container.textContent).toContain('Loading backup editor…');

    await act(async () => root.unmount());
    consoleError.mockRestore();
  });
});
