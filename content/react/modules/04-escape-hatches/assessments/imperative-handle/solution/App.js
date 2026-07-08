import { useRef, useState, useImperativeHandle, forwardRef } from 'react';

const MessageBox = forwardRef(function MessageBox(props, ref) {
  const [text, setText] = useState('');
  useImperativeHandle(ref, () => ({
    clear: () => setText(''),
  }));
  return <textarea value={text} onChange={(e) => setText(e.target.value)} />;
});

export default function App() {
  const boxRef = useRef(null);
  return (
    <div>
      <MessageBox ref={boxRef} />
      <button onClick={() => boxRef.current && boxRef.current.clear()}>Clear</button>
    </div>
  );
}
