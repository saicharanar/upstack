import { useState } from 'react';

const FRUITS = ['apple', 'banana', 'cherry', 'date', 'grape'];

export default function FruitSearch() {
  const [query, setQuery] = useState('');

  // Show only the fruits whose name contains the query. Compute this list
  // during render from `query` — you don't need extra state or an Effect.
  const results = FRUITS;

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
