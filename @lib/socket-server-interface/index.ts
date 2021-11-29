import { EngineTypesShape } from "@lib/socket-server/types";
import { ServerApi } from "@lib/socket-server/types";
import { createMeter } from "@lib/timing";
import createStore from "zustand/vanilla";
import { createSocketManager } from "../socket/socketManager";

export const createAppPrimitives = <
  ET extends EngineTypesShape,
  StoreSlices extends {}
>(
  server: ServerApi<ET> | string,
  slices: StoreSlices
) => ({
  manager: createSocketManager(server),
  store: createStore(() => slices),
  meter: createMeter<ET["states"]>(),
});
