import { useState, useEffect } from 'react';

export default function Ticker() {
  const [count, setCount] = useState(0);

  // Keep the browser tab's title in sync with the count: it should read
  // "Count: <count>" on first render and update whenever the count changes.

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
