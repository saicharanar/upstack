import { useState } from 'react';

function AddButton({ onAdd }) {
  return <button onClick={onAdd}>Add star</button>;
}

function StarCount({ count }) {
  return <p>Stars: {count}</p>;
}

export default function StarBoard() {
  // Lift the shared state UP into this parent so both children see it:
  //   1. Hold the star count in state here.
  //   2. Pass an `onAdd` handler to <AddButton /> that increments it.
  //   3. Pass the current count to <StarCount />.
  return (
    <div>
      <AddButton onAdd={() => {}} />
      <StarCount count={0} />
    </div>
  );
}
