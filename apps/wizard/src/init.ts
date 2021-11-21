import { setup } from "goober";
import { h } from "preact";

import { render } from "@lib/premix";
import { createServer } from "@lib/socket-server";
import { createInterface } from "@lib/socket-server-interface";
import { listenToHash } from "@lib/socket-server-interface/listenToHash";

import { WizardShape } from "./engine/types";
import { engine } from "./engine";
import { createActions } from "./actions";

import { AppOuter } from "./views/AppOuter";

export function init() {
  setup(h);

  const isDev = location.port === "1234";
  const server = isDev
    ? createServer(engine)
    : location.origin.replace(/^http/, "ws");

  const appInterface = createInterface<WizardShape>(server);
  const actions = createActions(appInterface);

  let { store, meter, manager } = appInterface;

  const $appRoot = document.getElementById("app")!;

  store.subscribe((frame, prevFrame) => {
    render(h(AppOuter, { frame, prevFrame, actions }), $appRoot, meter.waitFor);
  });

  manager.openSocket();

  listenToHash(appInterface);

  return { ...appInterface, actions, server };
}
