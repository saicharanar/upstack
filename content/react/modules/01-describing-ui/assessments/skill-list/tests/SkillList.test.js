import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import SkillList from './App';

const EXPECTED_SKILLS = ['JSX', 'Props', 'Conditional rendering', 'Lists'];

function mountList() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  flushSync(() => root.render(<SkillList />));
  return container;
}

describe('Skill list', () => {
  test('renders one list item per skill', () => {
    const container = mountList();
    expect(container.querySelectorAll('li').length).toBe(EXPECTED_SKILLS.length);
  });

  test('shows every skill name', () => {
    const container = mountList();
    for (const skill of EXPECTED_SKILLS) {
      expect(container.textContent).toContain(skill);
    }
  });
});
