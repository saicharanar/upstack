import { useState } from 'react';

export default function Stepper() {
  // Make the button add 3 to the count in a SINGLE click.
  //
  // The catch: you must call the setter THREE times, and they must stack.
  // setCount(count + 1) three times only adds 1 (all three read the same stale
  // `count`). Use the updater form so each call builds on the last:
  //   setCount(c => c + 1);  // ×3
  //
  // Show the current count in the button label.
  const [count, setCount] = useState(0);
  return <button>+3 (now {count})</button>;
}
