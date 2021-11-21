import type { EngineTypesShape, ServerApi } from "../socket-server/types";
import type { AppInterface } from "./types";

import { createSocketManager } from "../socket/socketManager";
import { createStore } from "./createStore";

export function createInterface<ET extends EngineTypesShape>(
  server: ServerApi<ET> | string
): AppInterface<ET> {
  const manager = createSocketManager(server);
  const { store, meter } = createStore<ET>(manager);
  return { manager, store, meter };
}
