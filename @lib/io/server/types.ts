import type { EngineTypes } from "@lib/io/engine";
import { SocketServer } from "@lib/io/socket/types";

export type ServerApi<ET extends EngineTypes> = SocketServer<
  ServerInputs<ET>,
  ServerOutputs<ET>
>;

export type ServerInputs<ET extends EngineTypes> =
  | ["engine", ET["actions"]]
  | ["server", ServerTypes<ET>["actions"]];

export type ServerOutputs<ET extends EngineTypes> =
  | ["engine", ET["states"]]
  | ["engineMsg", ET["msgs"]]
  | ["server", ServerTypes<ET>["states"]]
  | ["serverMsg", ServerTypes<ET>["msgs"]];

export type ServerTypes<ET extends EngineTypes> = {
  states: RoomState;
  msgs: {
    type: "err";
    data: string;
  };
  actions:
    | {
        type: "join";
        data?: { id: string; seatIndex?: number };
      }
    | {
        type: "start";
        data: ET["options"];
      }
    | {
        type: "addBot";
        data: ET["options"];
      };
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
