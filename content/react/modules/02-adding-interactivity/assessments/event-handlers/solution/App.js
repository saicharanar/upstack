const items = [
  { id: 1, label: 'Apple' },
  { id: 2, label: 'Banana' },
];

export default function Menu({ onPick = () => {} }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <button onClick={() => onPick(item.id)}>{item.label}</button>
        </li>
      ))}
    </ul>
  );
}
