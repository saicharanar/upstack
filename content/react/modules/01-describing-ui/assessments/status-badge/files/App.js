function StatusBadge({ online }) {
  // Return a <span> that reads "Online" when `online` is true,
  // and "Offline" when it is false.
  return null;
}

// App renders one badge for each state — do not change this part.
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
