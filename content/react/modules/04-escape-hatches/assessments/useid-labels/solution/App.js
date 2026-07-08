import { useId } from 'react';

function Field({ label, hint }) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <p>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-describedby={hintId} />
      <span id={hintId}>{hint}</span>
    </p>
  );
}

export default function App() {
  return (
    <form>
      <Field label="Email" hint="We'll never share it." />
      <Field label="Email" hint="We'll never share it." />
    </form>
  );
}
