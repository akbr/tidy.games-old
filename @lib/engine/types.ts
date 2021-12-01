export type Packet = { type: string; [key: string]: any };
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
    state: ET["states"],
    context: { numSeats: number },
    input?: {
      action: ET["actions"];
      seatIndex: number;
    }
  ) => ET["states"] | ET["msgs"];
  isState: <ReducerOutput extends Packet>(output: ReducerOutput) => boolean;
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
