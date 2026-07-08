function Avatar({ name, size }) {
  // Render an <img> whose alt text is the name and whose width and height
  // both equal the size (any src works). Then render a <figcaption> that
  // shows the name.
  return null;
}

// App passes the props — do not change this part.
export default function App() {
  return (
    <figure className="avatar">
      <Avatar name="Ada Lovelace" size={64} />
    </figure>
  );
}
