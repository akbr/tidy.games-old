import type { Engine, EngineTypes, PacketsOf } from "../engine";
import { SocketServer } from "../socket/types";

export type ServerApi<ET extends EngineTypes> = SocketServer<
  ServerInputs<ET>,
  ServerOutputs<ET>
> & { engine: Engine<ET> };

export type ServerInputs<ET extends EngineTypes> =
  | { type: "engine"; data: ET["actions"] }
  | { type: "server"; data: ServerTypes<ET>["actions"] };

export type ServerOutputs<ET extends EngineTypes> =
  | { type: "engine"; data: ET["states"] }
  | { type: "engineMsg"; data: ET["msgs"] }
  | { type: "server"; data: ServerTypes<ET>["states"] }
  | { type: "serverMsg"; data: ServerTypes<ET>["msgs"] };

export type ServerActionGlossary<ET extends EngineTypes> = {
  join: { id: string; seatIndex?: number } | void;
  start: ET["options"] | void;
  addBot: ET["botOptions"] | void;
};

export type ServerTypes<ET extends EngineTypes> = {
  states: RoomState;
  msgs: {
    type: "err";
    data: string;
  };
  actions: PacketsOf<ServerActionGlossary<ET>>;
};

export type RoomState = {
  type: "room";
  data: {
    id: string;
    seats: {
      name: string;
      avatar: string;
    }[];
    spectators: number;
    seatIndex: number;
    started: boolean;
  } | null;
};
