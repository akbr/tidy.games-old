if (process.env.NODE_ENV === "development") require("preact/debug");

import { setup } from "goober";
import { h } from "preact";
import { render } from "@lib/premix";
import { createServer } from "@lib/server";
import { initDragListeners } from "./initDragListeners";
import { createActions } from "./createActions";

import { engine } from "./engine";

import { createAppScaffolding } from "@lib/client-setup";

import { App } from "./views/App";
import { Errors } from "./views/Errors";

export function init() {
  // Init goober
  setup(h);

  // Create a server
  const isDev = location.port === "1234";
  const server = isDev
    ? createServer(engine)
    : location.origin.replace(/^http/, "ws");

  const api = createAppScaffolding(server);
  const { store, meter } = api;

  const actions = createActions(api);

  // Set up the views
  const $app = document.getElementById("app")!;
  initDragListeners(api, $app);

  store.subscribe(
    ({ state, room, connected }) => ({ state, room, connected }),
    ({ state, room, connected }) =>
      render(h(App, { state, room, connected, actions }), $app, meter.waitFor)
  );

  const $errors = document.getElementById("errors")!;
  store.subscribe(
    ({ err }) => err,
    (err) => render(h(Errors, { err }), $errors, meter.waitFor)
  );

  return { ...api, actions, server };
}
