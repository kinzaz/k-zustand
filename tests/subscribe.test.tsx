import { createStore } from "k-zustand/vanilla";
import { describe, expect, it, vi } from "vitest";

describe("subscribe()", () => {
  it("should not be called if new state identity is the same", () => {
    const spy = vi.fn();
    const initialState = { value: 1, other: "a" };
    const { setState, subscribe } = createStore(() => initialState);

    subscribe(spy);
    setState(initialState);
    expect(spy).not.toHaveBeenCalled();
  });

  it("should be called if new state identity is different", () => {
    const spy = vi.fn();
    const initialState = { value: 1, other: "a" };
    const { setState, getState, subscribe } = createStore(() => initialState);

    subscribe(spy);
    setState({ ...getState() });
    expect(spy).toHaveBeenCalled();
  });
});
