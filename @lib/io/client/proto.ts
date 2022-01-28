import { Engine, EngineTypes } from "@lib/engine";
import { createServer } from "@lib/io/server";
import { createClient, ActionStubs } from "@lib/io/client";

export function proto<ET extends EngineTypes>(
  engine: Engine<ET>,
  actionStubs: ActionStubs<ET["actions"]>,
  delay = 250
) {
  const server = createServer(engine);
  const clients = Array.from({ length: 6 }).map(() =>
    createClient(server, actionStubs)
  );

  const client = clients[0];
  const { store, meter } = client;

  store.subscribe((curr, prev) => {
    if (curr.server === prev.server) return;
    if (curr.server === null) return;
    console.log(
      `%c SERVER ` + `%c ${JSON.stringify(curr.server)}`,
      "background: green; color: white; font-weight: bold",
      ""
    );
  });

  store.subscribe((curr, prev) => {
    if (curr.frame === prev.frame) return;
    if (curr.frame === null) return;
    console.log(
      `%c FRAME ` +
        `%c ${curr.frame.state.type}` +
        `%c ${JSON.stringify(curr.frame.state.data)}` +
        ` ${JSON.stringify(curr.frame.action)}`,
      "background: purple; color: white; font-weight: bold",
      "background: #222; color: white; font-weight: bold",
      ""
    );
    meter.wait(delay);
  });

  store.subscribe((curr, prev) => {
    if (curr.msg === prev.msg) return;
    if (!curr.msg) return;
    console.log(
      `%c ERR ` + `%c ${JSON.stringify(curr.msg)}`,
      "background: red; color: white; font-weight: bold",
      ""
    );
  });

  const s = clients.map((client) => ({
    ...client.actions.server,
    ...client.actions.engine,
    getFrame: () => client.store.get().frame,
  }));

  return s;
}
