import { useState } from 'react';

export default function NameForm() {
  const [first, setFirst] = useState('Ada');
  const [last, setLast] = useState('Lovelace');

  // Show the full name as "First Last". Don't add it to state — derive it from
  // `first` and `last` during render, so it can never fall out of sync.
  return (
    <div>
      <input aria-label="First" value={first} onChange={(e) => setFirst(e.target.value)} />
      <input aria-label="Last" value={last} onChange={(e) => setLast(e.target.value)} />
      <p>Full name: </p>
    </div>
  );
}
