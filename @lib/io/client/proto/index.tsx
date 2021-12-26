import { ActionStubs, Engine, EngineTypes } from "@lib/io/engine";
import { createServer } from "@lib/io/server";
import { createClient } from "@lib/io/client";

import { App } from "./views";
import { render } from "@lib/premix";

export function proto<ET extends EngineTypes>(
  $el: HTMLElement,
  engine: Engine<ET>,
  actionStubs: ActionStubs<ET["actionGlossary"]>
) {
  const server = createServer(engine);
  const clients = Array.from({ length: 6 }).map(() =>
    createClient(server, actionStubs)
  );

  const waitFor = clients[0].meter.waitFor;

  clients[0].store.subscribe(
    (x) => x,
    (curr, prev) => {
      render(<App curr={curr} prev={prev} />, $el, waitFor);
      waitFor(1000);
    }
  );

  const s = clients.map((client) => ({
    ...client.actions.server,
    ...client.actions.engine,
    getState: () => client.store.get().state,
  }));

  //@ts-ignore
  window.s = s;

  return s;
}
