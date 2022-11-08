export type Phases = string;
export type Game = Record<string, any>;
export type Actions = { type: string; data?: any };
export type Options = Record<string, any> | null;
export type Refinements = Record<string, Partial<Game>>;

export type Spec = {
  game: { phase: string } & Game;
  actions: Actions;
  options: Options;
};

export type CreateSpec<
  I extends {
    phases: string;
    game: { phase?: never } & Game;
    actions: Actions;
    refineByPhase?: Record<string, { phase?: never } & Partial<I["game"]>>;
    options?: Options;
  }
> = {
  game: CreateGameStates<
    I["phases"],
    I["game"],
    I["refineByPhase"] extends Record<string, any> ? I["refineByPhase"] : {}
  >;
  actions: I["actions"];
  options: Fill<I["options"], null>;
};

// Utils
type Fill<Desired, Fallback> = undefined extends Desired ? Fallback : Desired;
type CreateGameStates<
  Phase extends string,
  BaseGame extends Game,
  Refinements extends Record<string, any> = Record<string, any>
> = Phase extends string
  ? { phase: Phase } & BaseGame & Refinements[Phase]
  : never;
