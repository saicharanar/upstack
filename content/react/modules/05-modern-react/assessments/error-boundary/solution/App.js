import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
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
