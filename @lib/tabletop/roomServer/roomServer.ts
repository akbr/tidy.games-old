import type { Socket, SocketServer } from "@lib/socket";
import type { Spec } from "../spec";
import type { Cart } from "../cart";
import type { Segment } from "../machine";

import { createMethods } from "./methods";

export type ServerApi<S extends Spec> = SocketServer<
  ServerOutputs<S>,
  ServerInputs<S>
>;

export type ServerInputs<S extends Spec> =
  | ["machine", S["actions"]]
  | ["server", ServerActions<S>];

export type ServerOutputs<S extends Spec> =
  | ["machine", Segment<S>]
  | ["machineErr", string]
  | ["server", RoomData | null]
  | ["serverErr", string];

export type ServerActions<S extends Spec> =
  | {
      type: "setMeta";
      data: SocketMeta;
    }
  | {
      type: "join";
      data?: { id: string; seatIndex?: number };
    }
  | { type: "leave" }
  | { type: "addBot" }
  | { type: "start"; data?: S["options"] };

export type SocketMeta = {
  avatar?: string;
  name?: string;
};

export type RoomData = {
  id: string;
  seats: (SocketMeta | null)[];
  player: number;
  started: boolean;
};

export type ServerSocket<S extends Spec> = Socket<
  ServerOutputs<S>,
  ServerInputs<S>
>;

export type ClientSocket<S extends Spec> = Socket<
  ServerInputs<S>,
  ServerOutputs<S>
>;

export const actionStubs = {
  start: null,
  addBot: null,
  join: null,
  leave: null,
  setMeta: null,
};

export type ServerOptions = { seed: string };

export function createServer<S extends Spec>(
  cart: Cart<S>,
  serverOptions?: ServerOptions
) {
  const {
    joinRoom,
    addBot,
    startGame,
    submitAction,
    leaveRoom,
    setMeta,
    broadcastRoomStatusFor,
  } = createMethods(cart, serverOptions);

  const server: ServerApi<S> = {
    onopen: () => {},
    onclose: (socket) => {
      leaveRoom(socket);
    },
    onmessage: (socket, [type, payload]) => {
      if (type === "server") {
        if (payload.type === "setMeta") {
          setMeta(socket, payload.data);
          broadcastRoomStatusFor(socket);
          return;
        }

        if (payload.type === "join") {
          leaveRoom(socket);
          const err = joinRoom(
            socket,
            payload.data?.id,
            payload.data?.seatIndex
          );
          if (err) socket.send(["serverErr", err]);
          return;
        }

        if (payload.type === "leave") {
          leaveRoom(socket);
          return;
        }

        if (payload.type === "addBot") {
          const res = addBot(socket, server);
          if (res) {
            return socket.send(["serverErr", res]);
          }
          return;
        }

        if (payload.type === "start") {
          let err = startGame(socket, payload.data);
          if (err) socket.send(["serverErr", err]);
          return;
        }

        socket.send(["serverErr", "Invalid server action."]);
      }

      if (type === "machine") {
        const err = submitAction(socket, payload);
        if (err) socket.send(["serverErr", err]);
      }
    },
  };

  return server;
}
export default createServer;
