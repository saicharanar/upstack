import { useState } from 'react';

function Editor() {
  const [note, setNote] = useState('');
  return <input aria-label="Note" value={note} onChange={(e) => setNote(e.target.value)} />;
}

export default function App() {
  const [user, setUser] = useState('Ada');

  return (
    <div>
      <button onClick={() => setUser(user === 'Ada' ? 'Grace' : 'Ada')}>
        Switch user (now {user})
      </button>
      <p>Notes for {user}</p>
      <Editor key={user} />
    </div>
  );
}
