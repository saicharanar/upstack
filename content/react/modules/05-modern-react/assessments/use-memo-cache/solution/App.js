import { useState, useMemo } from 'react';

export const stats = { runs: 0 };

function expensiveDouble(n) {
  stats.runs += 1;
  return n * 2;
}

export default function App() {
  const [n, setN] = useState(2);
  const [tick, setTick] = useState(0);

  const doubled = useMemo(() => expensiveDouble(n), [n]);

  return (
    <div>
      <p>Doubled: {doubled}</p>
      <button onClick={() => setN(n + 1)}>n + 1</button>
      <button onClick={() => setTick(tick + 1)}>unrelated ({tick})</button>
    </div>
  );
}
