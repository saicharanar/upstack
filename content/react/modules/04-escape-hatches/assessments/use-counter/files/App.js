import { useState } from 'react';

// Turn this into a real custom Hook: it must return { count, increment },
// where `count` is the current number and calling `increment` adds 1.
export function useCounter(initial = 0) {
  return { count: 0, increment: () => {} };
}

// This component consumes the hook — no need to change it.
export default function Counter() {
  const { count, increment } = useCounter(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}
