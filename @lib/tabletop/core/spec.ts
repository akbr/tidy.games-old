export type Phases = string;
export type Board = Record<string, any>;
export type Actions = { type: string; data?: any };
export type Options = Record<string, any> | null;
export type Refinements = Record<string, Partial<Board>>;

export type Spec = {
  board: { phase: string } & Board;
  actions: Actions;
  options: Options;
};

export type CreateSpec<
  I extends {
    phases: string;
    board: { phase?: never } & Board;
    actions: Actions;
    refineByPhase?: Record<string, { phase?: never } & Partial<I["board"]>>;
    options?: Options;
  }
> = {
  board: CreateGameStates<
    I["phases"],
    I["board"],
    I["refineByPhase"] extends Record<string, any> ? I["refineByPhase"] : {}
  >;
  actions: I["actions"];
  options: Fill<I["options"], null>;
};

// Utils
type Fill<Desired, Fallback> = undefined extends Desired ? Fallback : Desired;
type CreateGameStates<
  Phase extends string,
  BaseBoard extends Board,
  Refinements extends Record<string, any> = Record<string, any>
> = Phase extends string
  ? { phase: Phase } & BaseBoard & Refinements[Phase]
  : never;
