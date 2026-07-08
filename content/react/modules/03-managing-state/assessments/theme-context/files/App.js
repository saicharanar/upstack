import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function DeepLabel() {
  // Show the current theme here as "Theme: <theme>", reading the value from
  // ThemeContext rather than receiving it as a prop.
  return <p>Theme: ?</p>;
}

export default function App() {
  // Make the theme "dark" available to everything in this tree, then render
  // <DeepLabel /> somewhere inside it (a few levels deep is fine).
  return (
    <div>
      <section>
        <DeepLabel />
      </section>
    </div>
  );
}
