export type Packet = { type: string; data?: any };
export type Options = { [key: string]: any };

export type EngineTypes = {
  states: Packet;
  msgs: Packet;
  actions: Packet;
  options: Options | void;
  botOptions: Options | void;
};

export type Bot<ET extends EngineTypes> = (
  state: ET["states"],
  botPlayerIndex: number | undefined
) => void;

export type Engine<ET extends EngineTypes> = {
  shouldAddSeat?: (numSeats: number, gameStarted: boolean) => boolean;
  shouldRemoveSeat?: (numSeats: number, gameStarted: boolean) => boolean;
  shouldStart?: (numSeats: number) => boolean;
  autoStart?: boolean;
  getInitialState: (numSeats: number, options?: ET["options"]) => ET["states"];
  reducer: (
    state: ET["states"] | ET["msgs"],
    action?: ET["actions"] & { playerIndex: number }
  ) => (ET["states"] | ET["msgs"])[];
  isMsg: (state: ET["states"] | ET["msgs"]) => boolean;
  adapt?: (
    state: ET["states"],
    seatIndex: number,
    numSeats: number
  ) => ET["states"];
  createBot?: (
    socket: { send: (action: ET["actions"]) => void; close: () => void },
    options: ET["botOptions"]
  ) => Bot<ET>;
};
