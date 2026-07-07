function Avatar({ name, size }) {
  // Read the `name` and `size` props:
  //   1. Render an <img> with alt={name} and width={size} and height={size}.
  //      (Any src works, e.g. "https://i.imgur.com/MK3eW3As.jpg".)
  //   2. Render a <figcaption> showing the name.
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
