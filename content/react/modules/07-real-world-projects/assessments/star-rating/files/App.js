import { useState } from 'react';

export default function StarRating() {
  const total = 5;
  const [rating, setRating] = useState(0);

  // Render `total` star buttons. Clicking the Nth star sets the rating to N.
  // Show a filled star "★" for positions up to the rating and an empty "☆" for
  // the rest. Also show the rating as "N / 5".
  return (
    <div>
      {/* render the star buttons here */}
      <p>? / {total}</p>
    </div>
  );
}
