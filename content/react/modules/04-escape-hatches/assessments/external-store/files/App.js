import { useSyncExternalStore } from 'react';

// A tiny store that lives OUTSIDE React. Don't change it — read from it below.
export const store = {
  count: 0,
  listeners: new Set(),
  increment() {
    store.count += 1;
    store.listeners.forEach((listener) => listener());
  },
  subscribe(listener) {
    store.listeners.add(listener);
    return () => store.listeners.delete(listener);
  },
  getSnapshot() {
    return store.count;
  },
};

export default function Counter() {
  // Read the live count from the external store so this component shows it
  // and re-renders every time the store changes.
  const count = 0;
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => store.increment()}>+1</button>
    </div>
  );
}
