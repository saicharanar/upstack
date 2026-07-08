import { useState } from 'react';

export default function Stepper() {
  const [count, setCount] = useState(0);

  function addThree() {
    setCount((c) => c + 1);
    setCount((c) => c + 1);
    setCount((c) => c + 1);
  }

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={addThree}>+3</button>
    </div>
  );
}
