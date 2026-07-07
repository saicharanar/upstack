export function fullName({ first, last }) {
  return `${first} ${last}`;
}

export function topScores(scores) {
  return scores.filter((score) => score > 50).sort((a, b) => b - a);
}

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
