Example covering 99% cases

```ts
interface IBearStore {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
  updateBears: (newBears: number) => void;
}

const useStore = create<IBearStore>((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears) => set({ bears: newBears }),
}));

export default function App() {
  return (
    <>
      <BearCounter />
      <Controls />
      <RemoveAll />
      <Update />
    </>
  );
}

function BearCounter() {
  const bears = useStore((state) => state.bears);
  return <h1>{bears} around here...</h1>;
}

function Controls() {
  const increasePopulation = useStore((state) => state.increasePopulation);
  return <button onClick={increasePopulation}>add</button>;
}
function RemoveAll() {
  const remove = useStore((state) => state.removeAllBears);
  return <button onClick={remove}>remove</button>;
}
function Update() {
  const update = useStore((state) => state.updateBears);
  return <button onClick={() => update(10)}>update</button>;
}
```
