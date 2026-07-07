import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function DeepLabel() {
  // Read the theme from ThemeContext with useContext and render:
  //   <p>Theme: {theme}</p>
  return <p>Theme: ?</p>;
}

export default function App() {
  // Provide the value "dark" to the whole tree with <ThemeContext.Provider>,
  // then render <DeepLabel /> somewhere inside it (a few levels deep is fine).
  return (
    <div>
      <section>
        <DeepLabel />
      </section>
    </div>
  );
}
