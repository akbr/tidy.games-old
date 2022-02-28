import { createSocketManager, Socket } from "@lib/socket";
import { createSubscription } from "@lib/state/subscription";
import { createMeter, MeterStatus, WaitFor } from "@lib/state/meter";

import { GameDefinition, Frame, Spec } from "../types";
import { ServerApi, ServerInputs, ServerOutputs } from "../server";
import { RoomData, ServerActions } from "../server/";

import { getFrames, ConnectedActions, createActions } from "../helpers";

type Controls<S extends Spec> = {
  game: ConnectedActions<S["actions"]>;
  server: ConnectedActions<ServerActions<S>>;
  waitFor: WaitFor;
};

type Err = {
  type: "serverErr" | "machineErr";
  data: string;
};

type TitleProps<S extends Spec> = {
  err?: Err;
  controls: Controls<S>;
};

type LobbyProps<S extends Spec> = {
  room: RoomData;
} & TitleProps<S>;

export type GameProps<S extends Spec> = {
  frame: Frame<S>;
} & LobbyProps<S>;

export type GameExProps<S extends Spec> = {
  meter: MeterStatus<Frame<S>>;
} & GameProps<S>;

type ViewProps<S extends Spec> =
  | ["title", TitleProps<S>]
  | ["lobby", LobbyProps<S>]
  | ["game", GameProps<S>]
  | ["gameEx", GameExProps<S>];

export function createControls<S extends Spec>(
  socket: Socket<ServerInputs<S>, ServerOutputs<S>>,
  def: GameDefinition<S>
) {
  return {
    game: createActions<S["actions"]>(def.actionStubs, (action) => {
      socket.send(["machine", action]);
    }),
    server: createActions<ServerActions<S>>(
      {
        start: null,
        addBot: null,
        join: null,
      },
      (action) => {
        socket.send(["server", action]);
      }
    ),
  };
}

export function createClient<S extends Spec>(
  server: ServerApi<S> | string,
  def: GameDefinition<S>
) {
  const [subscribe, updateListeners] = createSubscription<ViewProps<S>>();
  const meter = createMeter<Frame<S>>();

  let room: RoomData | null = null;
  let frame: Frame<S>;
  let err: Err | undefined;

  const socket = createSocketManager(server);

  const controls = {
    ...createControls(socket, def),
    waitFor: meter.controls.waitFor,
  };

  function update(forceUpdate = false) {
    const currFrame = meter.get().state;
    const gameUpdated = forceUpdate || currFrame !== frame;
    frame = currFrame;

    const nextProps: ViewProps<S> | null = !room
      ? ["title", { controls, err }]
      : !currFrame
      ? ["lobby", { controls, err, room }]
      : gameUpdated
      ? ["game", { controls, err, room, frame }]
      : null;

    nextProps && updateListeners(nextProps);
    room &&
      frame &&
      updateListeners([
        "gameEx",
        { controls, err, room, frame, meter: meter.get() },
      ]);
  }

  socket.onmessage = ([type, payload]) => {
    if (type === "server") {
      room = payload;
      update();
    }
    if (type === "machine") {
      meter.push(...getFrames(payload));
    }
    if (type === "serverErr" || type === "machineErr") {
      err = { type, data: payload };
      update(true);
      err = undefined;
      update(true);
    }
  };

  meter.subscribe(() => update());

  return { meter, subscribe, controls, update };
}
