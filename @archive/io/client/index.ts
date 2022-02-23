import type { EngineTypes, Update } from "@lib/engine";
import type {
  ServerInputs,
  ServerOutputs,
  ServerActions,
  ServerApi,
} from "../server/types";
import { createSocketManager, SocketManager } from "../socket/socketManager";
import { createStore, StoreApi } from "@lib/state/store";
import { createMeter, Meter } from "@lib/state/meter";
import { lastOf } from "@lib/array";

type Frame<ET extends EngineTypes> = Omit<Update<ET>, "states"> & {
  state: ET["states"];
};

export interface Client<ET extends EngineTypes> {
  store: StoreApi<ClientState<ET>>;
  meter: Meter<Frame<ET>>;
  manager: SocketManager<ServerInputs<ET>, ServerOutputs<ET>>;
  actions: {
    server: ConnectedActions<ServerActions<ET>>;
    engine: ConnectedActions<ET["actions"]>;
  };
}

export type ClientState<ET extends EngineTypes> = {
  update: Update<ET> | null;
  frame: Frame<ET> | null;
  server: Extract<ServerOutputs<ET>, { type: "server" }>["data"];
  msg: Extract<
    ServerOutputs<ET>,
    { type: "engineMsg" } | { type: "serverMsg" }
  > | null;
  connected: boolean;
  meter: boolean;
};

export type ConnectedActions<Obj extends { type: string; data?: any }> = {
  [X in Obj as X["type"]]: X["data"] extends Object | number | string | boolean
    ? (data: X["data"]) => void
    : (data?: X["data"]) => void;
};

export type ActionStubs<Obj extends { type: string; data?: any }> = {
  [X in Obj as X["type"]]: null;
};

export function createClient<ET extends EngineTypes>(
  server: ServerApi<ET> | string,
  engineActions: ActionStubs<ET["actions"]>
): Client<ET> {
  const manager = createSocketManager(server);

  const meter = createMeter<Frame<ET>>();

  const initialState: ClientState<ET> = {
    update: null,
    frame: null,
    connected: false,
    meter: false,
    server: null,
    msg: null,
  };
  const store = createStore(initialState);

  meter.subscribe((frame) => {
    store.set({ frame });
  });

  meter.subscribeStatus((meter) => {
    store.set({ meter });
  });

  manager.onData = (res) => {
    if (res.type === "engine") {
      const prevUpdate = store.get().update;
      const update = res.data;
      store.set({ update });
      const { states, action, ...rest } = update;

      if (action && prevUpdate) {
        meter.push({
          state: lastOf(prevUpdate.states),
          action,
          ...rest,
        });
      }

      states.forEach((state) => {
        meter.push({ state, action: null, ...rest });
      });
    } else if (res.type === "engineMsg") {
      store.set({ msg: res });
    } else if (res.type === "server") {
      store.set({ server: res.data });
    } else if (res.type === "serverMsg") {
      store.set({ msg: res });
    }
  };

  manager.openSocket();

  const connectActions = <G extends { type: string; data?: any }>(
    superType: string,
    actionFns: ActionStubs<G>
  ): ConnectedActions<G> => {
    const connectedActions = {} as ConnectedActions<G>;
    for (let key in actionFns) {
      //@ts-ignore
      connectedActions[key] = (data) => {
        manager.send({
          //@ts-ignore
          type: superType,
          //@ts-ignore
          data: { type: key, data },
        });
      };
    }
    return connectedActions;
  };

  const serverActions: ActionStubs<ServerActions<ET>> = {
    join: null,
    start: null,
    addBot: null,
  };

  return {
    store,
    meter,
    manager,
    actions: {
      server: connectActions("server", serverActions),
      engine: connectActions("engine", engineActions),
    },
  };
}
