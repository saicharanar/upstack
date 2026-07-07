import { useState } from 'react';

export default function Profile() {
  const [user, setUser] = useState({ name: 'Ada Lovelace', role: 'member' });
  return (
    <div>
      <p>
        {user.name} — {user.role}
      </p>
      <button onClick={() => setUser({ ...user, role: 'admin' })}>Promote</button>
    </div>
  );
}
