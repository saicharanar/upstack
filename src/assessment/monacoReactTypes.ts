export const ASSESSMENT_REACT_TYPES = `
declare namespace JSX {
  type Element = any;
  interface IntrinsicElements {
    [elementName: string]: any;
  }
}

declare module 'react' {
  export type ReactNode = JSX.Element | string | number | boolean | null | undefined;
  export type SetStateAction<State> = State | ((previous: State) => State);
  export type Dispatch<Action> = (value: Action) => void;
  export type RefObject<Value> = { current: Value | null };
  export type MutableRefObject<Value> = { current: Value };
  export type DependencyList = readonly unknown[];
  export type ComponentType<Props = {}> = (props: Props) => ReactNode;
  export type FormEvent<Target = Element> = Event & { currentTarget: Target };
  export type ChangeEvent<Target = Element> = Event & { currentTarget: Target; target: Target };
  export type MouseEvent<Target = Element> = Event & { currentTarget: Target };

  export interface Context<Value> {
    Provider: ComponentType<{ value: Value; children?: ReactNode }>;
  }

  export function createContext<Value>(defaultValue: Value): Context<Value>;
  export function useState<State>(initial: State | (() => State)): [State, Dispatch<SetStateAction<State>>];
  export function useReducer<State, Action>(reducer: (state: State, action: Action) => State, initial: State): [State, Dispatch<Action>];
  export function useContext<Value>(context: Context<Value>): Value;
  export function useEffect(effect: () => void | (() => void), dependencies?: DependencyList): void;
  export function useLayoutEffect(effect: () => void | (() => void), dependencies?: DependencyList): void;
  export function useMemo<Value>(factory: () => Value, dependencies: DependencyList): Value;
  export function useCallback<Callback extends (...args: any[]) => any>(callback: Callback, dependencies: DependencyList): Callback;
  export function useRef<Value>(initial: Value): MutableRefObject<Value>;
  export function useRef<Value>(initial: Value | null): RefObject<Value>;
  export function useId(): string;
  export function useTransition(): [boolean, (callback: () => void) => void];
  export function useDeferredValue<Value>(value: Value): Value;
  export function useSyncExternalStore<Value>(subscribe: (notify: () => void) => () => void, getSnapshot: () => Value): Value;
  export function useImperativeHandle<Value, Handle extends Value>(ref: RefObject<Value> | null, create: () => Handle, dependencies?: DependencyList): void;
  export function memo<Props>(component: ComponentType<Props>): ComponentType<Props>;
  export function forwardRef<RefValue, Props = {}>(render: (props: Props, ref: RefObject<RefValue> | null) => ReactNode): ComponentType<Props>;
  export const Fragment: ComponentType<{ children?: ReactNode }>;

  const React: {
    Fragment: typeof Fragment;
    createContext: typeof createContext;
    memo: typeof memo;
    forwardRef: typeof forwardRef;
  };
  export default React;
}

declare module 'react/jsx-runtime' {
  export function jsx(type: unknown, props: unknown, key?: unknown): JSX.Element;
  export function jsxs(type: unknown, props: unknown, key?: unknown): JSX.Element;
  export const Fragment: unknown;
}

declare module 'react-dom/client' {
  import type { ReactNode } from 'react';
  export interface Root {
    render(children: ReactNode): void;
    unmount(): void;
  }
  export function createRoot(container: Element | DocumentFragment): Root;
}
`;
