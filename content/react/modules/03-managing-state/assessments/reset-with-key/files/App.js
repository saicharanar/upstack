import { useState } from 'react';

// Editor keeps its own text in state — don't change this component.
function Editor() {
  const [note, setNote] = useState('');
  return <input aria-label="Note" value={note} onChange={(e) => setNote(e.target.value)} />;
}

export default function App() {
  const [user, setUser] = useState('Ada');

  // Make the <Editor /> RESET (clear its text) whenever the user changes —
  // without editing Editor itself.
  return (
    <div>
      <button onClick={() => setUser(user === 'Ada' ? 'Grace' : 'Ada')}>
        Switch user (now {user})
      </button>
      <p>Notes for {user}</p>
      <Editor />
    </div>
  );
}
