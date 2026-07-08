// Two small functions to warm up. Make each one return the right value.

export function fullName(user) {
  // Given a user with `first` and `last`, return their full name as
  // "First Last" (a single space between the two).
  return '';
}

export function topScores(scores) {
  // Return the scores greater than 50, ordered from highest to lowest.
  return [];
}

// A small live preview of your functions — no need to change this.
export default function Preview() {
  const user = { first: 'Ada', last: 'Lovelace' };
  const scores = [42, 88, 51, 30, 95];
  return (
    <div>
      <p>Full name: {fullName(user)}</p>
      <p>Top scores: {topScores(scores).join(', ')}</p>
    </div>
  );
}
