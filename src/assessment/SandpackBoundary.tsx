'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface SandpackBoundaryProps {
  readonly children: ReactNode;
  readonly onRetry?: () => void;
  readonly preservesDraft?: boolean;
}

interface SandpackBoundaryState {
  readonly hasError: boolean;
}

/**
 * The in-browser code sandbox (Sandpack + its CDN bundler) occasionally throws
 * during render — a transient bundler race, a stale cached chunk, or a malformed
 * test payload. Without a boundary such a throw unmounts the whole React tree and
 * the page goes blank. This catches render-time crashes from the sandbox and
 * shows a recoverable panel instead, so the rest of the app stays alive.
 *
 * Note: this only catches errors thrown during React render/lifecycle. Errors in
 * async callbacks (e.g. the SandpackTests onComplete handler) are guarded
 * separately at their call site.
 */
export class SandpackBoundary extends Component<SandpackBoundaryProps, SandpackBoundaryState> {
  override state: SandpackBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SandpackBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Sandbox crashed during render', error, info.componentStack);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      const body = this.props.preservesDraft
        ? 'The preview runtime stopped, but your code is safe. Restart the preview to run the last valid version again.'
        : 'This is almost always a one-off while the code sandbox loads. Reloading fetches a fresh copy and usually clears it.';
      return (
        <div className="sandbox-error" role="alert">
          <p className="sandbox-error__title">The interactive sandbox hit a snag.</p>
          <p className="sandbox-error__body">
            {body}
          </p>
          <button
            type="button"
            className="sandbox-error__button"
            onClick={() => {
              if (this.props.onRetry) {
                this.props.onRetry();
                return;
              }
              window.location.reload();
            }}
          >
            {this.props.onRetry ? 'Restart preview' : 'Reload'}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default SandpackBoundary;
