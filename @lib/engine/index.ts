import { lastOf } from "@lib/array";

export type EngineTypes = {
  states: { type: string; data?: any };
  actions: { type: string; data?: any; player?: number };
  options: any;
};

export type Env = { numPlayers: number };

export type Update<ET extends EngineTypes> = {
  action: (ET["actions"] & { player?: number }) | null;
  states: ET["states"][];
  options: ET["options"];
  env: Env;
};

export interface Engine<ET extends EngineTypes> {
  getInitialUpdate: (env: Env, options: ET["options"]) => Update<ET> | string;
  getNextUpdate: (
    update: Update<ET>,
    action?: ET["actions"]
  ) => Update<ET> | null | string;
  adaptUpdate: (update: Update<ET>, player: number) => Update<ET>;
}

// ---

export type GetInitialState<ET extends EngineTypes> = (
  env: Env,
  options: ET["options"]
) => ET["states"] | string;

export type Chart<ET extends EngineTypes> = {
  [State in ET["states"] as State["type"]]: (
    state: State,
    context: {
      action: (ET["actions"] & { player?: number }) | null;
      options: ET["options"];
      env: Env;
    }
  ) => ET["states"] | string | null;
};

export function createEngine<ET extends EngineTypes>(
  getInitialState: GetInitialState<ET>,
  chart: Chart<ET>,
  adaptUpdate = ((x) => x) as Engine<ET>["adaptUpdate"]
): Engine<ET> {
  const getNextUpdate = createGetNextUpdate(chart);
  const getInitialUpdate = createGetInitialUpdate(
    getInitialState,
    getNextUpdate
  );
  // Return the API.
  return {
    getInitialUpdate,
    getNextUpdate,
    adaptUpdate,
  };
}

export const isErr = (arg: unknown): arg is string => typeof arg === "string";

const createGetNextUpdate =
  <ET extends EngineTypes>(chart: Chart<ET>): Engine<ET>["getNextUpdate"] =>
  (update, submittedAction) => {
    const nextStates: ET["states"][] = [];
    let finishedCollectingStates = false;
    const initialAction = submittedAction || null;
    let currentAction = initialAction;

    const { options, env } = update;
    while (!finishedCollectingStates) {
      const prevState = lastOf(nextStates) || lastOf(update.states);
      //@ts-ignore
      const nextState = chart[prevState.type](
        //@ts-ignore
        prevState,
        { action: currentAction, options, env }
      );
      currentAction = null;
      if (isErr(nextState)) return nextState;
      if (nextState !== null) {
        nextStates.push(nextState);
        continue;
      }
      finishedCollectingStates = true;
    }

    return nextStates.length > 0
      ? {
          action: initialAction,
          states: nextStates,
          options: update.options,
          env,
        }
      : null;
  };

const createGetInitialUpdate =
  <ET extends EngineTypes>(
    getInitialState: GetInitialState<ET>,
    getNextUpdate: Engine<ET>["getNextUpdate"]
  ) =>
  (env: Env, options: ET["options"]) => {
    let initialState = getInitialState(env, options);
    if (isErr(initialState)) return initialState;
    let initialRes = getNextUpdate({
      states: [initialState],
      action: null,
      env,
      options,
    });
    if (isErr(initialRes))
      return `First update failed with error message: ${initialRes}`;
    const states =
      initialRes === null
        ? [initialState]
        : [initialState, ...initialRes.states];
    const update: Update<ET> = { states, action: null, env, options };
    return update;
  };
