import { setup } from "goober";
import { h } from "preact";
import { render } from "@lib/premix";
import { createServer } from "@lib/socket-server";
import { createAppAPI } from "@lib/socket-server-interface";
import { mixHash } from "@lib/socket-server-interface/mixHash";
import { mixServerRes } from "@lib/socket-server-interface/mixServerRes";
import { initDragListeners } from "./initDragListeners";
import { createActions } from "./createActions";

import { WizardShape } from "./engine/types";
import { engine } from "./engine";

import { AppOuter } from "./views/AppOuter";

export function init() {
  setup(h);

  const isDev = location.port === "1234";
  const server = isDev
    ? createServer(engine)
    : location.origin.replace(/^http/, "ws");

  const appApi = createAppAPI<WizardShape>(server);
  let { store, meter, manager } = appApi;

  const $appRoot = document.getElementById("app")!;

  initDragListeners(appApi, $appRoot);

  const actions = createActions(appApi);

  store.subscribe((frame, prevFrame) => {
    render(h(AppOuter, { frame, prevFrame, actions }), $appRoot, meter.waitFor);
  });

  manager.openSocket();

  mixServerRes(appApi);
  mixHash(appApi);

  return { ...appApi, actions, server };
}
