import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false };

  // Finish this boundary so that when a child throws while rendering, it shows
  // `this.props.fallback` instead of letting the error crash the whole app:
  //   - add the static getDerivedStateFromError lifecycle to switch to the error state
  //   - in render(), show the fallback when in the error state

  render() {
    return this.props.children;
  }
}

function Boom() {
  throw new Error('kaboom');
}

export default function App() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ErrorBoundary fallback={<p>Something went wrong.</p>}>
        <Boom />
      </ErrorBoundary>
    </div>
  );
}
