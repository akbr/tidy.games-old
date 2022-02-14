type SpecOptions = {
  states: string;
  game: Record<string, any>;
  actions: { type: string; data?: any };
  options: Record<string, any> | null;
  edges?: {
    [Key in SpecOptions["states"]]: (SpecOptions["states"] | null | true)[];
  };
  gameTypes?: Partial<{
    [Key in SpecOptions["states"]]: Partial<SpecOptions["game"]>;
  }>;
};

export type Spec = {
  game: SpecOptions["game"];
  edges: NonNullable<SpecOptions["edges"]>;
  gameTypes: Record<SpecOptions["states"], SpecOptions["game"]>;
  gameStates: [SpecOptions["states"], SpecOptions["game"]];
  patches: [SpecOptions["states"], Partial<SpecOptions["game"]>];
  actions: SpecOptions["actions"];
  options: SpecOptions["options"];
};

type _CreateSpec<
  I extends SpecOptions,
  GameTypes = CreateGameTypes<
    I["states"],
    I["game"],
    I["gameTypes"] extends {} ? I["gameTypes"] : {}
  >,
  GameStates = CreateGameStates<GameTypes>,
  Options = I["options"] extends {} ? I["options"] : null,
  Edges = I["edges"] extends {} ? I["edges"] : {}
> = {
  game: I["game"];
  edges: Edges;
  gameTypes: GameTypes;
  patches: [I["states"], Partial<I["game"]>];
  gameStates: GameStates;
  actions: I["actions"];
  options: Options;
};

export type CreateSpec<Options extends SpecOptions> = _CreateSpec<Options>;

export type AuthenticatedAction<S extends Spec> = S["actions"] & {
  player: number;
  time: number;
};

export type Ctx<S extends Spec> = {
  numPlayers: number;
  options: S["options"];
  seed: string | null;
};

export type Chart<
  S extends Spec,
  StateReturns = CreateStateReturns<S["gameTypes"]>,
  ChartReturns = CreateEdgeReturns<StateReturns, S["edges"]>
> = {
  [Key in keyof S["gameTypes"]]: (
    game: S["gameTypes"][Key],
    ctx: Ctx<S>,
    action: AuthenticatedAction<S> | null
  ) => Key extends keyof ChartReturns ? ChartReturns[Key] : never;
};
export type ChartReturns<S extends Spec> = S["patches"] | null | string | true;

export type GameDefinition<S extends Spec> = {
  setup: (ctx: Ctx<S>) => S["gameStates"] | string;
  chart: Chart<S>;
  stripGame?: (patch: S["patches"], player: number) => S["patches"];
  stripAction?: (
    action: AuthenticatedAction<S>,
    player: number
  ) => AuthenticatedAction<S> | null;
};

type CreateGameTypes<
  States extends string,
  Game extends Record<string, any>,
  Exts extends Partial<{ [Key in States]: Partial<Game> }>
> = {
  [Key in States]: Exts extends {} ? Game & Exts[Key] : Game;
};

type CreateGameStates<GameTypes extends { [key: string]: any }> = {
  [Key in keyof GameTypes]: [Key, GameTypes[Key]];
}[keyof GameTypes];

type CreateEdgeReturns<
  StateReturns extends Record<string, any>,
  InputEdges extends Record<string, any>
> = {
  [Key in keyof StateReturns]: Key extends keyof InputEdges
    ? FromProperties<FillEdgeArray<InputEdges[Key], StateReturns[Key]>> | string
    : StateReturns[Key] | string | true | null;
};

type FillEdgeArray<A, B extends Record<string, any>> = {
  [Key in keyof A]: A[Key] extends string ? Extract<B, { 0: A[Key] }> : A[Key];
};

type IndexKeys<T extends readonly unknown[]> = Exclude<keyof T, keyof []>;
type FromProperties<T> = T extends any[]
  ? {
      [K in IndexKeys<T>]: T[K];
    }[IndexKeys<T>]
  : never;

type PatchOf<
  In extends Record<string, any>,
  Out extends { [Key in keyof In]: any }
> = Pick<
  Out,
  {
    [Key in keyof In]: In[Key] extends Out[Key] ? never : Key;
  }[keyof In]
>;

type CreateStateReturn<
  Input extends Record<string, any>,
  Output extends { [Key in keyof Input]: any }
> = Input extends Output
  ? Partial<Output>
  : Partial<Output> & PatchOf<Input, Output>;

type CreateStateReturns<GameTypes extends Record<string, any>> = {
  [InputKey in keyof GameTypes]: {
    [OutputKey in keyof GameTypes]: [
      OutputKey,
      CreateStateReturn<GameTypes[InputKey], GameTypes[OutputKey]>
    ];
  }[keyof GameTypes];
};
