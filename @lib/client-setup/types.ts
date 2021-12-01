import { EngineTypes } from "@lib/engine/types";
import type { ServerOutputs, ServerInputs } from "@lib/server/types";
import { SocketManager } from "@lib/socket/socketManager";
import type { Meter } from "@lib/timing";
import { StoreApi } from "@lib/store";

import type { ServerSlice, DialogSlice } from "./storeSlices";

export type ServerState<ET extends EngineTypes> = ServerSlice<ET>;
export type DialogState<ET extends EngineTypes> = DialogSlice<ET>;
export type StoreState<ET extends EngineTypes> = ServerState<ET> &
  DialogState<ET>;

export type AppPrimitives<
  ET extends EngineTypes,
  Shape extends object = StoreState<ET>
> = {
  manager: SocketManager<ServerInputs<ET>, ServerOutputs<ET>>;
  meter: Meter<ET["states"]>;
  store: StoreApi<Shape>;
};
