import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Dashboard } from './App';

function render(request) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  flushSync(() => root.render(<Dashboard request={request} />));
  return container;
}

describe('Data dashboard states', () => {
  test('shows a loading message while loading', () => {
    const container = render({ status: 'loading' });
    expect(container.textContent).toContain('Loading');
  });

  test('shows the error message on failure', () => {
    const container = render({ status: 'error', error: 'Network request failed' });
    expect(container.textContent).toContain('Network request failed');
  });

  test('shows an empty message when there are no users', () => {
    const container = render({ status: 'success', users: [] });
    expect(container.textContent).toContain('No users');
  });

  test('lists the users on success', () => {
    const container = render({
      status: 'success',
      users: [
        { id: 1, name: 'Ada Lovelace' },
        { id: 2, name: 'Grace Hopper' },
      ],
    });
    expect(container.querySelectorAll('li').length).toBe(2);
    expect(container.textContent).toContain('Ada Lovelace');
    expect(container.textContent).toContain('Grace Hopper');
  });
});
