export type Packet = { type: string; data?: any };
export type Options = { [key: string]: any };

export type EngineTypes = {
  states: Packet;
  msgs: Packet;
  actions: Packet;
  options: Options | void;
  botOptions: Options | void;
};

export interface Engine<
  ET extends EngineTypes,
  AllStates = ET["states"] | ET["msgs"]
> {
  shouldAddSeat?: (numSeats: number, gameStarted: boolean) => boolean;
  shouldRemoveSeat?: (numSeats: number, gameStarted: boolean) => boolean;
  shouldStart?: (numSeats: number) => boolean;
  autoStart?: boolean;
  getInitialState: (numSeats: number, options?: ET["options"]) => ET["states"];
  reducer: (
    state: AllStates,
    action?: ET["actions"] & { playerIndex: number }
  ) => AllStates[];
  isMsg: (state: AllStates) => boolean;
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
