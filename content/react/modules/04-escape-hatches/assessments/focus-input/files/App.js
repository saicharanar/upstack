import { useRef } from 'react';

export default function Form() {
  // 1. Create a ref with useRef(null).
  // 2. Attach it to the <input> via ref={...}.
  // 3. When the button is clicked, focus the input: ref.current.focus().
  const inputRef = useRef(null);
  return (
    <div>
      <input placeholder="Your name" />
      <button>Focus the input</button>
    </div>
  );
}
