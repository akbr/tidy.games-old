import "@shared/base.css";
import { h } from "preact";
import { useStore } from "@lib/store/store";
import { createCountStore } from "./countStore";

type StoreProps = { store: ReturnType<typeof createCountStore> };

const Age = ({ store }: StoreProps) => {
  const age = useStore(store, (x) => x.age);

  return (
    <div class="p-5 bg-blue-400">
      <div>Age: {age}</div>
      <button class="cursor-pointer" onClick={store.actions.updateAge}>
        Update
      </button>
    </div>
  );
};

const Counter = ({ store }: StoreProps) => {
  const score = useStore(store, (x) => x.score);

  return (
    <div class="p-5 bg-purple-400">
      <div>Total: {score}</div>
      <button
        class="cursor-pointer"
        onClick={() => {
          store.actions.add();
        }}
      >
        Add
      </button>
    </div>
  );
};

const Both = ({ store }: StoreProps) => {
  const both = useStore(store, (x) => x);

  return (
    <div class="p-5 bg-orange-400">
      <div>{JSON.stringify(both)}</div>
    </div>
  );
};

export const App = ({ store }: StoreProps) => {
  return (
    <div>
      <Age store={store} />
      <Counter store={store} />
      <Both store={store} />
    </div>
  );
};
