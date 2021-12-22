import { EngineTypes } from ".";

export type ReducerFns<
  ET extends EngineTypes,
  CombinedGlossary = ET["stateGlossary"] & ET["msgGlossary"]
> = {
  [Key in keyof CombinedGlossary]: (
    state: { type: Key; data: CombinedGlossary[Key] },
    action?: ET["actions"] & { playerIndex: number }
  ) => ET["states"] | ET["msgs"];
};

export function createReducer<ET extends EngineTypes>(
  reducerFns: ReducerFns<ET>
) {
  return function reducer(
    initialState: ET["states"] | ET["msgs"],
    action?: ET["actions"] & { playerIndex: number }
  ) {
    const states: (ET["states"] | ET["msgs"])[] = [
      reducerFns[initialState.type](
        //@ts-ignore
        initialState as ET["states"] | ET["msgs"],
        action
      ),
    ];
    let finished = false;
    while (!finished) {
      const lastState = states[states.length - 1];

      //@ts-ignore
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
