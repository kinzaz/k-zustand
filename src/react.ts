import * as ReactExports from "react";
import { createStore } from "./vanilla";
import type { StateCreator, StoreApi } from "./vanilla.ts";

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, "getState" | "subscribe">;

type ExtractState<S> = S extends { getState: () => infer T } ? T : never;

type UseBoundStore<S extends ReadonlyStoreApi<unknown>> = (<U>(
  selector: (state: ExtractState<S>) => U
) => U) &
  S;

type Create = <T>(initializer: StateCreator<T>) => UseBoundStore<StoreApi<T>>;

const { useSyncExternalStore } = ReactExports;

const identity = <T>(arg: T): T => arg;

export function useStore<TState, StateSlice>(
  api: ReadonlyStoreApi<TState>,
  selector: (state: TState) => StateSlice = identity as any
) {
  const slice = useSyncExternalStore(api.subscribe, () =>
    selector(api.getState())
  );

  return slice;
}

const createImpl = <T>(createState: StateCreator<T>) => {
  const api = createStore(createState);

  const useBoundStore: any = (selector?: any) => useStore(api, selector);

  Object.assign(useBoundStore, api);

  return useBoundStore;
};

export const create = ((createState) => createImpl(createState)) as Create;
