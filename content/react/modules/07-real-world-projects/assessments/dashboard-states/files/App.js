export function Dashboard({ request }) {
  // `request` is one of these shapes — render the right UI for each:
  //   { status: 'loading' }                   -> a <p> containing "Loading"
  //   { status: 'error', error: '...' }       -> a <p> containing the error message
  //   { status: 'success', users: [] }        -> a <p> containing "No users"
  //   { status: 'success', users: [ ... ] }   -> a <ul> with one <li> per user's name
  return null;
}

// Renders a live preview of the success state — no need to change this.
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
