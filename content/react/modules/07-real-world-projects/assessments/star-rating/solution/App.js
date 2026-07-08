import { useState } from 'react';

export default function StarRating() {
  const total = 5;
  const [rating, setRating] = useState(0);

  return (
    <div>
      <div>
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
          <button key={n} onClick={() => setRating(n)}>
            {n <= rating ? '★' : '☆'}
          </button>
        ))}
      </div>
      <p>
        {rating} / {total}
      </p>
    </div>
  );
}
