import { useReducer } from 'react';

function reducer(state, action) {
  // Return the next state for each action.type:
  //   - 'increment': one more than the current count
  //   - 'reset': back to zero
  //   - anything else: the state unchanged
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
