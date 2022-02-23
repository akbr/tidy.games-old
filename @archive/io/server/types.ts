import { EngineTypes, Segment } from "@lib/engine-turn";
import { Socket, SocketServer } from "@lib/socket";

export type ServerActions<ET extends EngineTypes> =
  | {
      type: "join";
      data?: { id: string; seatIndex?: number };
    }
  | { type: "addBot" }
  | { type: "start"; data?: ET["options"] };

export type RoomData = {
  id: string;
  seats: {
    name: string;
    avatar: string;
    connected: boolean;
  }[];
  seatIndex: number;
  started: boolean;
} | null;

export type ServerInputs<ET extends EngineTypes> =
  | ["engine", ET["actions"]]
  | ["server", ServerActions<ET>];

export type ServerOutputs<ET extends EngineTypes> =
  | ["engine", Segment<ET>]
  | ["engineMsg", string]
  | ["server", RoomData]
  | ["serverMsg", string];

export type ServerApi<ET extends EngineTypes> = SocketServer<
  ServerOutputs<ET>,
  ServerInputs<ET>
>;

export type ServerSocket<ET extends EngineTypes> = Socket<
  ServerOutputs<ET>,
  ServerInputs<ET>
>;
