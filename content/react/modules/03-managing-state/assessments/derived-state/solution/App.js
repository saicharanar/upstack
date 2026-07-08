import { useState } from 'react';

export default function NameForm() {
  const [first, setFirst] = useState('Ada');
  const [last, setLast] = useState('Lovelace');

  return (
    <div>
      <input aria-label="First" value={first} onChange={(e) => setFirst(e.target.value)} />
      <input aria-label="Last" value={last} onChange={(e) => setLast(e.target.value)} />
      <p>Full name: {first} {last}</p>
    </div>
  );
}
