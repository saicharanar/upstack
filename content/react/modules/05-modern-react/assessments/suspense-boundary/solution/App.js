import { Suspense } from 'react';

const pending = new Promise(() => {});

function Message() {
  throw pending;
}

export default function App() {
  return (
    <div>
      <h1>Profile</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <Message />
      </Suspense>
    </div>
  );
}
