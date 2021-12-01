import type { EngineTypes } from "../engine/types";
import { SocketServer } from "@lib/socket/types";

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
  msgs: ErrorMsg;
  actions:
    | {
        type: "join";
        data?: { id: string; seatIndex?: number };
      }
    | {
        type: "start";
        data?: ET["options"];
      }
    | {
        type: "addBot";
        data?: ET["options"];
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

type ErrorMsg = {
  type: "error";
  data: string;
};
