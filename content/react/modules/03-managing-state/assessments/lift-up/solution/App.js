import { useState } from 'react';

function AddButton({ onAdd }) {
  return <button onClick={onAdd}>Add star</button>;
}

function StarCount({ count }) {
  return <p>Stars: {count}</p>;
}

export default function StarBoard() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <AddButton onAdd={() => setCount(count + 1)} />
      <StarCount count={count} />
    </div>
  );
}
