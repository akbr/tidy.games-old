export type States = string;
export type Game = Record<string, any>;
export type Actions = { type: string; data?: any };
export type Options = Record<string, any> | null;

export type noChange = null;
export type finalState = true;

export type SpecInput = {
  states: States;
  game: Game;
  actions: Actions;
  options?: Options;
  edges?: Record<
    SpecInput["states"],
    SpecInput["states"] | noChange | finalState
  >;
  gameExtends?: Partial<Record<SpecInput["states"], SpecInput["game"]>>;
};

export type Spec = {
  states: States;
  game: Game;
  actions: Actions;
  options: Options;
  // --
  gameGlossary: Record<Spec["states"], Spec["game"]>;
  gameStates: [Spec["states"], Spec["game"]];
  gameStateReturns: Record<
    Spec["states"],
    Partial<Spec["game"]> | noChange | finalState
  >;
};

export type CreateSpec<I extends SpecInput> = _CreateSpec<I>;
export type _CreateSpec<
  I extends SpecInput,
  GameGlossary = {
    [State in I["states"]]: I["gameExtends"] extends {}
      ? Fill<
          I["gameExtends"][State],
          I["game"],
          I["game"] & I["gameExtends"][State]
        >
      : I["game"];
  },
  Edges = undefined extends I["edges"] ? {} : I["edges"]
> = {
  states: I["states"];
  game: I["game"];
  actions: I["actions"];
  options: Fill<I["options"], null>;
  gameGlossary: GameGlossary;
  gameStates: {
    [Key in keyof GameGlossary]: [Key, GameGlossary[Key]];
  }[keyof GameGlossary];
  gameStateReturns: CreateStateReturns<I["states"], Edges, GameGlossary>;
};

type CreateStateReturns<
  S extends States,
  Edges extends Record<string, any>,
  GameGlossary extends Record<string, any>
> = {
  [State in S]: InsertState<
    State,
    Fill<Edges[State], S | null | true>,
    GameGlossary
  >;
};

type InsertState<
  FromId extends string,
  ToId extends string | true | null,
  Ext extends Record<string, any>
> = ToId extends string ? [ToId, PartialPatch<Ext[FromId], Ext[ToId]>] : ToId;

type PartialPatch<
  In extends Record<string, any>,
  Out extends { [Key in keyof In]: any }
> = Partial<Out> & PatchOf<In, Out>;

type PatchOf<
  In extends Record<string, any>,
  Out extends { [Key in keyof In]: any }
> = Pick<
  Out,
  {
    [Key in keyof In]: In[Key] extends Out[Key] ? never : Key;
  }[keyof In]
>;

type Fill<Check, FallBack, Desired = Check> = undefined extends Check
  ? FallBack
  : Desired;
