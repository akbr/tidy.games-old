type StateShape = { type: string; data?: any };
type ActionShape = { type: string; data?: any; player?: number };
type DictShape = Record<string, any>;

type UnionizeStates<Dict extends DictShape> = {
  [Key in keyof Dict]: Dict[Key] extends undefined
    ? { type: Key }
    : { type: Key; data: Dict[Key] };
}[keyof Dict];

type UnionizeActions<Dict extends DictShape> = {
  [Key in keyof Dict]: Dict[Key] extends undefined
    ? { type: Key; player?: number }
    : { type: Key; data: Dict[Key]; player?: number };
}[keyof Dict];

export type EngineTypes = {
  stateDict: DictShape;
  states: StateShape;
  actionDict: DictShape;
  actions: ActionShape;
  options: any;
};

export type CreateEngineTypes<
  StateDict extends DictShape,
  ActionDict extends DictShape,
  Options extends any = void
> = {
  stateDict: StateDict;
  states: UnionizeStates<StateDict>;
  actionDict: ActionDict;
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
export type GetInitialState<
  ET extends EngineTypes,
  InitialState extends ET["states"] = ET["states"]
> = (ctx: InitCtx, options?: ET["options"]) => InitialState | string;

type StreamItem<ET extends EngineTypes> =
  | { type: "state"; data: ET["states"] }
  | { type: "action"; data: ET["actions"] };
type Stream<ET extends EngineTypes> = StreamItem<ET>[];

type Next<ET extends EngineTypes> = (
  state: ET["states"],
  action?: ET["actions"]
) => Stream<ET> | string | null;

type Adapt<ET extends EngineTypes> = <T extends StreamItem<ET>>(
  stateOrAction: T,
  player: number
) => T;

export type Engine<ET extends EngineTypes> = {
  getInitialState: GetInitialState<ET>;
  next: Next<ET>;
  adapt?: Adapt<ET>;
};

export const createEngine = <ET extends EngineTypes>({
  getInitialState,
  chart,
  adapt,
}: {
  getInitialState: GetInitialState<ET>;
  chart: Chart<ET>;
  adapt?: Adapt<ET>;
}): Engine<ET> => ({
  getInitialState,
  next: createNext(chart),
  adapt,
});

export const isErr = (arg: unknown): arg is string => typeof arg === "string";
export const getLastState = <ET extends EngineTypes>(stream: Stream<ET>) => {
  let streamObj = [...stream].reverse().find(({ type }) => type === "state") as
    | { type: "state"; data: ET["states"] }
    | undefined;
  return streamObj ? streamObj.data : undefined;
};

export const envelop = <T extends string, D>(type: T, data: D) => ({
  type,
  data,
});

export const createNext =
  <ET extends EngineTypes>(chart: Chart<ET>): Next<ET> =>
  (state, action) => {
    const stream: Stream<ET> = [];
    if (action) stream.push(envelop("action", action));

    const initialLength = stream.length;
    let finished = false;

    while (!finished) {
      const prevState = getLastState(stream) || state;
      const nextState = chart[prevState.type](
        //@ts-ignore
        prevState,
        action
      );
      action = undefined;
      if (isErr(nextState)) return nextState;
      if (nextState !== prevState) {
        stream.push(envelop("state", nextState));
        continue;
      }
      finished = true;
    }

    const stateChanged = stream.length !== initialLength;
    return stateChanged ? stream : null;
  };

type MachineRes<ET extends EngineTypes> =
  | { type: "stream"; data: Stream<ET> }
  | { type: "err"; data: string };
interface Machine<ET extends EngineTypes> {
  init: (ctx: InitCtx, options?: ET["options"]) => MachineRes<ET>;
  get: (playerPerpsective?: number) => MachineRes<ET>;
  submit: (action: ET["actions"]) => MachineRes<ET>;
}

export const createMachine = <ET extends EngineTypes>(
  engine: Engine<ET>
): Machine<ET> => {
  let stream: Stream<ET> | string = "Game not yet initiated.";

  return {
    init: (ctx, options) => {
      let initialState = engine.getInitialState(ctx, options);
      if (isErr(initialState)) return envelop("err", initialState);
      let nextStream = engine.next(initialState);
      if (isErr(nextStream)) return envelop("err", nextStream);
      stream = [envelop("state", initialState), ...(nextStream || [])];
      return envelop("stream", stream);
    },
    get: (player) => {
      if (isErr(stream)) return envelop("err", stream);
      const shouldAdapt = player !== undefined && engine.adapt;
      const adaptedStream = shouldAdapt
        ? stream.map((i) => engine.adapt!(i, player))
        : stream;
      return envelop("stream", adaptedStream);
    },
    submit: (action) => {
      if (isErr(stream)) return envelop("err", stream);
      const nextStream = engine.next(getLastState(stream)!, action);
      if (isErr(nextStream)) return envelop("err", nextStream);
      if (nextStream === null)
        return envelop(
          "err",
          "State did not advance, but no error message was provided."
        );
      stream = nextStream;
      return envelop("stream", nextStream);
    },
  };
};
