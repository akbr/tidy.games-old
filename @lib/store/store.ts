import { Subscription, createSubscription } from "./subscription";

export type StateSet<T> = (update: Partial<T>) => void;
export type CreateActions<T, U extends {}> = (
  set: StateSet<T>,
  get: () => T
) => U;

export function createStore<
  State extends Record<string, any>,
  Actions extends {}
>(
  initialState: State,
  createActions?: CreateActions<State, Actions>
): Subscription<State> & { actions: Actions } {
  const subscribable = createSubscription(initialState);
  const { get } = subscribable;
  const set: StateSet<State> = (update) => {
    subscribable.next({ ...get(), ...update });
  };
  return {
    ...subscribable,
    actions: createActions ? createActions(set, get) : ({} as Actions),
  };
}

export default createStore;
