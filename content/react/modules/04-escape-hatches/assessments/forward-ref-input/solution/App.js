import { useRef, forwardRef } from 'react';

const FancyInput = forwardRef(function FancyInput(props, ref) {
  return <input ref={ref} className="fancy" placeholder="Type here" />;
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
