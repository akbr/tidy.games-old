import {
  EngineTypes,
  MachineSpec,
  Machine,
  Game,
  Segment,
  createMachine,
  createGame,
} from "@lib/engine-turn";
import type { ServerSocket } from "./types";

import { getRandomRoomID, getSeatNumber } from "./utils";

export type Room<ET extends EngineTypes> = {
  id: string;
  seats: (ServerSocket<ET> | null)[];
  machine: Machine<ET> | null;
  game: Game<ET> | null;
};

const listenerFromSocket =
  <ET extends EngineTypes>(socket: ServerSocket<ET>) =>
  (segment: Segment<ET> | string) => {
    if (typeof segment === "string") {
      socket.send(["engineMsg", segment]);
      return;
    }
    socket.send(["engine", segment]);
  };

export const createMethods = <ET extends EngineTypes>(
  machineSpec: MachineSpec<ET>
) => {
  const rooms: Map<string, Room<ET>> = new Map();
  const sockets: Map<ServerSocket<ET>, string> = new Map();

  const avatars = ["🦊", "🐷", "🐔", "🐻", "🐭", "🦁"];
  const botAvatar = "🤖";

  function createRoom(requestId?: string) {
    const id = requestId ? requestId : getRandomRoomID();
    const room: Room<ET> = {
      id,
      seats: [],
      machine: null,
      game: null,
    };
    rooms.set(id, room);
    return room;
  }

  function getSocketRoom(socket: ServerSocket<ET>) {
    const id = sockets.get(socket);
    return id ? rooms.get(id) : undefined;
  }

  function joinRoom(
    socket: ServerSocket<ET>,
    id?: string,
    requestedSeat?: number
  ) {
    const room = id ? rooms.get(id) || createRoom(id) : createRoom();
    const seatIndex = getSeatNumber(room.seats, requestedSeat);

    if (typeof seatIndex === "string") {
      return seatIndex;
    }

    room.seats[seatIndex] = socket;
    sockets.set(socket, room.id);

    broadcastRoomStatus(room);
    injectSocketToGame(socket);
  }

  function injectSocketToGame(socket: ServerSocket<ET>) {
    const room = getSocketRoom(socket);
    if (!room || !room.game) return;
    room.game.setPlayerFn(
      room.seats.indexOf(socket),
      listenerFromSocket(socket)
    );
  }

  function broadcastRoomStatus({ id, seats, game }: Room<ET>) {
    const modSeats = seats.map((socket, idx) => ({
      avatar: avatars[idx],
      name: `P${idx + 1}`,
      connected: socket ? true : false,
    }));

    seats.forEach((socket, seatIndex) => {
      if (!socket) return;
      socket.send([
        "server",
        {
          id,
          seatIndex,
          seats: modSeats,
          started: game ? true : false,
        },
      ]);
    });
  }

  function startGame(socket: ServerSocket<ET>, options?: ET["options"]) {
    const room = getSocketRoom(socket);

    if (!room) return "You're not even in a room!";
    if (room.seats.indexOf(socket) !== 0)
      return "You have to be the first player to start the game.";

    const machine = createMachine(machineSpec, {
      ctx: { numPlayers: room.seats.length, options },
    });

    if (typeof machine === "string") return machine;

    room.machine = machine;
    room.game = createGame(machine);
    broadcastRoomStatus(room);

    room.seats.forEach((socket, idx) => {
      socket && room.game?.setPlayerFn(idx, listenerFromSocket(socket));
    });
  }

  function submitAction(socket: ServerSocket<ET>, action: ET["actions"]) {
    const room = getSocketRoom(socket);
    if (!room) return "You are not in a room.";
    if (!room.game) return "This room's game has not started.";
    room.game.submit(room.seats.indexOf(socket), action);
  }

  function leaveRoom(socket: ServerSocket<ET>) {
    const room = getSocketRoom(socket);
    if (!room) return "Socket is not connected to a room.";

    const seatIndex = room.seats.indexOf(socket);
    if (seatIndex !== -1) {
      room.seats[seatIndex] = null;
      room.game?.setPlayerFn(seatIndex, null);
    } else {
      return "Socket is in a room but not in a seat. (Huh? This shouldn't happen.)";
    }

    sockets.delete(socket);
    socket.send(["server", null]);

    // TK Check for bot status
    // if empty : rooms.delete(room.id);
  }

  return {
    createRoom,
    getSocketRoom,
    broadcastRoomStatus,
    joinRoom,
    startGame,
    leaveRoom,
    submitAction,
  };
};

/**'
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

    
  function addBot(socket: ServerSocket<ET>) {
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
  } */
