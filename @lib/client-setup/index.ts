import { EngineTypes } from "@lib/engine/types";
import { ServerApi, ServerOutputs, ServerInputs } from "@lib/server/types";
import { createMeter, Meter } from "@lib/timing";
import { createSocketManager, SocketManager } from "@lib/socket/socketManager";
import { createStore, StoreApi } from "@lib/store";

import {
  createServerSlice,
  connectServerSlice,
  createDialogSlice,
  ServerSlice,
  DialogSlice,
} from "./storeSlices";

import { connectHashListener } from "./mixers";

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
  server: ServerApi<ET> | string
): AppPrimitives<ET> => {
  const api = {
    manager: createSocketManager(server),
    store: createStore({
      ...createServerSlice<ET>(),
      ...createDialogSlice<ET>(),
    }),
    meter: createMeter<ET["states"]>(),
  };

  api.manager.openSocket();

  connectServerSlice(api);
  connectHashListener(api);

  return api;
};
