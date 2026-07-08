import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import App from './App';

function mountApp() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  flushSync(() => root.render(<App />));
  return container;
}

describe('Accessible form fields', () => {
  test('connects each label to its own input', () => {
    const container = mountApp();
    const labels = [...container.querySelectorAll('label')];
    const inputs = [...container.querySelectorAll('input')];
    expect(labels.length).toBe(2);

    for (const label of labels) {
      const forId = label.getAttribute('for');
      expect(forId).toBeTruthy();
      expect(inputs.some((input) => input.id === forId)).toBe(true);
    }
  });

  test('points each input at its hint text for screen readers', () => {
    const container = mountApp();
    const inputs = [...container.querySelectorAll('input')];
    const hints = [...container.querySelectorAll('span')];

    for (const input of inputs) {
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      const hint = hints.find((node) => node.id === describedBy);
      expect(hint).toBeTruthy();
      expect(hint.textContent).toContain('never share');
    }
  });

  test('gives the two fields different ids', () => {
    const container = mountApp();
    const [first, second] = container.querySelectorAll('input');
    expect(first.id).toBeTruthy();
    expect(second.id).toBeTruthy();
    expect(first.id).not.toBe(second.id);
  });
});
