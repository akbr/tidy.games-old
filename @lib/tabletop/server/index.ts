import type { Socket, SocketServer } from "@lib/socket";
import type { Spec, GameDefinition } from "../types";
import type { Step } from "../machine";

import { createMethods } from "./methods";

export type ServerActions<S extends Spec> =
  | {
      type: "join";
      data?: { id: string; seatIndex?: number };
    }
  | { type: "leave" }
  | { type: "addBot" }
  | { type: "start"; data?: S["options"] };

export type RoomData = {
  id: string;
  seats: {
    name: string;
    avatar: string;
    connected: boolean;
  }[];
  player: number;
  started: boolean;
};

export type ServerInputs<S extends Spec> =
  | ["machine", S["actions"]]
  | ["server", ServerActions<S>];

export type ServerOutputs<S extends Spec> =
  | ["machine", Step<S>]
  | ["machineErr", string]
  | ["server", RoomData | null]
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

export type ServerOptions = { seed: string };

export const actionStubs = {
  start: null,
  addBot: null,
  join: null,
  leave: null,
};

export function createServer<S extends Spec>(
  gameDefinition: GameDefinition<S>,
  serverOptions?: ServerOptions
) {
  const { joinRoom, addBot, startGame, submitAction, leaveRoom } =
    createMethods(gameDefinition, serverOptions);

  const server: ServerApi<S> = {
    onopen: (socket) => {
      // This broken initial hash connect
      //socket.send(["server", null]);
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

        if (msg.type === "leave") {
          leaveRoom(socket);
          return;
        }

        if (msg.type === "addBot") {
          const res = addBot(socket, server);
          if (res) {
            return socket.send(["serverErr", res]);
          }
          return;
        }

        if (msg.type === "start") {
          let err = startGame(socket, msg.data);
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
