import { createMeter, WaitFor } from "@lib/state/meter";

import { GameDefinition, Spec } from ".";
import { createActions, ConnectedActions, Frame, getFrames } from "./utils";
import { ServerApi } from "./server";
import { RoomData, ServerActions } from "./server/types";
import { createSocketManager } from "@lib/socket";
import { createSubscription } from "@lib/state/subscription";

type ServerViewControls<S extends Spec> = {
  serverActions: ConnectedActions<ServerActions<S>>;
};

type GameViewControls<S extends Spec> = {
  actions: ConnectedActions<S["actions"]>;
  waitFor: WaitFor;
};

type Err = {
  type: "serverErr" | "machineErr";
  data: string;
};

type TitleProps<S extends Spec> = {
  err?: Err;
} & ServerViewControls<S>;

type LobbyProps<S extends Spec> = {
  room: RoomData;
  err?: Err;
} & ServerViewControls<S>;

type GameProps<S extends Spec> = {
  room: RoomData;
  err?: Err;
} & ServerViewControls<S> &
  GameViewControls<S> &
  Frame<S>;

type ViewProps<S extends Spec> =
  | ["title", TitleProps<S>]
  | ["lobby", LobbyProps<S>]
  | ["game", GameProps<S>];

export function createClient<S extends Spec>(
  server: ServerApi<S> | string,
  def: GameDefinition<S>
) {
  const [subscribe, updateListeners] = createSubscription<ViewProps<S>>();
  const meter = createMeter<Frame<S>>();

  let room: RoomData = null;
  let frame: Frame<S>;
  let err: Err | undefined;

  const actions = createActions<S["actions"]>(def.actionStubs, (action) => {
    socket.send(["machine", action]);
  });

  const serverActions = createActions<ServerActions<S>>(
    {
      start: null,
      addBot: null,
      join: null,
    },
    (action) => {
      socket.send(["server", action]);
    }
  );

  const waitFor = meter.controls.waitFor;

  const update = () => {
    const frame = meter.get().state;
    const nextProps: ViewProps<S> = !room
      ? ["title", { serverActions, err }]
      : !frame
      ? ["lobby", { serverActions, room, err }]
      : ["game", { room, serverActions, actions, waitFor, ...frame, err }];
    updateListeners(nextProps);
  };

  meter.subscribe((status) => {
    const nextFrame = status.state;
    if (nextFrame === frame) {
      console.warn("meter double-emitted");
      return;
    }
    frame = status.state;
    update();
  });

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

  return { meter, subscribe, actions, serverActions };
}
