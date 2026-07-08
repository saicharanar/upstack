import { useReducer, createContext, useContext } from 'react';

const CountContext = createContext(null);
const DispatchContext = createContext(null);

function reducer(count, action) {
  if (action.type === 'increment') return count + 1;
  return count;
}

function CountLabel() {
  const count = useContext(CountContext);
  return <p>Count: {count}</p>;
}

function AddButton() {
  const dispatch = useContext(DispatchContext);
  return <button onClick={() => dispatch({ type: 'increment' })}>Add</button>;
}

export default function App() {
  const [count, dispatch] = useReducer(reducer, 0);
  return (
    <CountContext.Provider value={count}>
      <DispatchContext.Provider value={dispatch}>
        <div>
          <section>
            <CountLabel />
          </section>
          <section>
            <AddButton />
          </section>
        </div>
      </DispatchContext.Provider>
    </CountContext.Provider>
  );
}
