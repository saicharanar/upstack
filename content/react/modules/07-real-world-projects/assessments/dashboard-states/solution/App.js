export function Dashboard({ request }) {
  if (request.status === 'loading') return <p>Loading…</p>;
  if (request.status === 'error') return <p>{request.error}</p>;
  if (request.users.length === 0) return <p>No users found.</p>;
  return (
    <ul>
      {request.users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

export default function App() {
  const request = {
    status: 'success',
    users: [
      { id: 1, name: 'Ada Lovelace' },
      { id: 2, name: 'Grace Hopper' },
    ],
  };
  return <Dashboard request={request} />;
}
