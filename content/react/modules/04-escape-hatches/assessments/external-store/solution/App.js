import { useSyncExternalStore } from 'react';

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
  const count = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => store.increment()}>+1</button>
    </div>
  );
}
