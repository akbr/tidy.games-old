import type { EngineTypes } from "@lib/engine";
import { createMachine } from "@lib/engine/machine";
import type { ServerContext, Room, ServerSocket, BotSocket } from ".";

import { getRandomRoomID, getSeatNumber } from "./utils";

export const createMethods = <ET extends EngineTypes>({
  engine,
  rooms,
  sockets,
}: ServerContext<ET>) => {
  const avatars = ["🦊", "🐷", "🐔", "🐻", "🐭", "🦁"];
  //const botAvatar = "🤖";

  function createRoom(id?: string) {
    const resolvedId = id ? id : getRandomRoomID();
    rooms.set(resolvedId, {
      id: resolvedId,
      seats: [],
      machine: null,
    });
    return rooms.get(resolvedId)!;
  }

  function getSocketRoom(socket: ServerSocket<ET>) {
    const id = sockets.get(socket);
    return id ? rooms.get(id) : undefined;
  }

  function sendStateUpdate(socket: ServerSocket<ET>) {
    const room = getSocketRoom(socket);
    if (!room || !room.machine) return;
    const seatNum = room.seats.indexOf(socket);
    socket.send({
      type: "engine",
      data: room.machine.getUpdate(seatNum),
    });
  }

  function broadcastStateUpdate(room: Room<ET>) {
    room.seats.forEach((socket) => {
      socket && sendStateUpdate(socket);
    });
  }

  function joinRoom(
    socket: ServerSocket<ET>,
    id?: string,
    requestedSeat?: number
  ) {
    const room = id ? rooms.get(id) || createRoom(id) : createRoom();
    if (!room) return "Could not create a room.";

    const seatIndex = getSeatNumber(room.seats, requestedSeat);

    if (typeof seatIndex === "string") return seatIndex;

    room.seats[seatIndex] = socket;
    sockets.set(socket, room.id);

    broadcastRoomStatus(room);
    sendStateUpdate(socket);
  }

  function broadcastRoomStatus({ id, seats, machine }: Room<ET>) {
    const modSeats = seats.map((socket, idx) => ({
      avatar:
        avatars[idx] /**socket && botSockets.has(socket) ? botAvatar :  */,
      name: `P${idx + 1}`,
    }));

    seats.forEach((socket, seatIndex) => {
      if (!socket) return;
      socket.send({
        type: "server",
        data: {
          id,
          seatIndex,
          seats: modSeats,
          started: machine ? true : false,
        },
      });
    });
  }

  function startGame(socket: ServerSocket<ET>, options?: ET["options"]) {
    const room = getSocketRoom(socket);

    if (!room) return "You're not even in a room!";
    if (room.seats.indexOf(socket) !== 0)
      return "You have to be the first player to start the game.";

    const machineContext = { numPlayers: room.seats.length };

    const response = createMachine(engine, machineContext, options);

    if (typeof response === "string") return response;

    room.machine = response;
    broadcastRoomStatus(room);
    broadcastStateUpdate(room);
  }

  function submitAction(socket: ServerSocket<ET>, action: ET["actions"]) {
    const room = getSocketRoom(socket);
    if (!room)
      return { type: "serverMsg", data: "You are not in a room." } as const;
    if (!room.machine)
      return {
        type: "serverMsg",
        data: "This room's game has not started.",
      } as const;
    const player = room.seats.indexOf(socket);

    const res = room.machine.submit(action, player);
    if (typeof res === "string")
      return { type: "engineMsg", data: res } as const;
    broadcastStateUpdate(room);
  }

  function leaveRoom(socket: ServerSocket<ET>) {
    const room = getSocketRoom(socket);
    if (!room) return "Socket is not connected to a room.";

    const seatIndex = room.seats.indexOf(socket);
    if (seatIndex !== -1) {
      room.seats[seatIndex] = null;
    } else {
      return "Socket is not in a seat. (Huh? This shouldn't happen.)";
    }

    sockets.delete(socket);
    //botSockets.delete(socket);
    socket.send({ type: "server", data: null });

    let roomIsEmpty =
      room.seats.filter((socket) => socket).length ===
      0; /**&& !botSockets.has(socket)) */

    if (roomIsEmpty) {
      room.seats.forEach((socket) => socket); /**&& botSockets.delete(socket) */
      rooms.delete(room.id);
    } else {
      broadcastRoomStatus(room);
    }
  }

  return {
    createRoom,
    getSocketRoom,
    broadcastRoomStatus,
    joinRoom,
    broadcastStateUpdate,
    startGame,
    leaveRoom,
    submitAction,
  };
};

/**
export const createBot = <ET extends EngineTypes>(
  ctx: ServerContext<ET>,
  id: string,
  options?: ET["botOptions"]
) => {
  const { engine, botSockets, api } = ctx;

  if (!engine.createBot) return;

  let serverSocket: ServerSocket<ET>;

  let botSocket: BotSocket<ET> = {
    send: (action) => {
      api.onInput(serverSocket, action);
    },
    close: () => api.onClose(serverSocket),
  };

  let botFn = engine.createBot(
    {
      send: (action) => botSocket.send({ type: "engine", data: action }),
      close: botSocket.close,
    },
    undefined
  );

  serverSocket = {
    send: ({ type, data }) => {
      if (type !== "engine") {
        if (type === "engineMsg")
          console.warn("Bot reiceived engine error", data);
        return;
      }
      let room = getRoomForSocket(ctx, serverSocket);
      let playerIndex = room ? room.seats.indexOf(serverSocket) : undefined;
      botFn(data, playerIndex);
    },
    close: () => api.onClose(serverSocket),
  };

  botSockets.add(serverSocket);

  api.onInput(serverSocket, {
    type: "server",
    data: {
      type: "join",
      data: { id },
    },
  });
}; */
