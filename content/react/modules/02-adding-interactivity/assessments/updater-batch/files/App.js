import { useState } from 'react';

export default function Stepper() {
  const [count, setCount] = useState(0);
  // Make a single click of the button add 3 to the count, and show the
  // current count.
  return (
    <div>
      <p>Count: {count}</p>
      <button>+3</button>
    </div>
  );
}
