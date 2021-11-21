import type { Server, Socket } from "../socket/types";

// ------
// ENGINE
// ------
export type Msg = { type: string; [key: string]: any };

type Options = { [key: string]: any };

export type EngineTypesShape = {
  states: Msg;
  uiStates?: Msg;
  msgs: Msg;
  actions: Msg;
  options: Options | void;
  botOptions: Options | void;
};

export type Bot<States> = (
  state: States,
  botPlayerIndex: number | undefined
) => void;

export interface Engine<T extends EngineTypesShape> {
  shouldAddSeat?: (numSeats: number, gameStarted: boolean) => boolean;
  shouldRemoveSeat?: (numSeats: number, gameStarted: boolean) => boolean;
  shouldStart?: (numSeats: number) => boolean;
  autoStart?: boolean;
  getInitialState: (numSeats: number, options?: T["options"]) => T["states"];
  reducer: (
    state: T["states"],
    context: { numSeats: number },
    input?: {
      action: T["actions"];
      seatIndex: number;
    }
  ) => T["states"] | T["msgs"];
  isState: (x: Msg) => boolean;
  adapt?: (
    state: T["states"],
    seatIndex: number,
    numSeats: number
  ) => T["states"];
  createBot?: (
    socket: { send: (action: T["actions"]) => void; close: () => void },
    options: T["botOptions"]
  ) => Bot<T["states"]>;
}

// ---------------------
// SERVER STATES/ACTIONS
// ---------------------

export type PlayerInfo = {
  name: string;
  avatar: string;
};

export type RoomState = {
  type: "room";
  data: {
    id: string;
    seats: PlayerInfo[];
    spectators: number;
    seatIndex: number;
    started: boolean;
  } | null;
};

export type Error = {
  type: "error";
  data: string;
};

export type Join = {
  type: "join";
  data?: { id: string; seatIndex?: number };
};
export type Start<Options> = {
  type: "start";
  data?: Options;
};
export type AddBot<Options> = {
  type: "addBot";
  data?: Options;
};

export type ServerTypes<ET extends EngineTypesShape> = {
  states: RoomState;
  msgs: Error;
  actions: Join | Start<ET["options"]> | AddBot<ET["botOptions"]>;
};

export type OutputsWith<ET extends EngineTypesShape> =
  | ["engine", ET["states"]]
  | ["engineMsg", ET["msgs"]]
  | ["server", ServerTypes<ET>["states"]]
  | ["serverMsg", ServerTypes<ET>["msgs"]];

export type InputsWith<ET extends EngineTypesShape> =
  | ["engine", ET["actions"]]
  | ["server", ServerTypes<ET>["actions"]];

// -----------------
// SERVER COMPOSITES
// -----------------
export type ServerApi<ET extends EngineTypesShape> = Server<
  InputsWith<ET>,
  OutputsWith<ET>
>;

export type ServerSocket<ET extends EngineTypesShape> = Socket<
  OutputsWith<ET>,
  InputsWith<ET>
>;

export type BotSocket<ET extends EngineTypesShape> = Socket<
  InputsWith<ET>,
  OutputsWith<ET>
>;

export type Room<ET extends EngineTypesShape> = {
  id: string;
  seats: (ServerSocket<ET> | false)[];
  spectators: ServerSocket<ET>[];
  state: ET["states"] | false;
};

export type ServerContext<ET extends EngineTypesShape> = {
  engine: Engine<ET>;
  rooms: Map<string, Room<ET>>;
  sockets: Map<ServerSocket<ET>, string>;
  botSockets: Set<ServerSocket<ET>>;
  api: ServerApi<ET>;
};
