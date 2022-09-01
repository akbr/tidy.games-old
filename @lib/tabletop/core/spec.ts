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
};

export type CreateSpec<
  I extends {
    phases: string;
    game: Record<string, any> & { phase?: never };
    actions: { type: string; data?: any };
    options?: Options;
  }
> = {
  phases: I["phases"];
  game: I["game"];
  actions: I["actions"];
  options: Fill<I["options"], null>;
  states: { phase: I["phases"] } & I["game"];
};

// Utils
type Fill<Desired, Fallback> = undefined extends Desired ? Fallback : Desired;
