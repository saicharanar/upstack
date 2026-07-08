import { useRef, forwardRef } from 'react';

// FancyInput receives a ref from its parent. Forward that ref down to the real
// <input> so the parent's button can focus it from outside.
const FancyInput = forwardRef(function FancyInput(props, ref) {
  return <input className="fancy" placeholder="Type here" />;
});

export default function Form() {
  const inputRef = useRef(null);
  return (
    <div>
      <FancyInput ref={inputRef} />
      <button onClick={() => inputRef.current && inputRef.current.focus()}>Focus</button>
    </div>
  );
}
