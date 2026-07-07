import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function DeepLabel() {
  const theme = useContext(ThemeContext);
  return <p>Theme: {theme}</p>;
}

export default function App() {
  return (
    <ThemeContext.Provider value="dark">
      <section>
        <DeepLabel />
      </section>
    </ThemeContext.Provider>
  );
}
