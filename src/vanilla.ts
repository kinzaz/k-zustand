export type StateCreator<T> = (setState: StoreApi<T>["setState"]) => T;
type TPartial<T> = Partial<T> | ((state: T) => T | Partial<T>);
type SetStateInternal<T> = (partial: TPartial<T>) => void;

export interface StoreApi<T> {
  setState: SetStateInternal<T>;
  getState(): T;
  subscribe: (listener: () => void) => () => void;
}

type CreateStore = <T>(initializer: StateCreator<T>) => StoreApi<T>;

type CreateStoreImpl = <T>(initializer: StateCreator<T>) => StoreApi<T>;

export const createStore = ((createState) =>
  createStoreImpl(createState)) as CreateStore;

const createStoreImpl: CreateStoreImpl = (createState) => {
  type Listener = () => void;
  type TState = ReturnType<typeof createState>;

  let state: TState;
  const listeners: Set<Listener> = new Set();

  const getState: StoreApi<TState>["getState"] = () => state;

  const subscribe: StoreApi<TState>["subscribe"] = (listener) => {
    listeners.add(listener);

    return () => listeners.delete(listener);
  };

  const setState: StoreApi<TState>["setState"] = (partial) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;

    if (!Object.is(nextState, state)) {
      state = Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener());
    }
  };

  const api = { getState, subscribe, setState };
  state = createState(setState);

  return api;
};
