'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface EditorSurfaceBoundaryProps {
  readonly children: ReactNode;
  readonly fallback: ReactNode;
  readonly onFailure: (error: Error) => void;
}

interface EditorSurfaceBoundaryState {
  readonly hasFailed: boolean;
}

export class EditorSurfaceBoundary extends Component<
  EditorSurfaceBoundaryProps,
  EditorSurfaceBoundaryState
> {
  override state: EditorSurfaceBoundaryState = { hasFailed: false };

  static getDerivedStateFromError(): EditorSurfaceBoundaryState {
    return { hasFailed: true };
  }

  override componentDidCatch(error: Error, _info: ErrorInfo): void {
    this.props.onFailure(error);
  }

  override render(): ReactNode {
    return this.state.hasFailed ? this.props.fallback : this.props.children;
  }
}
