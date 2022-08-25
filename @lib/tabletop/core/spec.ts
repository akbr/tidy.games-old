export type Phase = string;
export type Game = Record<string, any>;
export type Actions = { type: string; data?: any };
export type Options = Record<string, any> | null;
export type State = { phase: Phase } & Game;

export type NoChange = null;
export type FinalState = true;
export type Error = string;
export type NonStateReturns = NoChange | FinalState | Error;

export type Spec = {
  phases: Phase;
  game: Game;
  actions: Actions;
  options: Options;
  states: State;
  stateGlossary: Record<Phase, State>;
  patchGlossary: Record<Phase, State | NonStateReturns>;
};

export type CreateSpec<
  I extends {
    phases: string;
    game: Record<string, any> & { phase?: undefined };
    actions: { type: string; data?: any };
    options?: Options;
    transitions: { [Phase in I["phases"]]: I["phases"] | NonStateReturns };
    constraints: Partial<{ [Phase in I["phases"]]: Partial<I["game"]> }>;
  },
  StateGlossary = CreateStateGlossary<I["phases"], I["game"], I["constraints"]>
> = {
  phases: I["phases"];
  game: I["game"];
  actions: I["actions"];
  options: Fill<I["options"], null>;
  states: Unionize<StateGlossary>;
  stateGlossary: StateGlossary;
  patchGlossary: CreatePatchGlossary<
    I["phases"],
    I["transitions"],
    StateGlossary
  >;
};

type CreateStateGlossary<
  IPhase extends Phase,
  IGame extends Game,
  Constraints extends Record<string, any>
> = {
  [P in IPhase]: { phase: P } & IGame & Constraints[P];
};

type CreatePatchGlossary<
  IPhase extends Phase,
  Transitions extends Game,
  GameGlossary extends Record<string, any>
> = {
  [P in IPhase]: CreatePatch<P, Transitions[P], GameGlossary>;
};

type CreatePatch<
  FromPhase extends Phase,
  ToPhase extends Phase | FinalState | NoChange,
  GameGlossary extends Record<string, any>
> = ToPhase extends string
  ? PartialPatch<GameGlossary[FromPhase], GameGlossary[ToPhase]>
  : ToPhase;

type PartialPatch<
  In extends Record<string, any>,
  Out extends { [Key in keyof In]: any }
> = Partial<Out> & PatchOf<In, Out>;

// Utils

type Fill<Desired, Fallback> = undefined extends Desired ? Fallback : Desired;

type Unionize<T extends Record<string, any>> = {
  [K in keyof T]: T[K];
}[keyof T];

type PatchOf<
  In extends Record<string, any>,
  Out extends { [Key in keyof In]: any }
> = Pick<
  Out,
  {
    [Key in keyof In]: In[Key] extends Out[Key] ? never : Key;
  }[keyof In]
>;
