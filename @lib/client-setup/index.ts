import { EngineTypes } from "@lib/engine/types";
import { ServerApi, ServerOutputs, ServerInputs } from "@lib/server/types";
import { createSocketManager, SocketManager } from "@lib/socket/socketManager";
import { createMeter, Meter } from "@lib/timing";
import { createStore, StoreApi } from "@lib/store";

import { server, ServerSlice } from "./extensions/server";
import { dialog, DialogSlice } from "./extensions/dialog";
import { connectHashListener } from "./extensions/hash";

export type AppPrimitives<
  ET extends EngineTypes,
  StateShape extends object = StoreState<ET>
> = {
  manager: SocketManager<ServerInputs<ET>, ServerOutputs<ET>>;
  meter: Meter<ET["states"]>;
  store: StoreApi<StateShape>;
};

export type ServerState<ET extends EngineTypes> = ServerSlice<ET>;
export type DialogState<ET extends EngineTypes> = DialogSlice<ET>;
export type StoreState<ET extends EngineTypes> = ServerState<ET> &
  DialogState<ET>;

export const createAppScaffolding = <ET extends EngineTypes>(
  gameServer: ServerApi<ET> | string
) => {
  const api = {
    manager: createSocketManager(gameServer),
    store: createStore({
      ...server.createSlice<ET>(),
      ...dialog.createSlice<ET>(),
    }),
    meter: createMeter<ET["states"]>(),
  };

  const actions = {
    ...server.createActions(api),
    ...dialog.createActions(api),
    waitFor: api.meter.waitFor,
  };

  api.manager.openSocket();

  server.connectSlice(api);
  connectHashListener(api);

  return { api, actions };
};
