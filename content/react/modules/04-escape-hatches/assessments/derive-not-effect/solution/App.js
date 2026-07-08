import { useState } from 'react';

const FRUITS = ['apple', 'banana', 'cherry', 'date', 'grape'];

export default function FruitSearch() {
  const [query, setQuery] = useState('');

  const results = FRUITS.filter((fruit) => fruit.includes(query));

  return (
    <div>
      <input aria-label="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>
        {results.map((fruit) => (
          <li key={fruit}>{fruit}</li>
        ))}
      </ul>
    </div>
  );
}
