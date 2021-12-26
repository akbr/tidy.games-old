import type { EngineTypes, Glossary, ActionStubs } from "../engine";
import type {
  ServerTypes,
  ServerInputs,
  ServerOutputs,
  ServerActionGlossary,
  ServerApi,
} from "../server/types";
import { createSocketManager, SocketManager } from "../socket/socketManager";
import { createStore, StoreApi } from "@lib/store";
import { createMeter, Meter } from "@lib/timing";
import { patchWithPrev } from "./utils";

export interface Client<ET extends EngineTypes> {
  store: StoreApi<ClientState<ET>>;
  meter: Meter<ET["states"]>;
  manager: SocketManager<ServerInputs<ET>, ServerOutputs<ET>>;
  actions: {
    server: ConnectedActions<ServerActionGlossary<ET>>;
    engine: ConnectedActions<ET["actionGlossary"]>;
  };
}

export type ClientState<ET extends EngineTypes> = {
  state: ET["states"] | null;
  server: ServerTypes<ET>["states"]["data"];
  msg: ServerTypes<ET>["msgs"] | ET["msgs"] | null;
  connected: boolean;
  meter: boolean;
};

export type ConnectedActions<G extends Glossary> = {
  [Key in keyof G]: (data: G[Key]) => void;
};

export function createClient<ET extends EngineTypes>(
  server: ServerApi<ET> | string,
  engineActions: ActionStubs<ET["actionGlossary"]>
): Client<ET> {
  const manager = createSocketManager(server);

  const meter = createMeter<ET["states"]>();

  const initialState: ClientState<ET> = {
    connected: false,
    meter: false,
    state: null,
    server: null,
    msg: null,
  };
  const store = createStore(initialState);

  meter.subscribe((state) => {
    const lastState = store.get().state;
    if (lastState) {
      state.data = patchWithPrev(state.data, lastState.data);
    }
    store.set({ state });
  });

  meter.onStatus = (meter) => {
    store.set({ meter });
  };

  manager.onStatus = (connected) => {
    store.set({ connected });
  };

  manager.onData = (res) => {
    if (res.type === "engine") {
      meter.push(res.data);
    } else if (res.type === "engineMsg") {
      store.set({ msg: res.data });
    } else if (res.type === "server") {
      store.set({ server: res.data.data });
    } else if (res.type === "serverMsg") {
      store.set({ msg: res.data });
    }
  };

  manager.openSocket();

  const connectActions = <G extends Glossary>(
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

  const serverActions: ActionStubs<ServerActionGlossary<ET>> = {
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
