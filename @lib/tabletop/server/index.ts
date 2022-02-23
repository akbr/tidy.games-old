import type { Socket, SocketServer } from "@lib/socket";
import type { Spec, GameDefinition } from "../types";
import type { Step } from "../machine";

import { createMethods } from "./methods";

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

export type ServerApi<S extends Spec> = SocketServer<
  ServerOutputs<S>,
  ServerInputs<S>
>;

export function createServer<S extends Spec>(
  gameDefinition: GameDefinition<S>
) {
  const { joinRoom, startGame, submitAction, leaveRoom } =
    createMethods(gameDefinition);

  const server: ServerApi<S> = {
    onopen: (socket) => {
      socket.send(["server", null]);
    },
    onclose: (socket) => {
      leaveRoom(socket);
    },
    onmessage: (socket, [msgType, msg]) => {
      if (msgType === "server") {
        if (msg.type === "join") {
          leaveRoom(socket);
          const err = joinRoom(socket, msg.data?.id, msg.data?.seatIndex);
          if (err) socket.send(["serverErr", err]);
          return;
        }

        /**
        if (action.type === "addBot") {
          const res = addBot(socket, action.data);
          if (res) {
            return socket.send({ type: "serverMsg", data: res });
          }
          return;
        }
        **/

        if (msg.type === "start") {
          let err = startGame(socket, msg.data);
          console.log(err);
          if (err) socket.send(["serverErr", err]);
          return;
        }

        socket.send(["serverErr", "Invalid server action."]);
      }

      if (msgType === "machine") {
        const err = submitAction(socket, msg);
        if (err) socket.send(["serverErr", err]);
      }
    },
  };

  return server;
}
