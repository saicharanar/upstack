const items = [
  { id: 1, label: 'Apple' },
  { id: 2, label: 'Banana' },
];

export default function Menu({ onPick = () => {} }) {
  // Wire each button so that clicking it calls onPick with that item's id.
  // Remember: pass a function to onClick — don't call it during render.
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <button>{item.label}</button>
        </li>
      ))}
    </ul>
  );
}
