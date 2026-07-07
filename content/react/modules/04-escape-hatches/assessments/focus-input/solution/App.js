import { useRef } from 'react';

export default function Form() {
  const inputRef = useRef(null);
  return (
    <div>
      <input ref={inputRef} placeholder="Your name" />
      <button onClick={() => inputRef.current.focus()}>Focus the input</button>
    </div>
  );
}
