import type { Socket, SocketServer } from "@lib/socket";
import type { Spec } from "..";
import type { Step } from "../machine";

export type ServerActions<S extends Spec> =
  | {
      type: "join";
      data?: { id: string; seatIndex?: number };
    }
  | { type: "addBot" }
  | { type: "start"; data: S["options"] };

export type RoomData = {
  id: string;
  seats: {
    name: string;
    avatar: string;
    connected: boolean;
  }[];
  player: number;
  started: boolean;
} | null;

export type ServerInputs<S extends Spec> =
  | ["machine", S["actions"]]
  | ["server", ServerActions<S>];

export type ServerOutputs<S extends Spec> =
  | ["machine", Step<S>]
  | ["machineErr", string]
  | ["server", RoomData]
  | ["serverErr", string];

export type ServerSocket<S extends Spec> = Socket<
  ServerOutputs<S>,
  ServerInputs<S>
>;

export type ClientSocket<S extends Spec> = Socket<
  ServerInputs<S>,
  ServerOutputs<S>
>;
