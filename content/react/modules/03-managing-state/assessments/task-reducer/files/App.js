import { useReducer } from 'react';

function reducer(state, action) {
  // Return the next state based on action.type:
  //   'increment' -> state + 1
  //   'reset'     -> 0
  // Any other action -> return state unchanged.
  return state;
}

export default function Counter() {
  const [count, dispatch] = useReducer(reducer, 0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+1</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
