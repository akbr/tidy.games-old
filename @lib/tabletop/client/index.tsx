import { createSocketManager } from "@lib/socket";
import { createSubscription } from "@lib/state/subscription";
import { createMeter, MeterStatus, WaitFor } from "@lib/state/meter";

import { GameDefinition, Spec } from "../types";
import { ServerApi } from "../server";
import { RoomData, ServerActions } from "../server/";

import { Frame, getFrames, ConnectedActions, createActions } from "./helpers";

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

type GameProps<S extends Spec> = {
  frame: Frame<S>;
} & LobbyProps<S>;

type GameExProps<S extends Spec> = {
  meter: MeterStatus<Frame<S>>;
} & GameProps<S>;

type ViewProps<S extends Spec> =
  | ["title", TitleProps<S>]
  | ["lobby", LobbyProps<S>]
  | ["game", GameProps<S>]
  | ["gameEx", GameExProps<S>];

export function createClient<S extends Spec>(
  server: ServerApi<S> | string,
  def: GameDefinition<S>
) {
  const [subscribe, updateListeners] = createSubscription<ViewProps<S>>();
  const meter = createMeter<Frame<S>>();

  let room: RoomData = null;
  let frame: Frame<S>;
  let err: Err | undefined;

  const controls = {
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
    waitFor: meter.controls.waitFor,
  };

  const update = () => {
    const currFrame = meter.get().state;
    const frameUpdate = currFrame !== frame;
    frame = currFrame;

    const nextProps: ViewProps<S> | null = !room
      ? ["title", { controls, err }]
      : !currFrame
      ? ["lobby", { controls, err, room }]
      : frameUpdate
      ? ["game", { controls, err, room, frame }]
      : null;

    nextProps && updateListeners(nextProps);
    frame &&
      updateListeners([
        "gameEx",
        { controls, err, room, frame, meter: meter.get() },
      ]);
  };

  meter.subscribe(update);

  const socket = createSocketManager(server, {
    onmessage: ([type, payload]) => {
      if (type === "server") {
        room = payload;
        update();
      }
      if (type === "machine") {
        meter.push(...getFrames(payload));
      }
      if (type === "serverErr" || type === "machineErr") {
        err = { type, data: payload };
        update();
        err = undefined;
      }
    },
  });

  return { meter, subscribe, controls, update };
}
