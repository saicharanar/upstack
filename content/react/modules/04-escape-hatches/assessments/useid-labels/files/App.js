function Field({ label, hint }) {
  // Make this field accessible, and keep it working when it's used twice:
  //   - connect the <label> to the <input> (clicking the label focuses the input)
  //   - connect the <input> to its hint <span> via aria-describedby
  //   - the ids must be unique for each Field on the page
  return (
    <p>
      <label>{label}</label>
      <input />
      <span>{hint}</span>
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
