function StatusBadge({ online }) {
  return <span className={online ? 'badge badge--on' : 'badge badge--off'}>{online ? 'Online' : 'Offline'}</span>;
}

export default function App() {
  return (
    <ul>
      <li>
        <StatusBadge online={true} />
      </li>
      <li>
        <StatusBadge online={false} />
      </li>
    </ul>
  );
}
