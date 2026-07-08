import { useState } from 'react';

// The test watches how many times Row renders.
export const stats = { childRenders: 0 };

// Make Row skip re-rendering when its `label` prop hasn't changed — so an
// unrelated parent re-render doesn't re-render it.
function Row({ label }) {
  stats.childRenders += 1;
  return <li>{label}</li>;
}

export default function App() {
  const [tick, setTick] = useState(0);
  return (
    <div>
      <button onClick={() => setTick(tick + 1)}>Re-render parent ({tick})</button>
      <ul>
        <Row label="Fixed item" />
      </ul>
    </div>
  );
}
