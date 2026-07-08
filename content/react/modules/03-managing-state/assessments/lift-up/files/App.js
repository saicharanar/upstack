import { useState } from 'react';

function AddButton({ onAdd }) {
  return <button onClick={onAdd}>Add star</button>;
}

function StarCount({ count }) {
  return <p>Stars: {count}</p>;
}

export default function StarBoard() {
  // Both children need to share one star count. Make clicking the button
  // increase the count, and make <StarCount /> display the current value.
  return (
    <div>
      <AddButton onAdd={() => {}} />
      <StarCount count={0} />
    </div>
  );
}
