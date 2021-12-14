import e from "express";

export type UnionizeObj<Obj extends object> = {
  [Key in keyof Obj]: { type: Key; data: Obj[Key] };
}[keyof Obj];

export type ReducerFns<States extends object, Actions extends object> = {
  [Key in keyof States]: (
    state: { type: Key; data: States[Key] },
    action?: UnionizeObj<Actions> & { playerIndex: number }
  ) => UnionizeObj<States>;
};

export function createReducer<
  StateGlossary extends object,
  ActionGlossary extends object
>(reducerFns: ReducerFns<StateGlossary, ActionGlossary>) {
  type States = UnionizeObj<StateGlossary>;
  type Actions = UnionizeObj<ActionGlossary>;
  return function reducer(
    initialState: States,
    action?: Actions & { playerIndex: number }
  ) {
    const states: States[] = [
      reducerFns[initialState.type](initialState, action),
    ];
    let finished = false;
    while (!finished) {
      const lastState = states[states.length - 1];
      const nextState = reducerFns[lastState.type](lastState);
      if (lastState === nextState) {
        finished = true;
      } else {
        states.push(nextState);
      }
    }
    return states;
  };
}
