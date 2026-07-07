function Avatar({ name, size }) {
  return (
    <>
      <img src="https://i.imgur.com/MK3eW3As.jpg" alt={name} width={size} height={size} />
      <figcaption>{name}</figcaption>
    </>
  );
}

export default function App() {
  return (
    <figure className="avatar">
      <Avatar name="Ada Lovelace" size={64} />
    </figure>
  );
}
