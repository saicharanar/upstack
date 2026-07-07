// These are the modern-JS moves you'll use constantly in React.

export function fullName(user) {
  // Use destructuring and a template string to return "First Last".
  // e.g. fullName({ first: 'Ada', last: 'Lovelace' }) === 'Ada Lovelace'
  return '';
}

export function topScores(scores) {
  // Return only the scores greater than 50, sorted highest first.
  // e.g. topScores([42, 88, 51, 30, 95]) === [95, 88, 51]
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
