import { createUseEmitter } from "@lib/emitter/useEmitter";
import { createServer } from "./server";
import { createController } from "./controller";

export const server = createServer();

export const controller = createController(server);

export const clientActions = controller.clientActions;

export const useTable = createUseEmitter(controller.tableState);
export const tableActions = controller.tableActions;

export const useCamera = createUseEmitter(controller.cameraState);
export const cameraActions = controller.cameraActions;
