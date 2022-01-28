import type { EngineTypes, Update } from "@lib/engine";
import { SocketServer } from "../socket/types";

export type ServerActions<ET extends EngineTypes> =
  | {
      type: "join";
      data?: { id: string; seatIndex?: number };
    }
  | { type: "start"; data: ET["options"] };

export type RoomData = {
  id: string;
  seats: {
    name: string;
    avatar: string;
  }[];
  seatIndex: number;
  started: boolean;
} | null;

export type ServerInputs<ET extends EngineTypes> =
  | { type: "engine"; data: ET["actions"] }
  | { type: "server"; data: ServerActions<ET> };

export type ServerOutputs<ET extends EngineTypes> =
  | { type: "engine"; data: Update<ET> }
  | { type: "engineMsg"; data: string }
  | { type: "server"; data: RoomData }
  | { type: "serverMsg"; data: string };

export type ServerApi<ET extends EngineTypes> = SocketServer<
  ServerInputs<ET>,
  ServerOutputs<ET>
>;
