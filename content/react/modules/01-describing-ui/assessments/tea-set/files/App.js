function Cupcake({ guest }) {
  // Return an <li> that reads "Cupcake for guest #<guest>", using only the
  // `guest` prop (guest 1 -> "Cupcake for guest #1").
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
