import { createStore } from "@lib/store/store";

const state = { score: 0, age: Date.now() };

export const createCountStore = () =>
  createStore(state, (set, get) => ({
    add: () => {
      set({ score: get().score + 1 });
    },
    updateAge: () => {
      set({ age: Date.now() });
    },
  }));
