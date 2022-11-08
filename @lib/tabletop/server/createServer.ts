import type { Socket, SocketServer } from "@lib/socket";
import type { Spec } from "../core/spec";
import type { Cart } from "../core/cart";
import type { CartUpdate } from "../core/store";
import { createRoutines, RoomData, SocketMeta } from "./routines";

export type ServerApi<S extends Spec> = SocketServer<
  ServerOutputs<S>,
  ServerInputs<S>
>;

export type ServerSocket<S extends Spec> = Socket<
  ServerOutputs<S>,
  ServerInputs<S>
>;

export type ClientSocket<S extends Spec> = Socket<
  ServerInputs<S>,
  ServerOutputs<S>
>;

export type ServerInputs<S extends Spec> =
  | { to: "cart"; msg: S["actions"] }
  | { to: "server"; msg: ServerActions<S> };

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
  | { type: "start"; data?: { options?: S["options"]; seed?: string } };

export type ServerOutputs<S extends Spec> = Partial<{
  cartErr: string;
  serverErr: string;
  room: RoomData | null;
  cartUpdate: CartUpdate<S>;
}>;

export const actionKeys = {
  setMeta: null,
  join: null,
  leave: null,
  addBot: null,
  start: null,
};

// ---

export function createServer<S extends Spec>(cart: Cart<S>) {
  const {
    setMeta,
    joinRoom,
    broadcastRoomStatusOf,
    startGame,
    addBot,
    submitAction,
    leaveRoom,
  } = createRoutines(cart);

  const server: ServerApi<S> = {
    onopen: (socket) => {},
    onclose: (socket) => {
      leaveRoom(socket);
    },
    onmessage: (socket, { to, msg }) => {
      if (to === "server") {
        if (msg.type === "setMeta") {
          setMeta(socket, msg.data);
          broadcastRoomStatusOf(socket);
          return;
        }

        if (msg.type === "join") {
          leaveRoom(socket);
          const serverErr = joinRoom(socket, msg.data?.id, msg.data?.seatIndex);
          if (serverErr) socket.send({ serverErr });
          return;
        }

        if (msg.type === "leave") {
          leaveRoom(socket);
          return;
        }

        if (msg.type === "addBot") {
          const serverErr = addBot(socket, server);
          if (serverErr) socket.send({ serverErr });
          return;
        }

        if (msg.type === "start") {
          let serverErr = startGame(socket, msg.data);
          if (serverErr) socket.send({ serverErr });
          return;
        }

        socket.send({ serverErr: "Invalid server action type." });
      }

      if (to === "cart") {
        const cartErr = submitAction(socket, msg);
        if (cartErr) socket.send({ cartErr });
      }
    },
  };

  return server;
}
