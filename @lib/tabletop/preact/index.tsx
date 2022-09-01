import { render } from "preact";
import { Spec } from "../core";
import { Client } from "../client";
import { DevWrapper } from "@lib/meter";
import { App, AppViews } from "./App";
import { setReceiver } from "@lib/globalUi";

export function createView<S extends Spec>(
  client: Client<S>,
  $el: HTMLElement,
  views: AppViews<S>,
  options = { dev: false }
) {
  setReceiver(client.meter.actions.waitFor);

  const app = <App client={client} views={views} />;
  const vdom = options.dev ? (
    <DevWrapper meter={client.meter}>{app}</DevWrapper>
  ) : (
    app
  );

  render(vdom, $el);
}

export default createView;

export * from "./types";
