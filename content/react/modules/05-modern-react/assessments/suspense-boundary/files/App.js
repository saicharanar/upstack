import { Suspense } from 'react';

// Reading this data "suspends" the component until the data is ready — and for
// this exercise it stays pending, so you can see your loading fallback.
const pending = new Promise(() => {});

function Message() {
  throw pending; // signals "not ready yet"
}

export default function App() {
  // Wrap <Message /> in a <Suspense> boundary whose fallback is <p>Loading…</p>,
  // so the page shows "Loading…" (and the heading stays visible) instead of crashing.
  return (
    <div>
      <h1>Profile</h1>
      <Message />
    </div>
  );
}
