import { useRef } from 'react';

export default function Form() {
  const inputRef = useRef(null);
  // Wire things up so that clicking the button moves keyboard focus to the
  // text input.
  return (
    <div>
      <input placeholder="Your name" />
      <button>Focus the input</button>
    </div>
  );
}
