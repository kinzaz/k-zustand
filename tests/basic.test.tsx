import { act, fireEvent, render } from "@testing-library/react";
import { create, StoreApi } from "k-zustand";
import type { ReactNode } from "react";
import React, {
  Component as ClassComponent,
  StrictMode,
  useEffect,
} from "react";
import { expect, it, vi } from "vitest";

it("creates a store hook and api object", () => {
  let params;

  const result = create((...args) => {
    params = args;
    return { value: null };
  });

  expect({ params, result }).toMatchInlineSnapshot(`
    {
      "params": [
        [Function],
      ],
      "result": [Function],
    }
  `);
});

type CounterState = {
  count: number;
  inc: () => void;
};

it("uses the store with no args", async () => {
  const useBoundStore = create<CounterState>((set) => ({
    count: 0,
    inc: () => set((state) => ({ count: state.count + 1 })),
  }));

  function Counter() {
    const { count, inc } = useBoundStore();
    useEffect(inc, [inc]);
    return <div>count: {count}</div>;
  }

  const { findByText } = render(
    <>
      <Counter />
    </>
  );

  await findByText("count: 1");
});

it("uses the store with selectors", async () => {
  const useBoundStore = create<CounterState>((set) => ({
    count: 0,
    inc: () => set((state) => ({ count: state.count + 1 })),
  }));

  function Counter() {
    const count = useBoundStore((s) => s.count);
    const inc = useBoundStore((s) => s.inc);
    useEffect(inc, [inc]);
    return <div>count: {count}</div>;
  }

  const { findByText } = render(
    <>
      <Counter />
    </>
  );

  await findByText("count: 1");
});

it("only re-renders if selected state has changed", async () => {
  const useBoundStore = create<CounterState>((set) => ({
    count: 0,
    inc: () => set((state) => ({ count: state.count + 1 })),
  }));
  let counterRenderCount = 0;
  let controlRenderCount = 0;

  function Counter() {
    const count = useBoundStore((state) => state.count);
    counterRenderCount++;
    return <div>count: {count}</div>;
  }

  function Control() {
    const inc = useBoundStore((state) => state.inc);
    controlRenderCount++;
    return <button onClick={inc}>button</button>;
  }

  const { getByText, findByText } = render(
    <>
      <Counter />
      <Control />
    </>
  );

  fireEvent.click(getByText("button"));

  await findByText("count: 1");

  expect(counterRenderCount).toBe(2);
  expect(controlRenderCount).toBe(1);
});

it("can batch updates", async () => {
  const useBoundStore = create<CounterState>((set) => ({
    count: 0,
    inc: () => set((state) => ({ count: state.count + 1 })),
  }));

  function Counter() {
    const { count, inc } = useBoundStore();
    useEffect(() => {
      inc();
      inc();
    }, [inc]);
    return <div>count: {count}</div>;
  }

  const { findByText } = render(
    <>
      <Counter />
    </>
  );

  await findByText("count: 2");
});

it("can update the selector", async () => {
  type State = { one: string; two: string };
  type Props = { selector: (state: State) => string };
  const useBoundStore = create<State>(() => ({
    one: "one",
    two: "two",
  }));

  function Component({ selector }: Props) {
    return <div>{useBoundStore(selector)}</div>;
  }

  const { findByText, rerender } = render(
    <StrictMode>
      <Component selector={(s) => s.one} />
    </StrictMode>
  );
  await findByText("one");

  rerender(
    <StrictMode>
      <Component selector={(s) => s.two} />
    </StrictMode>
  );
  await findByText("two");
});

it("can throw an error in selector", async () => {
  console.error = vi.fn();
  type State = { value: string | number };

  const initialState: State = { value: "foo" };
  const useBoundStore = create<State>(() => initialState);
  const { setState } = useBoundStore;
  const selector = (s: State) =>
    // @ts-expect-error This function is supposed to throw an error
    s.value.toUpperCase();

  class ErrorBoundary extends ClassComponent<
    { children?: ReactNode | undefined },
    { hasError: boolean }
  > {
    constructor(props: { children?: ReactNode | undefined }) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    render() {
      return this.state.hasError ? <div>errored</div> : this.props.children;
    }
  }

  function Component() {
    useBoundStore(selector);
    return <div>no error</div>;
  }

  const { findByText } = render(
    <StrictMode>
      <ErrorBoundary>
        <Component />
      </ErrorBoundary>
    </StrictMode>
  );
  await findByText("no error");

  act(() => {
    setState({ value: 123 });
  });
  await findByText("errored");
});

it("can get the store", () => {
  type State = {
    value: number;
    getState: () => State;
  };
  const { getState } = create<State>(() => ({
    value: 1,
    getState: (): State => getState(),
  }));

  expect(getState().getState().value).toBe(1);
});

it("can set the store", () => {
  type State = {
    value: number;
    setState1: StoreApi<State>["setState"];
    setState2: StoreApi<State>["setState"];
  };

  const { setState, getState } = create<State>((set) => ({
    value: 1,
    setState1: (v) => set(v),
    setState2: (v) => setState(v),
  }));

  getState().setState1({ value: 2 });
  expect(getState().value).toBe(2);
  getState().setState2({ value: 3 });
  expect(getState().value).toBe(3);
  getState().setState1((s) => ({ value: ++s.value }));
  expect(getState().value).toBe(4);
  getState().setState2((s) => ({ value: ++s.value }));
  expect(getState().value).toBe(5);
});
