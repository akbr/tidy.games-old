export type Phase = string;
export type Game = Record<string, any>;
export type Actions = { type: string; data?: any };
export type Options = Record<string, any> | null;
export type Analysis = Record<string, any> | null;

export type noChange = null;
export type finalState = true;

export type SpecInput = {
  phases: Phase;
  game: Game;
  actions: Actions;
  options?: Options;
  analysis?: Analysis;
  transitions?: Record<
    SpecInput["phases"],
    SpecInput["phases"] | noChange | finalState
  >;
  constraints?: Partial<Record<SpecInput["phases"], SpecInput["game"]>>;
};

export type Spec = {
  phases: Phase;
  game: Game;
  actions: Actions;
  options: Options;
  analysis: Analysis;
  // --
  states: [Spec["phases"], Spec["game"]];
  stateGlossary: Record<Spec["phases"], Spec["game"]>;
  patchGlossary: Record<
    Spec["phases"],
    Partial<Spec["game"]> | noChange | finalState
  >;
};

export type CreateSpec<I extends SpecInput> = _CreateSpec<I>;
export type _CreateSpec<
  I extends SpecInput,
  StateGlossary = {
    [Phase in I["phases"]]: I["constraints"] extends {}
      ? Fill<
          I["constraints"][Phase],
          I["game"],
          I["game"] & I["constraints"][Phase]
        >
      : I["game"];
  },
  Transitions = undefined extends I["transitions"] ? {} : I["transitions"]
> = {
  phases: I["phases"];
  game: I["game"];
  actions: I["actions"];
  options: Fill<I["options"], null>;
  analysis: Fill<I["analysis"], null>;
  stateGlossary: StateGlossary;
  states: {
    [Key in keyof StateGlossary]: [Key, StateGlossary[Key]];
  }[keyof StateGlossary];
  patchGlossary: CreatePatchGlossary<I["phases"], Transitions, StateGlossary>;
};

type CreatePatchGlossary<
  P extends Phase,
  Edges extends Record<string, any>,
  GameGlossary extends Record<string, any>
> = {
  [ThisPhase in P]: InsertPatch<
    ThisPhase,
    Fill<Edges[ThisPhase], ThisPhase | null | true>,
    GameGlossary
  >;
};

type InsertPatch<
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
