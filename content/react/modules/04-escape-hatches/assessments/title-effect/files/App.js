import { useState, useEffect } from 'react';

export default function Ticker() {
  const [count, setCount] = useState(0);

  // Add an Effect that syncs the document title to "Count: <count>",
  // both on first render and whenever count changes.
  // (useEffect(() => { ... }, [count]))

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
