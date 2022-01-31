import type { EngineTypes } from "@lib/engine";
import { createMachine } from "@lib/engine/machine";
import type { ServerContext, Room, ServerSocket } from ".";

import { getRandomRoomID, getSeatNumber } from "./utils";

export const createMethods = <ET extends EngineTypes>({
  engine,
  rooms,
  sockets,
  botSockets,
}: ServerContext<ET>) => {
  const avatars = ["🦊", "🐷", "🐔", "🐻", "🐭", "🦁"];
  const botAvatar = "🤖";

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
    console.log(botSockets);
    const modSeats = seats.map((socket, idx) => ({
      avatar: socket && botSockets.has(socket) ? botAvatar : avatars[idx],
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

  function addBot(socket: ServerSocket<ET>, options?: ET["botOptions"]) {
    const room = getSocketRoom(socket);

    if (!room) return "You're not even in a room!";
    if (room.seats.indexOf(socket) !== 0)
      return "You have to be the first player to add a bot.";
    if (!engine.createBot) return "This engine does not support bots.";

    const bot = engine.createBot(options);

    const botSocket: ServerSocket<ET> = {
      send: ({ type, data }) => {
        if (type === "engineMsg" || type === "serverMsg")
          console.warn("Bot received error", type, data);
        if (type !== "engine") return;

        const player = room.seats.indexOf(botSocket);

        const action = bot(data, player);
        if (action) {
          setTimeout(() => {
            submitAction(botSocket, action);
          }, 0);
        }
      },
      close: () => {
        leaveRoom(socket);
      },
    };
    botSockets.add(botSocket);
    const result = joinRoom(botSocket, room.id);
    if (result) return `Bot join error: ${result}`;
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
    botSockets.delete(socket);
    socket.send({ type: "server", data: null });

    let shouldCloseRoom =
      room.seats.filter((socket) => socket && !botSockets.has(socket))
        .length === 0;

    if (shouldCloseRoom) {
      // Clear the bots
      room.seats.forEach((socket) => {
        if (socket) {
          botSockets.delete(socket);
          sockets.delete(socket);
        }
      });
      rooms.delete(room.id);
    } else {
      broadcastRoomStatus(room);
    }
  }

  return {
    createRoom,
    getSocketRoom,
    addBot,
    broadcastRoomStatus,
    joinRoom,
    broadcastStateUpdate,
    startGame,
    leaveRoom,
    submitAction,
  };
};
