import { act } from 'react';
import { createRoot } from 'react-dom/client';
import ProjectGrid from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const PROJECTS = ['Portfolio', 'Dashboard', 'Storefront', 'Blog'];

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<ProjectGrid />));
  return container;
}

describe('Animated project grid', () => {
  test('renders one card per project', () => {
    const container = setup();
    expect(container.querySelectorAll('article').length).toBe(PROJECTS.length);
  });

  test('shows every project name', () => {
    const container = setup();
    for (const name of PROJECTS) {
      expect(container.textContent).toContain(name);
    }
  });
});
