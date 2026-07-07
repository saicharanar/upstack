function Cupcake({ guest }) {
  return <li>🧁 Cupcake for guest #{guest}</li>;
}

export default function TeaParty() {
  return (
    <ul>
      <Cupcake guest={1} />
      <Cupcake guest={2} />
      <Cupcake guest={3} />
    </ul>
  );
}
