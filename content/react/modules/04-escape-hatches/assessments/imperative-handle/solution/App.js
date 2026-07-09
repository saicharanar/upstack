import { useRef, useState, useImperativeHandle, forwardRef } from 'react';

const MessageBox = forwardRef(function MessageBox(props, ref) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => ({
    clear: () => setText(''),
    focus: () => inputRef.current.focus(),
  }));
  return <textarea ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} />;
});

export default function App() {
  const boxRef = useRef(null);
  return (
    <div>
      <MessageBox ref={boxRef} />
      <button onClick={() => boxRef.current && boxRef.current.clear()}>Clear</button>
      <button onClick={() => boxRef.current && boxRef.current.focus()}>Focus</button>
    </div>
  );
}
