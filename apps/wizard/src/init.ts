if (process.env.NODE_ENV === "development") require("preact/debug");

import { setup } from "goober";
import { h } from "preact";
import { render } from "@lib/premix";
import { createServer } from "@lib/socket-server";
import { createAppPrimitives } from "@lib/socket-server-interface";
import {
  createDialogSlice,
  createServerSlice,
} from "@lib/socket-server-interface/storeSlices";
import { mixServerRes, mixHash } from "@lib/socket-server-interface/mixers";
import { initDragListeners } from "./initDragListeners";
import { createActions } from "./createActions";

import { engine } from "./engine";

import { App } from "./views/App";
import { StoreShape } from "./types";
import { Errors } from "./views/Errors";
import shallow from "zustand/shallow";

export function init() {
  // Init goober
  setup(h);

  // Create a server
  const isDev = location.port === "1234";
  const server = isDev
    ? createServer(engine)
    : location.origin.replace(/^http/, "ws");

  // Create a basic set of objects
  const storeTemplate = {
    ...createServerSlice(),
    ...createDialogSlice(),
  } as StoreShape;

  const appApi = createAppPrimitives(server, storeTemplate);
  const { store, manager, meter } = appApi;

  // Create the derivative stuff needed for views
  const actions = createActions(appApi);

  // Set up the views
  const $app = document.getElementById("app")!;
  store.subscribe(({ state, room, connected }, prev) => {
    if (
      shallow(
        { state, room, connected },
        { state: prev.state, room: prev.room, connected: prev.connected }
      )
    )
      return;
    render(h(App, { state, room, connected, actions }), $app, meter.waitFor);
  });

  const $errors = document.getElementById("errors")!;
  store.subscribe(({ err }) => {
    render(h(Errors, { err }), $errors, meter.waitFor);
  });

  // Open a connection to the server
  // (this API is questionable)
  manager.openSocket();

  // Add the functionality
  initDragListeners(appApi, $app);
  mixServerRes(appApi);
  mixHash(appApi);

  return { ...appApi, actions, server };
}
