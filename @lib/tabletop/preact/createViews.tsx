import { render } from "preact";
import { Spec } from "../core";
import { Client } from "../client";
import { DevWrapper } from "@lib/meter/preact";
import { App, AppViews } from "./App";
import { setReceiver } from "@lib/globalUi";

export function createViews<S extends Spec>(
  client: Client<S>,
  $el: HTMLElement,
  views: AppViews<S>,
  options = { dev: false }
) {
  setReceiver(client.meter.actions.waitFor);
  const app = <App client={client} views={views} />;

  // Optionally configure dev environment.
  if (options.dev) client.meter.actions.setHistory(true);
  const vdom = options.dev ? (
    <DevWrapper meter={client.meter}>{app}</DevWrapper>
  ) : (
    app
  );

  render(vdom, $el);
}

export default createViews;
