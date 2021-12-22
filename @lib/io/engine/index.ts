// Basic data shapers
export type Packet = { type: string; data?: any };
export type Glossary = Record<string, any>;
export type Options = Record<string, any>;
export type ActionStubs<G extends Glossary> = {
  [Key in keyof G]: null;
};

// Utilities
export type PacketsOf<Obj extends Glossary> = {
  [Key in keyof Obj]: { type: Key; data: Obj[Key] };
}[keyof Obj];

// Core types cluster
export type CreateEngineTypes<
  StateGlossary extends Glossary,
  MsgGlossary extends Glossary,
  ActionGlossary extends Glossary,
  ReducerOptions extends Options | void,
  BotOptions extends Options | void
> = {
  stateGlossary: StateGlossary;
  states: PacketsOf<StateGlossary>;
  msgGlossary: MsgGlossary;
  msgs: PacketsOf<MsgGlossary>;
  actionGlossary: ActionGlossary;
  actions: PacketsOf<ActionGlossary>;
  options: ReducerOptions;
  botOptions: BotOptions;
};

export type EngineTypes = {
  stateGlossary: Glossary;
  states: Packet;
  msgGlossary: Glossary;
  msgs: Packet;
  actionGlossary: Glossary;
  actions: Packet;
  options: Options | void;
  botOptions: Options | void;
};

export interface Engine<
  ET extends EngineTypes,
  StatesAndMsgs = ET["states"] | ET["msgs"]
> {
  shouldAddSeat?: (numSeats: number, gameStarted: boolean) => boolean;
  shouldRemoveSeat?: (numSeats: number, gameStarted: boolean) => boolean;
  shouldStart?: (numSeats: number) => boolean;
  autoStart?: boolean;
  getInitialState: (numSeats: number, options?: ET["options"]) => ET["states"];
  reducer: (
    state: StatesAndMsgs,
    action?: ET["actions"] & { playerIndex: number }
  ) => StatesAndMsgs[];
  isMsg: (state: StatesAndMsgs) => boolean;
  adapt?: (
    state: ET["states"],
    seatIndex: number,
    numSeats: number
  ) => ET["states"];
  createBot?: (
    socket: { send: (action: ET["actions"]) => void; close: () => void },
    options: ET["botOptions"]
  ) => (state: ET["states"], botPlayerIndex: number | undefined) => void;
}
