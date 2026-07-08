import { useState } from 'react';

// The test watches how many times the expensive calculation runs.
export const stats = { runs: 0 };

function expensiveDouble(n) {
  stats.runs += 1;
  return n * 2;
}

export default function App() {
  const [n, setN] = useState(2);
  const [tick, setTick] = useState(0);

  // Cache this calculation so it only runs again when `n` changes — NOT when the
  // unrelated `tick` button re-renders the component.
  const doubled = expensiveDouble(n);

  return (
    <div>
      <p>Doubled: {doubled}</p>
      <button onClick={() => setN(n + 1)}>n + 1</button>
      <button onClick={() => setTick(tick + 1)}>unrelated ({tick})</button>
    </div>
  );
}
