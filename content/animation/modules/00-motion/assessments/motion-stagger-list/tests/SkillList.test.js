import { act } from 'react';
import { createRoot } from 'react-dom/client';
import SkillList from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const SKILLS = ['JSX', 'Props', 'State', 'Effects', 'Hooks'];

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<SkillList />));
  return container;
}

describe('Staggered skill list', () => {
  test('renders one list item per skill', () => {
    const container = setup();
    expect(container.querySelectorAll('li').length).toBe(SKILLS.length);
  });

  test('shows every skill', () => {
    const container = setup();
    for (const skill of SKILLS) {
      expect(container.textContent).toContain(skill);
    }
  });
});
