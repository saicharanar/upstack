import { useReducer, createContext, useContext } from 'react';

const CountContext = createContext(null);
const DispatchContext = createContext(null);

function reducer(count, action) {
  if (action.type === 'increment') return count + 1;
  return count;
}

// These nested components read from context — don't change them.
function CountLabel() {
  const count = useContext(CountContext);
  return <p>Count: {count}</p>;
}

function AddButton() {
  const dispatch = useContext(DispatchContext);
  return <button onClick={() => dispatch({ type: 'increment' })}>Add</button>;
}

export default function App() {
  // Hold the count with useReducer here, then provide the count through
  // CountContext and the dispatch through DispatchContext, so the nested
  // <CountLabel /> shows it and the nested <AddButton /> can update it.
  return (
    <div>
      <section>
        <CountLabel />
      </section>
      <section>
        <AddButton />
      </section>
    </div>
  );
}
