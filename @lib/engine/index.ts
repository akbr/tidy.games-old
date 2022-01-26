export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };

type UnionizeStates<Dict extends Record<string, any>> = {
  [Key in keyof Dict]: Dict[Key] extends undefined
    ? { type: Key }
    : { type: Key; data: Dict[Key] };
}[keyof Dict];

type UnionizeActions<Dict extends Record<string, any>> = {
  [Key in keyof Dict]: Dict[Key] extends undefined
    ? { type: Key; player?: number }
    : { type: Key; data: Dict[Key]; player?: number };
}[keyof Dict];

export type EngineTypes = {
  states: { type: string; data?: any };
  actions: { type: string; data?: any; player?: number };
  stateDict: Record<string, any>;
  options: any;
};

export type CreateEngineTypes<
  StateDict extends Record<string, any>,
  ActionDict extends Record<string, any>,
  Options extends any = void
> = {
  stateDict: StateDict;
  states: UnionizeStates<StateDict>;
  actions: UnionizeActions<ActionDict>;
  options: Options;
};

export type Chart<ET extends EngineTypes> = {
  [Key in keyof ET["stateDict"]]: (
    stateData: { type: Key; data: ET["stateDict"][Key] },
    action?: ET["actions"]
  ) => ET["states"] | string;
};

type InitCtx = { numPlayers: number };
export type GetInitialState<ET extends EngineTypes> = (
  ctx: InitCtx,
  options?: ET["options"]
) => ET["states"] | string;

export type Update<ET extends EngineTypes> = {
  action?: ET["actions"];
  states: ET["states"][];
};

type Next<ET extends EngineTypes> = (
  state: ET["states"],
  action?: ET["actions"]
) => Update<ET> | string | null;

export type Engine<ET extends EngineTypes> = {
  getInitialState: GetInitialState<ET>;
  next: Next<ET>;
};

export const createEngine = <ET extends EngineTypes>({
  getInitialState,
  chart,
}: {
  getInitialState: GetInitialState<ET>;
  chart: Chart<ET>;
}): Engine<ET> => ({
  getInitialState,
  next: createNext(chart),
});

export const isErr = (arg: unknown): arg is string => typeof arg === "string";

export const envelop = <T extends string, D>(type: T, data: D) => ({
  type,
  data,
});

export const createNext =
  <ET extends EngineTypes>(chart: Chart<ET>): Next<ET> =>
  (state, submittedAction) => {
    const states: ET["states"][] = [];
    let finished = false;
    let action = submittedAction;

    while (!finished) {
      const prevState = states[states.length - 1] || state;
      const nextState = chart[prevState.type](
        //@ts-ignore
        prevState,
        action
      );
      action = undefined;
      if (isErr(nextState)) return nextState;
      if (nextState !== prevState) {
        states.push(nextState);
        continue;
      }
      finished = true;
    }

    return states.length > 0 ? { action: submittedAction, states } : null;
  };

interface Machine<ET extends EngineTypes> {
  getUpdate: (player?: number) => Update<ET>;
  getState: (player?: number) => ET["states"];
  submit: (
    action: ET["actions"],
    player?: number
  ) => { type: "success"; data: Update<ET> } | { type: "err"; data: string };
}

export const createMachine = <ET extends EngineTypes>(
  engine: Engine<ET>,
  ctx: InitCtx,
  options?: ET["options"]
): { type: "success"; data: Machine<ET> } | { type: "err"; data: string } => {
  let update: Update<ET>;

  let initialState = engine.getInitialState(ctx, options);
  if (isErr(initialState)) return envelop("err", initialState);
  let initialUpdate = engine.next(initialState);
  if (isErr(initialUpdate))
    return envelop(
      "err",
      `Init failed on first update with error: ${initialUpdate}`
    );
  update =
    initialUpdate === null
      ? { states: [initialState] }
      : { states: [initialState, ...initialUpdate.states] };

  const machine: Machine<ET> = {
    getUpdate: (player) => update,
    submit: (action, player) => {
      action = { ...action, player };
      const prevState = update.states[update.states.length - 1];
      const res = engine.next(prevState, action);
      if (isErr(res)) return envelop("err", res);
      if (res === null)
        return envelop(
          "err",
          "State did not advance, but no error message was provided."
        );
      update = res;
      return envelop("success", update);
    },
    getState: (player) => {
      return update.states[update.states.length - 1];
    },
  };

  return envelop("success", machine);
};
