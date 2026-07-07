function Cupcake({ guest }) {
  // A pure component computes its output only from its props — no shared
  // variables, no mutation. Return an <li> reading: "Cupcake for guest #<guest>".
  return null;
}

// The party sets out a cupcake for three guests — do not change this part.
export default function TeaParty() {
  return (
    <ul>
      <Cupcake guest={1} />
      <Cupcake guest={2} />
      <Cupcake guest={3} />
    </ul>
  );
}
