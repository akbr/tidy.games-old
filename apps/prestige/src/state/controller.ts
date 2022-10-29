import type { Server } from "./server";
import { createClient } from "./client";
import { createTableState, createTableStateActions } from "./tableState";
import { createCameraActions, createCameraState } from "./cameraState";

export function createController(server: Server) {
  const tableState = createTableState();
  const tableActions = createTableStateActions(tableState);

  const clientActions = createClient(server, tableState, tableActions);

  const cameraState = createCameraState();
  const cameraActions = createCameraActions(cameraState);

  return {
    tableState,
    tableActions,
    clientActions,
    cameraState,
    cameraActions,
  };
}
