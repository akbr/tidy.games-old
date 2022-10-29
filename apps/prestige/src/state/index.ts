import { createUseSubscribable } from "@lib/subscribable";
import { createServer } from "./server";
import { createController } from "./controller";

export const server = createServer();

export const controller = createController(server);

export const clientActions = controller.clientActions;

export const useTable = createUseSubscribable(controller.tableState);
export const tableActions = controller.tableActions;

export const useCamera = createUseSubscribable(controller.cameraState);
export const cameraActions = controller.cameraActions;
