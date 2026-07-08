import { useState, memo } from 'react';

export const stats = { childRenders: 0 };

const Row = memo(function Row({ label }) {
  stats.childRenders += 1;
  return <li>{label}</li>;
});

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
